import * as THREE from '../vendor/three.module.js';
import { biomeAt } from '../game/world.js';

const TAU=Math.PI*2;
const palettes={forest:['#487858','#63996c','#93b477','#efd6a0','#cbb7dc'],crystal:['#707eaa','#9ab7c4','#bed7d6','#b9b5ed','#e1dafa'],desert:['#b99764','#d3b881','#7b9f87','#e5d0a0','#edb79b'],swamp:['#4f8275','#6a9d8b','#91bbae','#bc9ad9','#e1c5a1']};
function random(seed){let n=seed|0;return()=>{n=Math.imul(n^n>>>15,1|n)+0x6d2b79f5|0;return(n>>>0)/4294967296;};}
export function decorationCell(cx,cz,seed=0){
  const rand=random(Math.imul(cx,17383)^Math.imul(cz,48371)^seed^72813),items=[];
  for(let i=0;i<32;i++){const x=cx*16+rand()*16,z=cz*16+rand()*16,pal=palettes[biomeAt(x,z)],type=i%8===0?2:i%5===0?1:0;items.push({x,z,type,a:rand()*TAU,scale:.55+rand()*.9,c:pal[type===0?i%3:type===1?3+i%2:1],phase:rand()*TAU});}return items;
}
function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'#ffffffff');g.addColorStop(.18,'#fffffff0');g.addColorStop(.4,'#ffffff60');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);
}

