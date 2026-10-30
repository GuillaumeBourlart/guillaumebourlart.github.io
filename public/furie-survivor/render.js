import * as THREE from './vendor/three.module.js';
import { SoftwareRenderer } from './software-renderer.js';
import { getHero } from './game/catalog.js';
import { TAU, GEO, material, flat, mesh, disc, ring, group, contactShadow, makeHero, makeMonster, disposeModel } from './render/models.js';
import { createEnvironment } from './render/environment.js';
import { paintedMaterial, labelTexture, plazaMaterial } from './render/textures.js';
import { riftColor } from './render/rifts.js';
import { createCombatTrails } from './render/combat-particles.js';
import { updateMonsterFeedback } from './render/combat-feedback.js';
import { GAME_CAMERA, gameplayFraming, applyGameplayCamera, updateGameplayProjection, cameraGroundBounds } from './render/camera-framing.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const phaseOf=id=>{if(Number.isFinite(id))return id;let n=0;for(const c of String(id||''))n=(n*31+c.charCodeAt(0))%997;return n;};
const enemyKey=e=>e.type+':'+(e.bossKind||0)+':'+Math.max(1,Math.min(10,e.bossTier||1));
const FX_COLORS={bonk:'#ffe49a',slash:'#fff0c2',punch:'#ffda9a',thrust:'#c8f8ff',nova:'#bda0ff',wave:'#a2e7ee',lightning:'#ccf6ff',chain:'#b0eaff',burst:'#ffbf77',explosion:'#ffba73',beam:'#adf8ff',dash:'#d9ff9f',heal:'#9af3be',chest:'#ffe3a4',hit:'#fff0c2',breath:'#ffba7b',poison:'#b8e18c',freeze:'#c3f9ff',vortex:'#c8a6ff',break:'#e6bd87','trap-warning':'#f4bd7b','trap-hit':'#ff9297','pickup-heal':'#a7f0bb','terrain-entry':'#bbdcdf'};

function projectileModel(p,hero){
  const family=p.family||hero.family,type=p.type;
  const color=p.hostile?'#ff8d94':p.color||hero.accent||hero.color;
  const m=material(color,.22),white=material('#fff8dd',.12),dark=material('#33445c');
  const g=group();g.userData.family=family;g.userData.type=type;g.userData.hostile=!!p.hostile;
  if(type==='orbit'){
    mesh(GEO.gem,m,0,0,0,.22,.31,.22,g);
    mesh(GEO.box,white,0,0,0,.68,.075,.12,g);mesh(GEO.box,white,0,0,0,.12,.075,.68,g);
    ring(flat(color,.38),0,-.13,0,.35,g);
  }else if(type==='mine'||family==='mines'){
    mesh(GEO.cylinder,dark,0,0,0,.31,.16,.31,g);mesh(GEO.gem,m,0,.18,0,.13,.14,.13,g);ring(flat(color,.6),0,-.06,0,.5,g);
  }else if(type==='vortex'||family==='vortex'){
    ring(flat(color,.65),0,0,0,1,g);ring(flat('#d8c3ff',.4),0,.1,0,.66,g);mesh(GEO.gem,m,0,.24,0,.18,.39,.18,g);
  }else if(type==='wave'||family==='wave'){
    ring(flat(color,.65),0,0,0,1,g);ring(flat('#e7ffff',.35),0,.13,0,.8,g);
  }else if(['bow','spear','daggers','thorns','frost'].includes(family)){
    const length=family==='spear'?1.1:family==='bow'?.72:.49;
    mesh(GEO.box,dark,0,0,-length*.2,.055,.055,length,g);
    const tip=mesh(GEO.cone,m,0,0,length*.43,.14,.39,.12,g);tip.rotation.x=Math.PI/2;
    if(family==='bow')for(const s of[-1,1])mesh(GEO.box,white,s*.1,0,-.44,.22,.035,.16,g).rotation.y=s*.45;
  }else if(family==='boomerang'){
    for(const s of[-1,1])mesh(GEO.box,m,s*.17,0,.11,.16,.1,.64,g).rotation.y=s*.6;
  }else if(family==='grenade'){
    mesh(GEO.ball,dark,0,0,0,.24,.25,.24,g);mesh(GEO.box,m,0,.26,0,.13,.11,.13,g);mesh(GEO.ball,white,.04,.38,0,.045,.07,.045,g);
  }else if(family==='stars'){
    const s=mesh(GEO.star,m,0,0,0,.39,.39,.39,g);s.rotation.x=-Math.PI/2;mesh(GEO.gem,white,0,.02,0,.1,.11,.1,g);
  }else if(family==='bees'){
    mesh(GEO.ball,material('#ffdc76'),0,0,0,.24,.16,.33,g);mesh(GEO.box,dark,0,0,-.05,.28,.2,.09,g);
    for(const s of[-1,1])mesh(GEO.ball,white,s*.2,.14,-.03,.18,.025,.23,g);
  }else if(family==='scythe'){
    mesh(GEO.gem,m,0,0,0,.12,.09,.64,g);mesh(GEO.gem,white,.22,0,.4,.43,.08,.13,g);
  }else if(family==='laser'){
    mesh(GEO.box,m,0,0,0,.12,.12,1,g);mesh(GEO.box,white,0,.025,.03,.045,.045,.8,g);
  }else{
    mesh(GEO.ball,m,0,0,0,.23,.23,.25,g);
    mesh(GEO.ball,white,0,.04,.06,.12,.12,.12,g);
    const tail=mesh(GEO.cone,flat(color,.46),0,0,-.36,.19,.65,.17,g);tail.rotation.x=-Math.PI/2;
  }
  return g;
}

