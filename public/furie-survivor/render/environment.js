import * as THREE from '../vendor/three.module.js';
import { GEO, TAU, material, flat, mesh, disc, ring, group, contactShadow, disposeModel } from './models.js';
import { paintedMaterial, fringeMaterial, pathMaterial, plazaMaterial } from './textures.js';
import { makeRift,updateRift } from './rifts.js';
import { createTerrainFeatures } from './terrain-features.js';
import { biomeAt,WORLD_RADIUS } from '../game/world.js';
export { biomeAt };

const CHUNK=12;
const BIOMES={
  forest:{ground:'#486f65',patch:'#8ba58a',dark:'#344f50',stone:'#a7b0a4',leaf:'#608d78',glow:'#d4c8a5'},
  crystal:{ground:'#626e86',patch:'#98a8bb',dark:'#47526f',stone:'#aebecd',leaf:'#a49bc4',glow:'#b6dce7'},
  desert:{ground:'#b3987c',patch:'#ccb595',dark:'#78635d',stone:'#d9c3a5',leaf:'#769b8e',glow:'#e7d2aa'},
  swamp:{ground:'#3e6267',patch:'#78958b',dark:'#2f4659',stone:'#8da3a3',leaf:'#648f86',glow:'#c9b7da'},
};
const seeded=seed=>{let n=seed>>>0;return()=>{n+=0x6d2b79f5;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};};
const inside=(x,z,b,margin=0)=>!b||(x>=b.minX-margin&&x<=b.maxX+margin&&z>=b.minZ-margin&&z<=b.maxZ+margin);
function sapling(parent,x,z,pal,size=1){
  const g=group(parent,x,0,z);g.scale.setScalar(size);
  contactShadow(g,.15,.08,1.2,.32);
  mesh(GEO.cylinder,paintedMaterial('wood','#705844'),0,.8,0,.12,1.6,.12,g);
  const canopy=group(g,0,1.3,0);mesh(GEO.round,material(pal.leaf),0,.4,0,.84,.8,.76,canopy);mesh(GEO.ball,material(pal.patch),-.22,.8,.02,.53,.48,.5,canopy);g.userData.canopy=canopy;return g;
}
function turf(parent,x,z,color,size,phase){
  const g=group(parent,x,.03,z);for(let i=0;i<3;i++){const blade=mesh(GEO.cone,material(color),Math.sin(i*2)*.09,.16,Math.cos(i*2)*.09,.045,.34,.025,g);blade.rotation.z=(i-1)*.3;}
  g.scale.setScalar(size);g.userData.phase=phase;return g;
}
function floorGeometry(x,z,coastRadius){
  if(Math.hypot(Math.abs(x)+6,Math.abs(z)+6)<coastRadius)return GEO.plane;
  let polygon=[[-6,-6],[6,-6],[6,6],[-6,6]];
  // Clip only coast chunks to the same circular island. Interior tiles stay at
  // two triangles, while the shore has a continuous edge instead of squares.
  for(let i=0;i<256&&polygon.length;i++){
    const a=i/256*TAU,nx=Math.sin(a),nz=Math.cos(a),next=[];
    for(let j=0;j<polygon.length;j++){
      const p=polygon[j],q=polygon[(j+1)%polygon.length],dp=coastRadius-(x+p[0])*nx-(z+p[1])*nz,dq=coastRadius-(x+q[0])*nx-(z+q[1])*nz;
      if(dp>=0)next.push(p);if((dp>=0)!==(dq>=0)){const t=dp/(dp-dq);next.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
    }polygon=next;
  }
  const vertices=[],uv=[],indices=[];for(const[px,pz]of polygon){vertices.push(px/12,-pz/12,0);uv.push(px/12+.5,-pz/12+.5);}for(let i=1;i<polygon.length-1;i++)indices.push(0,i+1,i);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function makeChunk(cx,cz,coastRadius){
  const g=group(),x=cx*CHUNK,z=cz*CHUNK,biome=biomeAt(x,z),pal=BIOMES[biome],rand=seeded((cx*73856093)^(cz*19349663)^6157);
  g.position.set(x,0,z);g.userData.wind=[];g.userData.motes=[];
  const geometry=floorGeometry(x,z,coastRadius),floor=mesh(geometry,paintedMaterial(biome,pal.ground,{flat:true}),0,-.018,0,CHUNK+.015,CHUNK+.015,1,g);floor.name='terrain:'+cx+':'+cz;floor.rotation.x=-Math.PI/2;floor.renderOrder=-140;floor.userData.uniqueGeometry=geometry!==GEO.plane;
  if(biomeAt(x+CHUNK,z)!==biome){const edge=mesh(GEO.plane,fringeMaterial(biome,pal.ground),6,.004,0,10,CHUNK+.04,1,g);edge.rotation.x=-Math.PI/2;edge.renderOrder=-100;}
  if(biomeAt(x,z+CHUNK)!==biome){const edge=mesh(GEO.plane,fringeMaterial(biome,pal.ground),0,.006,6,10,CHUNK+.04,1,g);edge.rotation.set(-Math.PI/2,0,-Math.PI/2);edge.renderOrder=-95;}

  // A repeating sparse road network gives long expeditions a useful landmark.
  const vertical=cx%8===0,horizontal=cz%8===0;
  if(vertical||horizontal){const path=mesh(geometry,pathMaterial(biome,vertical?(horizontal?'cross':'vertical'):'horizontal'),0,-.004,0,CHUNK,CHUNK,1,g);path.rotation.x=-Math.PI/2;path.renderOrder=-75;}
  for(let i=0;i<5;i++){
    const px=(rand()-.5)*11,pz=(rand()-.5)*11,wx=x+px,wz=z+pz;
    if(Math.hypot(wx,wz)<5.15||Math.hypot(wx,wz)>coastRadius-.8||(vertical&&Math.abs(px)<1.9)||(horizontal&&Math.abs(pz)<1.9))continue;
    if(biome==='crystal'){
      const crystal=mesh(GEO.gem,material(i%2?pal.leaf:pal.glow,.08),px,.2,pz,.1,.25+rand()*.3,.12,g);crystal.rotation.z=(rand()-.5)*.4;
      if(i%3===0)disc(flat('#c6eaff',.1),px,.006,pz,.6,g);
    }else if(biome==='desert'){
      const pebble=mesh(GEO.ball,paintedMaterial('stone',pal.stone),px,.07,pz,.15+rand()*.2,.1,.18,g);pebble.rotation.y=rand()*6;
      if(i===0){mesh(GEO.cylinder,material(pal.leaf),px,.35,pz,.12,.7,.13,g);mesh(GEO.box,material(pal.leaf),px+.17,.42,pz,.3,.12,.12,g);}
      else if(i%3===0)g.userData.wind.push(turf(g,px,pz,'#bfa771',1.2,rand()*6));
    }else if(biome==='swamp'){
      mesh(GEO.cylinder,material(pal.leaf),px,.2,pz,.04,.4,.04,g);mesh(GEO.ball,material(i%2?'#9e8bbf':'#e1ad8c'),px,.45,pz,.26,.16,.23,g);
      if(i%3===0){const puddle=disc(flat('#213f48',.3),px,.007,pz,.7+rand()*.5,g);puddle.scale.y=.65;}
    }else{
      g.userData.wind.push(turf(g,px,pz,i%2?pal.patch:pal.leaf,.7+rand()*.8,rand()*6));
      if(i%3===0){const stem=mesh(GEO.box,material('#aaba7b'),px+.16,.22,pz,.035,.27,.035,g);const flower=mesh(GEO.star,material(i%2?'#e6b49e':'#f8e7af'),px+.16,.37,pz,.09,.09,.09,g);flower.rotation.x=-.8;g.userData.wind.push(stem);}
    }
  }
  // Sparse moving motes are distinct in each region, without covering combat.
  for(let i=0;i<1;i++){
    const m=mesh(biome==='forest'?GEO.plane:GEO.gem,material(biome==='desert'?'#ead1a0':pal.glow,.1),(rand()-.5)*11,.8+rand()*1.4,(rand()-.5)*11,.035,.06,.035,g);
    m.userData={x:m.position.x,z:m.position.z,y:m.position.y,phase:rand()*TAU};g.userData.motes.push(m);
  }
  return g;
}
function makeObstacle(o,index){
  const biome=o.biome||biomeAt(o.x,o.z),pal=BIOMES[biome],g=group(),r=o.radius||1.3,type=o.type||(biome==='crystal'?'crystal':index%3?'tree':'pillar');g.position.set(o.x,0,o.z);
  contactShadow(g,.3,.2,r*1.7,.42,.8);
  if(type==='tree'){
    mesh(GEO.cylinder,paintedMaterial('wood','#6c4f37'),0,r*.65,0,r*.2,r*1.3,r*.2,g);
    // Roots and asymmetrical foliage give trees weight on the ground.
    for(let i=0;i<3;i++){const a=i*TAU/3;const root=mesh(GEO.cone,paintedMaterial('wood','#6c4f37'),Math.sin(a)*r*.25,r*.16,Math.cos(a)*r*.25,r*.13,r*.7,r*.13,g);root.rotation.z=Math.sin(a)*.65;root.rotation.x=Math.cos(a)*.65;}
    const canopy=group(g,0,r*.94,0);g.userData.canopy=canopy;
    if(biome==='swamp'){
      mesh(GEO.ball,material(pal.dark),0,r*.4,0,r*.9,r*.8,r*.85,canopy);for(const s of[-1,1])mesh(GEO.cone,material(pal.leaf),s*r*.55,0,.25,r*.13,r*1.4,r*.12,canopy).rotation.z=s*.15;
    }else if(biome==='desert'){
      for(let i=0;i<5;i++){const a=i/5*TAU;const leaf=mesh(GEO.cone,material(pal.leaf),Math.sin(a)*r*.42,r*.6,Math.cos(a)*r*.42,r*.23,r*1.4,r*.12,canopy);leaf.rotation.set(Math.cos(a)*1.1,0,-Math.sin(a)*1.1);}
    }else{
      mesh(GEO.ball,material(pal.leaf),0,r*.59,0,r*1.04,r*.86,r*.98,canopy);mesh(GEO.ball,material(pal.patch),-.27*r,r*1.03,.03,r*.7,r*.56,r*.66,canopy);
      mesh(GEO.ball,material('#9eaf8b'),r*.37,r*.68,.3,r*.48,r*.47,r*.5,canopy);
    }
  }else if(type==='crystal'){
    mesh(GEO.ball,paintedMaterial('stone',pal.dark),0,r*.3,0,r,r*.45,r*.85,g);for(let i=0;i<3;i++){const c=mesh(GEO.gem,material(i?pal.leaf:pal.glow,.08),(i-1)*r*.37,r*(i===1?1.2:.7),0,r*.36,r*(i===1?1.32:.8),r*.32,g);c.rotation.z=(i-1)*-.2;}
  }else if(type==='pillar'){
    mesh(GEO.cylinder,paintedMaterial('stone',pal.dark),0,.15,0,r*1.08,.3,r*1.08,g);mesh(GEO.box,paintedMaterial('stone',pal.stone),0,r*.95,0,r*1.15,r*1.8,r*1.15,g).rotation.y=.12;mesh(GEO.box,paintedMaterial('stone',pal.dark),0,r*1.89,0,r*1.46,.26,r*1.46,g).rotation.y=.12;
    mesh(GEO.box,material(pal.glow,.12),0,r*1.07,r*.59,.1,r*.63,.05,g);mesh(GEO.gem,material(pal.glow,.12),0,r*2.14,0,r*.2,r*.27,r*.2,g);
  }else{
    mesh(GEO.ball,paintedMaterial('stone',pal.dark),0,r*.46,0,r,r*.78,r*.92,g).rotation.y=index*1.83;mesh(GEO.ball,paintedMaterial('stone',pal.stone),-.16*r,r*.65,.1,r*.7,r*.5,r*.66,g);if(biome==='forest')mesh(GEO.ball,material(pal.leaf),.1,r*.91,-.06,r*.73,r*.3,r*.63,g);
  }
  return g;
}
const POI_COLORS={chest:'#dfc591',shrine:'#c2b1e8',camp:'#dba08a',well:'#a0d5d7',portal:'#c8b5ec'};
const POI_RADIUS={chest:1.7,shrine:3.3,camp:3.2,well:1.8,portal:4.5};
function makePoi(poi){
  if(poi.type==='portal')return makeRift(poi);
  const g=group(),type=poi.type,color=POI_COLORS[type]||'#ffd575',mat=material(color,.1),dark=paintedMaterial('stone','#465b69'),radius=POI_RADIUS[type];
  g.name='poi:'+poi.id;g.userData.poiId=poi.id;g.userData.poiType=type;contactShadow(g,.15,.05,1.8,.42);
  const halo=mesh(GEO.fineRing,flat(color,.58),0,.042,0,radius,radius,radius,g);halo.rotation.x=-Math.PI/2;g.userData.halo=halo;
  const fill=disc(flat(color,.06),0,.035,0,radius,g);g.userData.fill=fill;
  const progress=group(g);for(let i=0;i<12;i++){const segment=mesh(GEO.progress,flat('#e6d4ae',.85),0,.055,0,radius,radius,radius,progress);segment.rotation.set(-Math.PI/2,0,i*TAU/12);segment.visible=false;}g.userData.progress=progress;
  mesh(GEO.cylinder,dark,0,.12,0,type==='portal'?1.75:1.13,.24,type==='portal'?1.75:1.13,g);
  const decor=group(g);g.userData.decor=decor;
  if(type==='chest'){
    mesh(GEO.box,paintedMaterial('wood','#8c6040'),0,.55,0,1.15,.65,.78,decor);const lid=group(decor,0,.87,-.36);mesh(GEO.box,paintedMaterial('wood','#a67a4b'),0,.07,.36,1.2,.22,.84,lid);g.userData.lid=lid;
    for(const s of[-1,1]){mesh(GEO.box,mat,s*.4,.58,.42,.12,.62,.06,decor);mesh(GEO.box,mat,s*.4,.2,.36,.12,.09,.83,lid);}mesh(GEO.box,mat,0,.66,.45,.22,.23,.06,decor);mesh(GEO.gem,material('#fff1b4',.2),0,.68,.5,.07,.09,.04,decor);
  }else if(type==='shrine'){
    mesh(GEO.cylinder,paintedMaterial('stone','#637496'),0,.57,0,.48,.84,.48,decor);mesh(GEO.cylinder,mat,0,1.01,0,.7,.18,.7,decor);const crystal=mesh(GEO.gem,material(color,.3),0,1.9,0,.53,.82,.48,decor);g.userData.float=crystal;
    for(const s of[-1,1])mesh(GEO.gem,mat,s*.84,.74,0,.16,.45,.14,decor);
    for(let i=0;i<6;i++){const a=i*TAU/6;mesh(GEO.box,paintedMaterial('stone','#667789'),Math.sin(a)*2.7,.09,Math.cos(a)*2.7,.35,.18,.55,decor).rotation.y=a;}
  }else if(type==='camp'){
    mesh(GEO.cone,paintedMaterial('cloth','#bd7651'),0,.91,-.42,1.22,1.48,.82,decor).rotation.y=Math.PI/7;mesh(GEO.cone,material('#223e52'),0,.65,.23,.49,.94,.05,decor);
    mesh(GEO.cylinder,paintedMaterial('wood','#795b4b'),1.3,1.12,-.3,.055,2.2,.055,decor);g.userData.flag=mesh(GEO.box,paintedMaterial('cloth','#e6c06a'),1.64,1.95,-.3,.68,.45,.045,decor);
    for(const s of[-1,1])mesh(GEO.cylinder,paintedMaterial('wood','#704b32'),s*.12,.15,1.25,.09,.75,.09,decor).rotation.set(Math.PI/2,0,s*.5);
    const fire=group(decor,0,.17,1.25);mesh(GEO.cone,material('#ff9354',.35),0,.24,0,.28,.7,.26,fire);mesh(GEO.cone,material('#ffdc8c',.5),0,.15,.1,.17,.46,.14,fire);g.userData.fire=fire;
    g.userData.smoke=[];for(let i=0;i<3;i++){const smoke=mesh(GEO.ball,flat('#d8ddc5',.18),0,.8+i*.4,1.25,.15,.2,.15,decor);g.userData.smoke.push(smoke);}
  }else if(type==='well'){
    mesh(GEO.cylinder,paintedMaterial('stone','#9cb9bb'),0,.51,0,.83,.7,.83,decor);mesh(GEO.cylinder,dark,0,.9,0,.91,.15,.91,decor);disc(material('#62c4c8',.1),0,.99,0,.67,decor);
    g.userData.ripples=[];for(let i=0;i<3;i++)g.userData.ripples.push(ring(flat('#c6ffeb',.4),0,1.005+i*.002,0,.6,decor));
    g.userData.drops=[];for(let i=0;i<4;i++)g.userData.drops.push(mesh(GEO.gem,material('#bdfff0',.2),0,1,0,.04,.09,.04,decor));
    for(const s of[-1,1])mesh(GEO.cylinder,paintedMaterial('wood','#6d8071'),s*.81,1.32,0,.08,1.1,.08,decor);mesh(GEO.box,paintedMaterial('wood','#86a397'),0,1.91,0,1.92,.16,.33,decor);
  }
  const beacon=group(g,0,type==='portal'?4.1:type==='shrine'?3.3:2.4,0);mesh(GEO.gem,material(color,.24),0,0,0,.18,.3,.18,beacon);g.userData.beacon=beacon;
  const complete=group(g,0,1.6,.2);for(const [x,y,l,a]of[[-.13,0,.32,-.65],[.12,.13,.62,.65]])mesh(GEO.box,material('#d5f4a0',.1),x,y,0,.08,l,.06,complete).rotation.z=a;complete.visible=false;g.userData.complete=complete;return g;
}
export function createEnvironment(scene,{software=false,reducedMotion=false}={}){
  const layer=group(scene),chunks=new Map(),obstacles=new Map(),pois=new Map();let obstacleRun='',lastCenter='',poiRun='',worldRadius=0;
  const features=createTerrainFeatures(layer);
  const water=mesh(GEO.plane,paintedMaterial('water','#344e70',{flat:true}),0,-.67,0,1,1,1,layer);water.rotation.x=-Math.PI/2;water.renderOrder=-2500;
  const islandGeometry=new THREE.CylinderGeometry(1,1,1,256),island=mesh(islandGeometry,paintedMaterial('stone','#4b6170'),0,-1.3,0,1,2.2,1,layer);island.userData.uniqueGeometry=true;island.renderOrder=-2000;
  const shoreline=[];for(let i=0;i<3;i++){const r=mesh(new THREE.RingGeometry(1,1.1,256),flat('#b1c9cc',.18-i*.035),0,-.57+i*.015,0,1,1,1,layer);r.rotation.x=-Math.PI/2;r.userData.uniqueGeometry=true;shoreline.push(r);r.renderOrder=-1800;}
  const boundary=mesh(new THREE.RingGeometry(1,1.1,256),flat('#c9c5af',.25),0,.015,0,1,1,1,layer);boundary.rotation.x=-Math.PI/2;boundary.renderOrder=-35;boundary.userData.uniqueGeometry=true;
  function sizeWorld(radius){
    const next=Math.max(24,Number(radius)||WORLD_RADIUS);if(worldRadius===next)return;worldRadius=next;lastCenter='';
    for(const g of chunks.values()){layer.remove(g);disposeModel(g);}chunks.clear();
    water.scale.set((worldRadius+85)*2,(worldRadius+85)*2,1);island.scale.set(worldRadius+3.3,2.2,worldRadius+3.3);
    boundary.geometry.dispose();boundary.geometry=new THREE.RingGeometry(worldRadius-.08,worldRadius+.08,256);
    for(let i=0;i<shoreline.length;i++){const g=shoreline[i],r=worldRadius+3.8+i*1.6;g.geometry.dispose();g.geometry=new THREE.RingGeometry(r-.27,r+.27,256);}
  }
  const home=group(layer);contactShadow(home,.2,.3,5.6,.29,.85);
  const plaza=disc(plazaMaterial(),0,.015,0,4.65,home);plaza.renderOrder=-70;
  const plazaRim=mesh(GEO.fineRing,flat('#c5c4b0',.75),0,.032,0,4.61,4.61,4.61,home);plazaRim.rotation.x=-Math.PI/2;plazaRim.renderOrder=-30;
  for(let i=0;i<8;i++){const a=i/8*TAU;mesh(GEO.softBox,paintedMaterial('stone','#adb6af'),Math.sin(a)*4.5,.07,Math.cos(a)*4.5,.45,.13,.35,home).rotation.y=a;}
  const homeTrees=[sapling(home,5.1,-2.7,BIOMES.forest,1.65),sapling(home,-4.8,-3.7,{...BIOMES.forest,leaf:'#7e8d9d',patch:'#aaa9bf'},1.27)];
  for(const s of[-1,1]){contactShadow(home,s*2.32,-5.2,.95,.36);mesh(GEO.softBox,paintedMaterial('stone','#909fa3'),s*2.32,1.12,-5.2,.62,2.24,.7,home);mesh(GEO.cylinder16,paintedMaterial('stone','#bbb9ad'),s*2.32,.13,-5.2,.49,.26,.49,home);for(let i=0;i<3;i++)mesh(GEO.ball,material(i%2?'#809b84':'#597b70'),s*2.32+.29,2.2-i*.4,-4.79,.2,.2,.08,home);}
  const archGeometry=new THREE.TorusGeometry(1,.15,5,22,Math.PI),arch=mesh(archGeometry,paintedMaterial('stone','#b8b7b4'),0,2.17,-5.2,2.32,1.43,2.2,home);arch.userData.uniqueGeometry=true;
  const archGem=mesh(GEO.gem,material('#cab9e0',.08),0,3.59,-4.95,.2,.31,.14,home);
  for(const side of[-1,1]){const lantern=group(home,side*3.6,0,1.7);contactShadow(lantern,0,.05,.42,.28);mesh(GEO.cylinder,paintedMaterial('wood','#6f6065'),0,.55,0,.055,1.1,.055,lantern);mesh(GEO.softBox,material('#e2c79d',.12),0,1.17,0,.25,.38,.25,lantern);mesh(GEO.cone,material('#46566c'),0,1.44,0,.23,.18,.23,lantern);disc(flat('#e9c99a',.06),0,.04,0,.78,lantern);}
  const fireflies=[];for(let i=0;i<8;i++){const a=i/8*TAU,r=3+i%3;const f=mesh(GEO.gem,material('#e5d8b6',.14),Math.cos(a)*r,.6,Math.sin(a)*r,.036,.055,.036,home);f.userData.angle=a;fireflies.push(f);}
  function updateChunks(x,z,bounds){
    const cx=Math.round(x/CHUNK),cz=Math.round(z/CHUNK),rx=Math.ceil(bounds?(bounds.maxX-bounds.minX)/2/CHUNK:2)+1,rz=Math.ceil(bounds?(bounds.maxZ-bounds.minZ)/2/CHUNK:2)+1,key=[cx,cz,rx,rz].join(':');if(key===lastCenter)return;lastCenter=key;
    const wanted=new Set();for(let dx=-rx;dx<=rx;dx++)for(let dz=-rz;dz<=rz;dz++){const tx=cx+dx,tz=cz+dz;if(Math.hypot(tx*CHUNK,tz*CHUNK)>worldRadius+12)continue;const id=tx+':'+tz;wanted.add(id);if(!chunks.has(id)){const g=makeChunk(tx,tz,worldRadius+3.3);chunks.set(id,g);layer.add(g);}}
    for(const[id,g]of chunks)if(!wanted.has(id)){layer.remove(g);disposeModel(g);chunks.delete(id);}
  }
  function updateObstacles(state,bounds,time){
        const list=state.obstacles||[],run=String(state.runId??state.seed??'');if(run!==obstacleRun){for(const g of obstacles.values()){layer.remove(g);disposeModel(g);}obstacles.clear();obstacleRun=run;}
    const visible=new Set();for(let i=0;i<list.length;i++){
      const o=list[i];if(!inside(o.x,o.z,bounds,9))continue;
      const id=o.id??`${o.type}:${o.x}:${o.z}`,signature=[o.type,o.radius,o.biome,o.x,o.z].join(':');visible.add(id);
      let g=obstacles.get(id);if(g&&g.userData.signature!==signature){layer.remove(g);disposeModel(g);obstacles.delete(id);g=null;}
      if(!g){g=makeObstacle(o,i);g.name='obstacle:'+id;g.userData.signature=signature;obstacles.set(id,g);layer.add(g);}
      g.visible=true;if(g.userData.canopy){g.userData.canopy.rotation.z=Math.sin(time*1.15+o.x)*.018;g.userData.canopy.rotation.x=Math.sin(time*.8+o.z)*.012;}
    }
    for(const[id,g]of obstacles)if(!visible.has(id)){layer.remove(g);disposeModel(g);obstacles.delete(id);}
  }
  function update(state,x,z,time,isMenu,bounds){
    const windTime=reducedMotion?0:time;
    sizeWorld(state.arenaRadius);updateChunks(x,z,bounds);updateObstacles(state,bounds,windTime);features.update(state,time,bounds,{isMenu,reduced:reducedMotion});home.visible=inside(0,0,bounds,12);
    const coastVisible=Math.hypot(x,z)>worldRadius-90;island.visible=coastVisible;water.visible=coastVisible;boundary.visible=coastVisible;for(const r of shoreline)r.visible=coastVisible;
    archGem.rotation.y=windTime*.18;
    for(const tree of homeTrees)tree.userData.canopy.rotation.z=Math.sin(windTime+tree.position.x)*.025;
    for(let i=0;i<fireflies.length;i++){const f=fireflies[i],a=f.userData.angle;f.position.y=.7+Math.sin(windTime*1.4+i)*.3;f.position.x=Math.cos(a+windTime*.035)*(3+i%3);}
    for(let i=0;i<shoreline.length;i++){const r=shoreline[i],wave=Math.sin(windTime*.45+i)*.32;r.scale.setScalar(1+wave/(worldRadius+3.8+i*1.6));}
    for(const chunk of chunks.values()){
      const close=inside(chunk.position.x,chunk.position.z,bounds,9);chunk.visible=close;if(!close)continue;
      for(const t of chunk.userData.wind)t.rotation.z=Math.sin(windTime*1.7+(t.userData.phase||0)+chunk.position.x)*.055;
      for(const m of chunk.userData.motes){const u=m.userData;m.position.set(u.x+Math.sin(windTime*.33+u.phase)*.65,u.y+Math.sin(windTime*.7+u.phase)*.25,u.z+Math.cos(windTime*.3+u.phase)*.5);m.rotation.set(windTime*.4+u.phase,windTime*.3,windTime*.5);}
    }
    const run=String(state.runId??state.seed??'');if(poiRun!==run){for(const g of pois.values()){layer.remove(g);disposeModel(g);}pois.clear();poiRun=run;}
    const alive=new Set();for(const p of state.pois||[]){
      if(p.phase==='expired'||!inside(p.x,p.z,bounds,8))continue;
      alive.add(p.id);let g=pois.get(p.id);
      if(g&&(g.userData.poiType!==p.type||(p.type==='portal'&&g.userData.visualTier!==Math.max(1,Math.floor(p.tier)||1)))){layer.remove(g);disposeModel(g);pois.delete(p.id);g=null;}
      if(!g){g=makePoi(p);pois.set(p.id,g);layer.add(g);}g.position.set(p.x,0,p.z);g.visible=!isMenu;
      if(p.type==='portal'){updateRift(g,p,state,windTime,{reduced:reducedMotion});continue;}
      const completed=!!p.completed,ud=g.userData,near=Math.hypot(p.x-state.player.x,p.z-state.player.z)<POI_RADIUS[p.type]+.4;
      ud.halo.visible=!completed;ud.fill.visible=!completed;ud.beacon.visible=!completed;ud.complete.visible=completed;
      ud.halo.scale.setScalar(POI_RADIUS[p.type]);ud.fill.scale.setScalar(POI_RADIUS[p.type]);ud.fill.material=flat(POI_COLORS[p.type],near?.12:.045);
      for(let i=0;i<ud.progress.children.length;i++)ud.progress.children[i].visible=!completed&&p.progress>i/12;
      ud.beacon.position.y=(p.type==='portal'?4.1:p.type==='shrine'?3.3:2.4)+Math.sin(windTime*2.2+p.z)*.12;ud.beacon.rotation.y=windTime*.8;
      if(ud.lid)ud.lid.rotation.x=completed?-1.25:0;
      if(ud.float&&p.type==='shrine'){ud.float.rotation.y=windTime*.6;ud.float.position.y=1.88+Math.sin(windTime*2)*.15;const k=1+(p.progress||0)*.15;ud.float.scale.set(.53*k,.82*k,.48*k);}
      if(ud.flag)ud.flag.rotation.y=Math.sin(windTime*2+p.x)*.17;
      if(ud.fire){ud.fire.scale.set(1+Math.sin(windTime*8)*.1,.9+Math.sin(windTime*11)*.15,1);for(let i=0;i<ud.smoke.length;i++){const age=(windTime*.42+i/3)%1;ud.smoke[i].position.set(Math.sin(age*4+p.x)*.15,.7+age*1.5,1.25);ud.smoke[i].scale.setScalar(.1+age*.28);}}
      if(ud.ripples)for(let i=0;i<ud.ripples.length;i++){const age=(windTime*.5+i/3)%1;ud.ripples[i].scale.setScalar(.13+age*.52);}
      if(ud.drops)for(let i=0;i<ud.drops.length;i++){const age=(windTime*.65+i/4)%1,a=i*TAU/4;ud.drops[i].position.set(Math.sin(a)*age*.35,1.02+Math.sin(age*Math.PI)*.5,Math.cos(a)*age*.35);}
      ud.decor.scale.setScalar(completed?.9:1);
    }
    for(const[id,g]of pois)if(!alive.has(id)){layer.remove(g);disposeModel(g);pois.delete(id);}
  }
  return{update,layer,setReducedMotion(value){reducedMotion=!!value;},dispose(){features.dispose();disposeModel(layer);scene.remove(layer);chunks.clear();obstacles.clear();pois.clear();}};
}