/** Bounded, instanced set dressing and one particle batch, independent of collisions. */
export function createWorldArt(parent,{software=false}={}){
  software=software||typeof document==='undefined';
  const root=new THREE.Group();root.name='enchanted-world-art';parent.add(root);
  let key='',batches=[],reduced=false,ambient=[];
  const tmp=new THREE.Object3D(),color=new THREE.Color(),positions=new Float32Array(360*3),colors=new Float32Array(360*3),sizes=new Float32Array(360),phases=new Float32Array(360);
  let dust=null,texture=null;
  const grassGeo=new THREE.BufferGeometry();grassGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.08,0,0,.08,0,0,.04,.33,.025, .08,0,0,.04,.33,.025,.18,.55,.03],3));grassGeo.computeVertexNormals();
  const petalGeo=new THREE.SphereGeometry(1,6,4),stoneGeo=new THREE.IcosahedronGeometry(1,0);
  if(!software){
    texture=glowTexture();const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));geometry.setAttribute('aPhase',new THREE.BufferAttribute(phases,1));
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{map:{value:texture},time:{value:0},quiet:{value:0}},vertexShader:`attribute float aSize; attribute float aPhase; varying vec3 vColor; varying float vAlpha; uniform float time; uniform float quiet; void main(){vColor=color; vAlpha=mix(.45+.35*sin(time*1.3+aPhase),.5,quiet);gl_PointSize=aSize;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D map;varying vec3 vColor;varying float vAlpha;void main(){gl_FragColor=vec4(vColor,texture2D(map,gl_PointCoord).a*vAlpha);}`,vertexColors:true});
    dust=new THREE.Points(geometry,material);dust.name='ambient-and-loot-motes';dust.frustumCulled=false;dust.renderOrder=9;root.add(dust);
  }
  function clearBatches(){for(const b of batches){root.remove(b);b.dispose();b.material.dispose();}batches=[];}
  function scatter(state,bounds){
    const minX=Math.floor((bounds.minX-10)/16),maxX=Math.floor((bounds.maxX+10)/16),minZ=Math.floor((bounds.minZ-10)/16),maxZ=Math.floor((bounds.maxZ+10)/16),next=[minX,maxX,minZ,maxZ,state.runId,state.worldRevision,state.arenaRadius].join(':');if(next===key)return;key=next;clearBatches();if(software)return;
    const pools=[[],[],[]],candidates=[];ambient=[];
    const clear=(x,z)=>Math.hypot(x,z)<5.4||(state.obstacles||[]).some(o=>Math.hypot(x-o.x,z-o.z)<(o.radius||1)+.3)||(state.traps||[]).some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+.6)||(state.zones||[]).some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+.4)||(state.pois||[]).some(o=>Math.hypot(x-o.x,z-o.z)<2.1);
    for(let cx=minX;cx<=maxX;cx++)for(let cz=minZ;cz<=maxZ;cz++)for(const p of decorationCell(cx,cz,state.seed||0)){
      if(p.phase<.6)ambient.push(p);if(Math.hypot(p.x,p.z)>state.arenaRadius+2||clear(p.x,p.z))continue;candidates.push(p);
    }
    if(candidates.length>1100){const x=(bounds.minX+bounds.maxX)/2,z=(bounds.minZ+bounds.maxZ)/2;candidates.sort((a,b)=>(a.x-x)**2+(a.z-z)**2-((b.x-x)**2+(b.z-z)**2));}
    for(const p of candidates.slice(0,1100))pools[p.type].push(p);
    for(let type=0;type<3;type++){
      const data=pools[type],geometry=type===0?grassGeo:type===1?petalGeo:stoneGeo,material=new THREE.MeshStandardMaterial({roughness:.9,side:THREE.DoubleSide});
      const batch=new THREE.InstancedMesh(geometry,material,data.length);batch.name=['wind-grass','wildflowers','ground-stones'][type];batch.userData.data=data;batch.userData.type=type;batch.frustumCulled=false;
      for(let i=0;i<data.length;i++){const p=data[i];tmp.position.set(p.x,type===1?.18:type===2?.07:0,p.z);tmp.rotation.set(0,p.a,0);tmp.scale.set(type===0?p.scale:.12*p.scale,type===0?p.scale:type===1?.08*p.scale:.09*p.scale,type===0?p.scale:.16*p.scale);tmp.updateMatrix();batch.setMatrixAt(i,tmp.matrix);batch.setColorAt(i,color.set(p.c));}
      batch.instanceMatrix.needsUpdate=true;batch.instanceColor.needsUpdate=true;root.add(batch);batches.push(batch);
    }
  }
  function update(state,time,bounds,isMenu){
    root.visible=!state.rift?.arenaActive;if(!root.visible)return;
    scatter(state,bounds);if(!dust)return;
    const t=reduced?0:time,cx=(bounds.minX+bounds.maxX)/2,cz=(bounds.minZ+bounds.maxZ)/2,spanX=bounds.maxX-bounds.minX,spanZ=bounds.maxZ-bounds.minZ;let count=0;
    function add(x,y,z,c,size,phase){if(count>=360)return;const i=count++;positions[i*3]=x;positions[i*3+1]=y;positions[i*3+2]=z;color.set(c);colors[i*3]=color.r;colors[i*3+1]=color.g;colors[i*3+2]=color.b;sizes[i]=size;phases[i]=phase;}
    let density=0;for(const p of ambient){if(density>=(reduced?28:isMenu?90:105))break;if(p.x<bounds.minX-1||p.x>bounds.maxX+1||p.z<bounds.minZ-1||p.z>bounds.maxZ+1)continue;const i=density++,phase=p.phase*30;add(p.x+Math.sin(t*.15+phase)*.4,.35+i%11/5+Math.sin(t*.4+phase)*.18,p.z+Math.cos(t*.14+phase)*.4,palettes[biomeAt(p.x,p.z)][3+i%2],i%5===0?6:3.5,phase);}
    const sources=[...(state.pois||[]).filter(p=>!p.completed&&p.phase!=='expired').map(p=>({...p,kind:p.type})),...(state.pickups||[]).map(p=>({...p,kind:'heal'}))];
    for(const p of sources){if(p.x<bounds.minX-2||p.x>bounds.maxX+2||p.z<bounds.minZ-2||p.z>bounds.maxZ+2||isMenu)continue;const c=({chest:'#ffcf79',shrine:'#c9a6ff',well:'#93eaf3',portal:'#b7aeff',camp:'#ffb382',heal:'#a6ffc6'})[p.kind]||'#f3d79f';for(let j=0;j<(reduced?3:10);j++){const phase=j*1.9+p.x,a=t*.35+phase,r=.45+(j%4)*.21,y=.22+((t*.19+j*.139)%1)*2.3;add(p.x+Math.sin(a)*r,y,p.z+Math.cos(a)*r,c,4+j%3*1.4,phase);}}
    let visibleGems=0;for(const g of state.gems||[]){if(visibleGems>=50||g.x<bounds.minX||g.x>bounds.maxX||g.z<bounds.minZ||g.z>bounds.maxZ)continue;const phase=visibleGems++*1.6;add(g.x+Math.sin(t+phase)*.16,.85+Math.sin(t*1.5+phase)*.12,g.z+Math.cos(t+phase)*.16,'#73e7ff',6,phase);}
    dust.geometry.setDrawRange(0,count);for(const name of['position','color','aSize','aPhase'])dust.geometry.attributes[name].needsUpdate=true;dust.material.uniforms.time.value=t;dust.material.uniforms.quiet.value=reduced?1:0;
  }
  return{update,setReducedMotion(v){reduced=!!v;},dispose(){clearBatches();if(dust){dust.geometry.dispose();dust.material.dispose();texture.dispose();}for(const g of[grassGeo,petalGeo,stoneGeo])g.dispose();parent.remove(root);}};
}