function makeEffect(e){
  const terrainColor=e.terrain==='mud'?'#c7ac84':'#b9ecf3',propColor=({crate:'#dfb47a',vase:'#b8d6df',crystal:'#c6baff'})[e.propType]||'#e6bd87';
  const g=group(),color=e.type?.startsWith('rift-')?riftColor(e.tier):e.type==='break'?propColor:e.type==='terrain-entry'?terrainColor:['trap-warning','trap-hit','pickup-heal'].includes(e.type)?FX_COLORS[e.type]:e.color||FX_COLORS[e.type]||'#d8f3b0';
  const own=[];
  const fxMat=(c,opacity=.8)=>{const m=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false});own.push(m);return m;};
  const base=fxMat(color);
  if(e.type==='damage'){
    const amount=Math.max(1,Math.round(e.amount||0)),texture=labelTexture((e.crit?'✦ ':'')+amount,{color:e.hostile?'#ffb0a1':e.crit?'#ffe6a0':'#f1f8d7',size:e.crit?66:61});
    if(texture){const mat=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false});own.push(mat);const sprite=new THREE.Sprite(mat);sprite.scale.set(e.crit?2.2:1.75,e.crit?1.1:.875,1);sprite.position.y=e.enemyType==='boss'?3.3:1.8;sprite.renderOrder=120;g.add(sprite);g.userData.textures=[texture];g.userData.label=sprite;}
  }else if(e.type?.startsWith('rift-')){
    const halo=mesh(GEO.fineRing,fxMat(e.type==='rift-victory'?'#e6d2ab':color,.48),0,.09,0,1,1,1,g);halo.rotation.x=-Math.PI/2;
    if(e.type==='rift-start')ring(fxMat(color,.2),0,.12,0,.76,g);
    if(e.type==='rift-victory'){const victory=[];for(let i=0;i<5;i++){const a=i*TAU/5;const star=mesh(GEO.star,fxMat('#e6d2ab',.8),Math.cos(a)*.55,1.2,Math.sin(a)*.55,.12,.12,.12,g);victory.push(star);}g.userData.victory= victory;}
  }else if(e.type==='death'||e.type==='break'){
    const pieces=[];for(let i=0;i<(e.enemyType==='boss'?10:6);i++){const a=i/6*TAU+phaseOf(e.id),shard=mesh(e.type==='break'&&e.propType==='crate'?GEO.softBox:GEO.gem,fxMat(i%3?color:'#ffefbb',.8),0,.4,0,.11,.17,.1,g);shard.userData={angle:a,reach:.6+(i%3)*.28,rise:.4+(i%2)*.4};pieces.push(shard);}g.userData.pieces=pieces;ring(fxMat(color,.28),0,.08,0,.7,g);
  }else if((e.type==='lightning'||e.type==='chain'||e.type==='beam')&&e.points?.length){
    const points=[{x:e.x,z:e.z},...e.points],vertices=[];
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1];
      if(!i)vertices.push(new THREE.Vector3(a.x,1.13,a.z));
      const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1;
      const segments=e.type==='beam'?1:3;
      for(let j=1;j<=segments;j++){
        const t=j/segments,w=j===segments?0:(j%2?.13:-.13);
        vertices.push(new THREE.Vector3(a.x+dx*t-dz/len*w,1.13+(j%2)*.04,a.z+dz*t+dx/len*w));
      }
    }
    const lineMat=new THREE.LineBasicMaterial({color,transparent:true,opacity:1,linewidth:e.type==='beam'?4:2});own.push(lineMat);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices),lineMat);line.userData.uniqueGeometry=true;g.add(line);g.userData.absolute=true;
    if(e.type==='beam')for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);
      const beam=mesh(GEO.box,base,(a.x+b.x)/2,1.13,(a.z+b.z)/2,.15,.13,len,g);beam.rotation.y=Math.atan2(dx,dz);
    }
  }else if(['bonk','slash','punch','thrust','breath'].includes(e.type)){
    const arc=mesh(GEO.arc,base,0,.45,0,1,1,1,g);arc.rotation.x=-Math.PI/2;
    g.rotation.y=(e.angle||0)-Math.PI/2;
    if(e.type==='breath')mesh(GEO.cone,fxMat('#fff1b9',.52),0,.45,0,.36,1,.36,g).rotation.z=Math.PI/2;
  }else if(e.type==='hit'||e.type==='trap-hit'){
    mesh(GEO.star,fxMat('#fff9e6',.9),0,.88,.02,.23,.23,.23,g);
    for(let i=0;i<3;i++){const a=i/3*TAU;const s=mesh(GEO.star,base,Math.cos(a)*.31,.65+Math.sin(a)*.22,Math.sin(a)*.31,.12,.12,.12,g);s.rotation.y=a;}
  }else{
    ring(base,0,.13,0,1,g);
    if(['nova','wave','burst','explosion','freeze'].includes(e.type)){
      ring(fxMat('#fff5dc',.45),0,.42,0,.64,g);
      if(['burst','explosion'].includes(e.type))mesh(GEO.ball,fxMat(color,.36),0,.4,0,.5,.58,.5,g);
    }
    if(e.type==='heal'||e.type==='pickup-heal')for(let i=0;i<3;i++)mesh(GEO.gem,base,Math.cos(i/3*TAU)*.4,.5+Math.sin(i)*.15,Math.sin(i/3*TAU)*.4,.09,.18,.09,g);
  }
  if(!g.userData.absolute)g.position.set(e.x,0,e.z);
  g.userData.materials=own;g.userData.type=e.type;return g;
}

/** A view-only adapter. Rules and persistent careers stay outside the scene graph. */
export function createRenderer(container){
  let renderer,reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}
  catch{renderer=new SoftwareRenderer();}
  const software=!!renderer.isSoftwareRenderer;
  renderer.setClearColor('#26324a');renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,software?1:1.65));
  renderer.domElement.setAttribute('aria-label','Les terres d’Azur — monde 3D de Furie Survivors');renderer.domElement.setAttribute('role','img');
  container.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#26324a');
  const camera=new THREE.OrthographicCamera(-20,20,14,-14,.1,240),spawnCamera=new THREE.OrthographicCamera(-20,20,14,-14,.1,240);
  scene.add(new THREE.HemisphereLight('#e4dfed','#4d536e',1.75));
  const sun=new THREE.DirectionalLight('#f4e5cf',2.2);sun.position.set(-14,28,18);scene.add(sun);
  const fill=new THREE.DirectionalLight('#bdc8e9',.7);fill.position.set(12,10,-16);scene.add(fill);
  if(!software){renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;}
  const environment=createEnvironment(scene,{software,reducedMotion:reduced});
  const riftArena=group(scene);riftArena.visible=false;
  mesh(GEO.cylinder16,paintedMaterial('stone','#17172f'),0,-.18,0,22.8,.36,22.8,riftArena);
  disc(paintedMaterial('stone','#29254a'),0,.015,0,22,riftArena);
  for(const radius of[6.5,13,20.5]){const mark=mesh(GEO.fineRing,flat(radius===20.5?'#ef8ac7':'#957ce0',radius===20.5?.75:.28),0,.04,0,radius,radius,radius,riftArena);mark.rotation.x=-Math.PI/2;}
  for(let i=0;i<12;i++){const a=i/12*TAU,x=Math.sin(a)*20,z=Math.cos(a)*20;mesh(GEO.cylinder16,material(i%2?'#4b3d70':'#624681',.08),x,1.1,z,.55,2.3,.55,riftArena);const flame=mesh(GEO.gem,material(i%2?'#d4a0ff':'#ff8dc5',.35),x,2.65,z,.22,.48,.22,riftArena);flame.userData.riftFlame=i;}
  const entities=group(scene),heroLayer=group(scene),heroShadow=contactShadow(scene,0,0,1.07,.58,.77,.04);
  const combatTrails=createCombatTrails(entities,{software,reducedMotion:reduced});
  const aura=mesh(GEO.fineRing,flat('#d9cce9',.72),0,.07,0,.9,.9,.9,scene);aura.rotation.x=-Math.PI/2;
  const previewStage=group(scene);
  contactShadow(previewStage,.12,.12,2.95,.55,.84);
  mesh(GEO.cylinder16,paintedMaterial('stone','#454b68'),0,.16,0,2.15,.32,2.15,previewStage);
  mesh(GEO.cylinder16,paintedMaterial('stone','#a4adbc'),0,.35,0,1.94,.12,1.94,previewStage);
  disc(plazaMaterial(),0,.418,0,1.86,previewStage);
  const stageRing=mesh(GEO.fineRing,flat('#ddcba9',.85),0,.425,0,1.79,1.79,1.79,previewStage);stageRing.rotation.x=-Math.PI/2;
  for(let i=0;i<8;i++){const a=i/8*TAU;const rune=mesh(GEO.gem,material(i%2?'#c7bbde':'#e0cfaf',.06),Math.sin(a)*1.98,.26,Math.cos(a)*1.98,.055,.1,.055,previewStage);rune.rotation.y=a;}
  const previewOrbits=group(scene);
  const orbitPreviews=[];
  for(let i=0;i<3;i++){const g=group(previewOrbits);mesh(GEO.gem,material('#c8b3ff',.18),0,0,0,.22,.32,.22,g);mesh(GEO.box,material('#fff2c2'),0,0,0,.62,.07,.11,g);orbitPreviews.push(g);}
  let hero=null,heroId='',previewOverride=null,width=1,height=1,lastTime=0,camX=0,camZ=0,menuZoom=1,lastMenu=true;
  let lastRunId='',viewBounds={minX:-20,maxX:20,minZ:-20,maxZ:20},trailClock=0,lastTrail={x:0,z:0};
  const trails=[];
  function withinView(o,padding=5){return o.x>=viewBounds.minX-padding&&o.x<=viewBounds.maxX+padding&&o.z>=viewBounds.minZ-padding&&o.z<=viewBounds.maxZ+padding;}
  function clearEffect(g){disposeModel(g);for(const m of g.userData.materials||[])m.dispose();for(const t of g.userData.textures||[])t.dispose();}
  function getSpawnBounds(player,forceGameplay=false){if(forceGameplay||lastMenu){applyGameplayCamera(spawnCamera,width,height,player?.x||0,player?.z||0);return cameraGroundBounds(spawnCamera);}updateGameplayProjection(camera,width,height);return cameraGroundBounds(camera);}
  function projectWorld(x,z,y=0){const p=new THREE.Vector3(x,y,z).project(camera);return{x:(p.x+1)*width/2,y:(1-p.y)*height/2,visible:Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&p.z>=-1&&p.z<=1};}
  const enemyMap=new Map(),enemyPool=new Map(),shotMap=new Map(),shotPool=new Map(),gemMap=new Map(),gemPool=[],effectMap=new Map();
  function setReducedMotion(value){reduced=!!value;environment.setReducedMotion(reduced);combatTrails.setReducedMotion(reduced);}

  function removeEffects(){for(const g of effectMap.values()){entities.remove(g);clearEffect(g);}effectMap.clear();}
  function acquireEnemy(e){
    const key=enemyKey(e);let pool=enemyPool.get(key);if(!pool){pool=[];enemyPool.set(key,pool);}
    const g=pool.pop()||makeMonster(e.type,e.biome,e.bossKind,e.bossTier);g.userData.poolKey=key;entities.add(g);return g;
  }
  function updateEnemies(state,time){
    const active=new Set();
    for(const e of state.enemies||[]){
      if(!withinView(e,7+(e.radius||1)))continue;active.add(e.id);let g=enemyMap.get(e.id);
      if(g&&g.userData.poolKey!==enemyKey(e)){entities.remove(g);disposeModel(g);enemyMap.delete(e.id);g=null;}
      if(!g){g=acquireEnemy(e);enemyMap.set(e.id,g);}
      g.visible=true;g.position.set(e.x,0,e.z);g.rotation.y=e.angle||0;
      const s=(e.radius||.6)/(e.type==='boss'?.9:.7);g.scale.setScalar(s);
      const ud=g.userData,phase=Number.isFinite(e.gaitPhase)?e.gaitPhase:time*9+phaseOf(e.id),action=e.action||'move',hop=e.hop||0;
      ud.model.position.set(0,0,0);ud.model.rotation.set(0,0,0);ud.model.scale.set(1,1,1);
      let swing=.3;
      if(e.type==='slime'){
        const squash=hop<.08?.13:0;ud.model.position.y=hop/s;ud.model.scale.set(1+squash-hop*.12,1-squash+hop*.22,1+squash-hop*.12);ud.model.rotation.x=Math.sin(phase)*.04;
      }else if(['wisp','wraith','bat'].includes(e.type)){
        ud.model.position.y=(hop||(.23+Math.sin(phase*.36)*.14))/s;ud.model.rotation.z=Math.sin(phase*.4)*.09;ud.model.rotation.y=Math.sin(phase*.25)*.08;swing=.16;
      }else if(e.type==='runner'){
        ud.model.position.y=Math.abs(Math.sin(phase))*.085;ud.model.rotation.x=.13;ud.model.rotation.z=Math.sin(phase)*.075;swing=.7;
      }else if(e.type==='spitter'||e.type==='mushroom'){
        const inhale=action==='windup'?.18*(1-(e.telegraph||0)/Math.max(.01,e.telegraphDuration||1)):0;
        ud.model.scale.set(1+inhale,1+Math.sin(phase*.48)*.035-inhale*.4,1+inhale);ud.model.rotation.x=action==='recover'?-.13:Math.sin(phase*.3)*.04;ud.model.position.y=Math.abs(Math.sin(phase))*.025;swing=.16;
      }else if(e.type==='boss'||e.type==='brute'){
        ud.model.position.y=action==='move'?Math.abs(Math.sin(phase))*.045:0;ud.model.rotation.z=action==='move'?Math.sin(phase)*.035:0;ud.model.rotation.x=action==='charge'?.26:action==='windup'?-.12:action==='recover'?.11:0;swing=action==='charge'?.75:.3;
      }else{ud.model.position.y=Math.abs(Math.sin(phase))*.04;ud.model.rotation.z=Math.sin(phase)*.04;}
      for(let i=0;i<ud.limbs.length;i++){ud.limbs[i].rotation.x=action==='windup'?-1.05:action==='recover'?.2:Math.sin(phase)*swing*(i%2?1:-1);ud.limbs[i].rotation.z=action==='charge'?(i%2?-.18:.18):0;}
      for(let i=0;i<ud.flaps.length;i++)ud.flaps[i].rotation.z=Math.sin(phase*1.5)*.48*(i%2?1:-1);
      const telling=(e.telegraph||0)>0,progress=1-(e.telegraph||0)/Math.max(.01,e.telegraphDuration||1);
      ud.tell.visible=telling;ud.tell.scale.setScalar((e.type==='boss'?2.1:1.4)*(1+progress*.22));
      ud.chargeLane.visible=telling&&e.attackKind==='charge';ud.chargeLane.rotation.y=(e.attackAngle||0)-g.rotation.y;ud.chargeLane.scale.setScalar(1/s);ud.lane.scale.z=7.2*Math.max(.1,progress);ud.lane.position.z=ud.lane.scale.z/2;
      const shadowScale=1-Math.min(.28,hop*.35);ud.shadow.scale.set(1.96*shadowScale,1.96*.75*shadowScale,1);
      updateMonsterFeedback(g,e,time,{reducedMotion:reduced,cameraQuaternion:camera.quaternion});
    }
    for(const[id,g]of enemyMap)if(!active.has(id)){entities.remove(g);enemyMap.delete(id);const pool=enemyPool.get(g.userData.poolKey);if(pool.length<24)pool.push(g);else disposeModel(g);}
  }
  function updateProjectiles(state,time,heroData){
    const active=new Set(),p=state.player;
    for(const shot of state.projectiles||[]){
      if(!withinView(shot,6+(shot.radius||0)))continue;active.add(shot.id);let g=shotMap.get(shot.id);
      const key=(shot.hostile?'hostile:':'')+(shot.type||'projectile')+':'+(shot.family||heroData.family)+':'+(shot.color||heroData.accent);
      if(g&&g.userData.poolKey!==key){entities.remove(g);disposeModel(g);shotMap.delete(shot.id);g=null;}
      if(!g){let pool=shotPool.get(key);if(!pool){pool=[];shotPool.set(key,pool);}g=pool.pop()||projectileModel(shot,heroData);g.userData.poolKey=key;shotMap.set(shot.id,g);entities.add(g);}
      const ground=shot.type==='mine'||shot.family==='mines'||shot.type==='vortex'||shot.type==='wave';
      g.position.set(shot.x,Number.isFinite(shot.y)?shot.y:ground?.21:shot.type==='orbit'?1.15:.92,shot.z);
      const angle=Number.isFinite(shot.angle)?shot.angle:Math.atan2(shot.vx||0,shot.vz||1);
      g.rotation.y=['orbit','boomerang','stars','vortex'].includes(shot.type)||['boomerang','stars','vortex'].includes(shot.family)?time*(shot.type==='orbit'?8:5):angle;
      const radius=shot.radius||.18,s=shot.type==='wave'||shot.type==='vortex'?Math.max(.5,radius):clamp(radius/.23,.65,3.4);g.scale.setScalar(s);
      if(shot.family==='bees')g.position.y+=Math.sin(time*22+phaseOf(shot.id))*.07;
    }
    for(const[id,g]of shotMap)if(!active.has(id)){entities.remove(g);shotMap.delete(id);const pool=shotPool.get(g.userData.poolKey);if(pool.length<36)pool.push(g);else disposeModel(g);}
  }
  function updateGems(state,time){
    const active=new Set();
    for(const gem of state.gems||[]){
      if(!withinView(gem,4))continue;active.add(gem.id);let g=gemMap.get(gem.id);
      if(!g){g=gemPool.pop()||mesh(GEO.gem,material('#d7ff8d',.14),0,0,0,.13,.21,.13);gemMap.set(gem.id,g);entities.add(g);}
      const s=gem.value>4?1.45:1;g.scale.set(.13*s,.21*s,.13*s);g.position.set(gem.x,.31+Math.sin(time*3+phaseOf(gem.id))*.04,gem.z);g.rotation.y=time+phaseOf(gem.id);
    }
    for(const[id,g]of gemMap)if(!active.has(id)){entities.remove(g);gemMap.delete(id);if(gemPool.length<200)gemPool.push(g);}
  }
  function updateEffects(state){
    const active=new Set();
    for(const e of state.effects||[]){
      if(reduced&&e.type==='death')continue;
      if(!withinView(e,7+(e.radius||0)))continue;active.add(e.id);let g=effectMap.get(e.id);if(!g){g=makeEffect(e);effectMap.set(e.id,g);entities.add(g);}
      const progress=1-clamp(e.life/Math.max(.01,e.maxLife||.4));
      for(const m of g.userData.materials||[])m.opacity=(1-progress)*(m.isLineBasicMaterial||m.isSpriteMaterial?.94:.58);
      if(e.type==='damage'){g.position.y=progress*(reduced?.45:1.1);g.position.x=e.x+(reduced?0:Math.sin(phaseOf(e.id))*progress*.2);continue;}
      if(e.type==='death'||e.type==='break'){for(const piece of g.userData.pieces||[]){const u=piece.userData;piece.position.set(Math.sin(u.angle)*u.reach*progress,.2+Math.sin(progress*Math.PI)*u.rise,Math.cos(u.angle)*u.reach*progress);piece.rotation.set(progress*7,progress*5,u.angle);piece.scale.setScalar(.14*(1-progress)+.025);}g.scale.setScalar(e.radius||.8);continue;}
      if(!g.userData.absolute){
        const radius=e.radius||.65,size=['bonk','slash','punch','thrust','breath'].includes(e.type)?radius*(.8+.2*progress):radius*(.3+.7*progress);
        g.scale.set(size,1,size);if(e.type==='hit'||e.type==='trap-hit')g.position.y=progress*.6;
        if(g.userData.victory)for(let i=0;i<g.userData.victory.length;i++)g.userData.victory[i].position.y=.5+progress*(reduced?.25:1.4)+i*.08;
      }
    }
    for(const[id,g]of effectMap)if(!active.has(id)){entities.remove(g);effectMap.delete(id);clearEffect(g);}
  }
  function updateTrails(state,dt,moving,dashing){
    const p=state.player;trailClock-=dt;
    if(state.phase==='playing'&&moving&&!reduced&&trailClock<=0&&Math.hypot(p.x-lastTrail.x,p.z-lastTrail.z)>.35){
      let trail=trails.find(t=>t.userData.life<=0);
      if(!trail&&trails.length<28){const mat=new THREE.MeshBasicMaterial({color:'#d9d8a1',transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide});trail=mesh(GEO.disc,mat,0,.06,0,.2,.2,.2,entities);trail.rotation.x=-Math.PI/2;trail.userData.uniqueMaterial=true;trail.userData.life=0;trails.push(trail);}
      if(trail){trail.position.set(p.x-(p.vx||0)*.025,.06,p.z-(p.vz||0)*.025);trail.userData.life=trail.userData.maxLife=dashing?.45:.6;trail.userData.dash=dashing;trail.material.color.set(dashing?'#d8f4bd':state.biome==='desert'?'#e6c99b':'#a7bc8c');trail.visible=true;}
      trailClock=dashing?.025:.11;lastTrail={x:p.x,z:p.z};
    }
    for(const trail of trails){trail.userData.life=Math.max(0,trail.userData.life-dt);trail.visible=state.phase!=='menu'&&trail.userData.life>0;if(!trail.visible)continue;const progress=1-trail.userData.life/trail.userData.maxLife,size=trail.userData.dash?.45+progress*.25:.11+progress*.28;trail.scale.set(size,size*.7,size);trail.material.opacity=(1-progress)*(trail.userData.dash?.34:.2);}
  }
  function resize(){
    const r=container.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);renderer.setSize(width,height);
  }
  const observer=new ResizeObserver(resize);observer.observe(container);resize();

  function render(state,time){
    if(!state?.player)return;
    const dt=Math.min(.1,Math.max(.001,time-lastTime||.016));lastTime=time;
    const p=state.player,isMenu=state.phase==='menu'||state.preview===true,ambientTime=reduced?0:time;
    const heroData=getHero(isMenu&&previewOverride?previewOverride:state.heroId||'lyra');
    if(heroData.id!==heroId){
      if(hero){heroLayer.remove(hero);disposeModel(hero);}hero=makeHero(heroData);heroLayer.add(hero);heroId=heroData.id;
    }
    if(state.runId!==lastRunId){removeEffects();combatTrails.clear();for(const t of trails){t.userData.life=0;t.visible=false;}lastRunId=state.runId;}
    const phone=width<700;menuZoom=isMenu?1:0;
    const span=isMenu?(phone?10.6:12.5):gameplayFraming(width,height).span;
    camera.left=-span*width/height/2;camera.right=span*width/height/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();
    const targetX=p.x-(isMenu&&!phone?3.1:0),targetZ=p.z+(isMenu?(phone?3.15:.55):GAME_CAMERA.leadZ);
    if(lastMenu!==isMenu){camX=targetX;camZ=targetZ;lastMenu=isMenu;lastTrail={x:p.x,z:p.z};}
    const blend=1-Math.exp(-dt*8);camX+=(targetX-camX)*blend;camZ+=(targetZ-camZ)*blend;
    const cameraY=22-menuZoom*10,cameraZ=18-menuZoom*3;
    camera.position.set(camX,cameraY,camZ+cameraZ);camera.lookAt(camX,menuZoom*.9,camZ);camera.updateMatrixWorld(true);
    viewBounds=cameraGroundBounds(camera);
    const inRift=!!state.rift?.arenaActive;environment.layer.visible=!inRift;riftArena.visible=inRift;if(!inRift)environment.update(state,isMenu?p.x:camX,isMenu?p.z:camZ,time,isMenu,viewBounds);
    if(inRift&&!reduced)for(const child of riftArena.children)if(Number.isFinite(child.userData.riftFlame)){const phase=time*3+child.userData.riftFlame;child.scale.y=.82+Math.sin(phase)*.18;child.rotation.y=phase*.4;}

    const model=hero.userData,moving=state.phase==='playing'&&Math.hypot(p.vx||0,p.vz||0)>.15;
    const walk=moving?Math.sin(time*15)*.63:0,dashing=(p.dashTime||0)>0;
    const scale=model.baseScale*(1+menuZoom*.38);hero.scale.setScalar(scale);
    hero.position.set(p.x,(isMenu?.41:0)+(model.floating?.2:0)+(dashing?.16:0),p.z);
    hero.rotation.y=isMenu?-.37+(!reduced?Math.sin(time*.5)*.08:0):(p.angle||0);
    for(let i=0;i<model.legs.length;i++)model.legs[i].rotation.x=walk*(i%2?-1:1);
    for(let i=0;i<model.arms.length;i++){model.arms[i].rotation.x=-walk*.62*(i%2?-1:1);model.arms[i].rotation.z=0;}
    model.body.position.y=moving?Math.abs(Math.sin(time*15))*(reduced?.035:.065):Math.sin(ambientTime*2.2)*.025;
    model.body.rotation.x=dashing?-.19:0;
    for(let i=0;i<model.wings.length;i++)model.wings[i].rotation.z=Math.sin(ambientTime*(model.family==='bees'?16:4))*.17*(i%2?-1:1);
    if(model.family==='vortex'&&model.ornaments[0])model.ornaments[0].rotation.z=ambientTime*.5;
    const swinging=(state.effects||[]).some(e=>['bonk','slash','punch','thrust','breath'].includes(e.type)&&distance(e,p)<4);
    if(swinging&&model.arms[1]){model.arms[1].rotation.x=-.8;model.arms[1].rotation.z=-.45;}
    hero.visible=true;
    heroShadow.visible=!isMenu;heroShadow.position.set(p.x,.04,p.z);
    aura.visible=!isMenu;aura.position.set(p.x,.065,p.z);aura.rotation.z=ambientTime*.25;aura.scale.setScalar(dashing?1.3:.87);aura.material=flat(p.invuln>0?'#efc6a9':'#d9cce9',.72);
    previewStage.visible=isMenu;previewStage.position.set(p.x,0,p.z);stageRing.rotation.z=ambientTime*.06;
    previewOrbits.visible=isMenu&&heroData.family==='orbit';
    for(let i=0;i<orbitPreviews.length;i++){const a=ambientTime*1.1+i/3*TAU;orbitPreviews[i].position.set(p.x+Math.cos(a)*2.35,1.4+Math.sin(a)*.3,p.z+Math.sin(a)*2.35);orbitPreviews[i].rotation.y=ambientTime*2;}
    entities.visible=!isMenu;
    updateEnemies(state,state.t||0);updateProjectiles(state,time,heroData);combatTrails.update(state,heroData,viewBounds);updateGems(state,ambientTime);updateEffects(state);updateTrails(state,dt,moving,dashing);
    renderer.render(scene,camera);
  }
  return{
    render,resize,renderer,getSpawnBounds,projectWorld,setReducedMotion,previewHero(id){previewOverride=id||null;},
    get mode(){return software?'software':'webgl';},
    dispose(){observer.disconnect();removeEffects();combatTrails.dispose();environment.dispose();const geometries=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});for(const g of geometries)g.dispose();for(const m of mats)m.dispose();renderer.dispose();renderer.domElement.remove();}
  };
}
