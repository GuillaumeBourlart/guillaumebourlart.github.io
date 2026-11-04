import * as THREE from './vendor/three.module.js';
import { SoftwareRenderer } from './software-renderer.js';
import { getHero } from './game/catalog.js';
import { TAU, GEO, material, flat, mesh, disc, ring, group, contactShadow, makeHero, makeMonster, disposeModel } from './render/models.js';
import { createEnvironment } from './render/environment.js';
import { createSanctum } from './render/sanctum.js';
import {makeExperience,updateExperience} from './render/experience.js';
import { paintedMaterial, labelTexture, plazaMaterial } from './render/textures.js';
import { riftColor } from './render/rifts.js';
import { createCombatTrails } from './render/combat-particles.js';
import { updateMonsterFeedback } from './render/combat-feedback.js';
import { GAME_CAMERA, gameplayFraming, applyGameplayCamera, updateGameplayProjection, cameraGroundBounds } from './render/camera-framing.js';
import {animateAsset,enemySpecies} from './render/asset-library.js';
import {corpseOpacity,CORPSE_LIFETIME} from './game/feedback-timing.js';
import {corpseAppearance} from './render/corpse-appearance.js';
import {createCorpseBatch} from './render/corpse-batch.js';
import {createModelPool} from './render/model-pool.js';
import {createHealthBatch} from './render/health-batch.js';
import {cacheSkeletonPose} from './render/pose-cache.js';
import {activeAttack,attackPose} from './game/attack-timing.js';
import {deathPresentation,livingSpectateTarget} from './game/death-presentation.js';
import {REVIVE} from './game/coop-pacing.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const phaseOf=id=>{if(Number.isFinite(id))return id;let n=0;for(const c of String(id||''))n=(n*31+c.charCodeAt(0))%997;return n;};
const enemyKey=e=>e.type+':'+(e.biome||'forest')+':'+(e.bossKind||0)+':'+Math.max(1,Math.min(10,e.bossTier||1))+':'+enemySpecies(e);
// In coop, allies' weapon visuals and damage numbers are drawn fainter than the player's own.
const ALLY_DIMMED=new Set(['bonk','slash','punch','thrust','breath','nova','wave','burst','explosion','beam','lightning','chain','vortex','freeze','poison','hit','damage']);
const FX_COLORS={bonk:'#ffe49a',slash:'#fff0c2',punch:'#ffda9a',thrust:'#c8f8ff',nova:'#bda0ff',wave:'#a2e7ee',lightning:'#ccf6ff',chain:'#b0eaff',burst:'#ffbf77',explosion:'#ffba73',beam:'#adf8ff',dash:'#d9ff9f',heal:'#9af3be',chest:'#ffe3a4',hit:'#fff0c2',breath:'#ffba7b',poison:'#b8e18c',freeze:'#c3f9ff',vortex:'#c8a6ff',break:'#e6bd87','trap-warning':'#f4bd7b','trap-hit':'#ff9297','pickup-heal':'#a7f0bb','terrain-entry':'#bbdcdf'};

function projectileModel(p,hero){
  const family=p.family||hero.family,type=p.type;
  const color=p.hostile?'#ff8d94':p.color||hero.accent||hero.color;
  const m=material(color,.22),white=material('#fff8dd',.12),dark=material('#33445c');
  const g=group();g.userData.family=family;g.userData.type=type;g.userData.hostile=!!p.hostile;
  if(type==='orbit'){
    const moon=mesh(GEO.moon,material('#e9e0ff',.28),0,0,0,.7,.7,.7,g);moon.rotation.x=-.60;
    mesh(GEO.gem,m,.1,0,.02,.10,.16,.1,g);ring(flat(color,.24),0,-.22,0,.33,g);
  }else if(type==='mine'||family==='mines'){
    mesh(GEO.cylinder,dark,0,0,0,.31,.16,.31,g);mesh(GEO.gem,m,0,.18,0,.13,.14,.13,g);ring(flat(color,.6),0,-.06,0,.5,g);
  }else if(p.style==='bramble'||p.style==='spores'){
    ring(flat(color,.38),0,.03,0,1,g);
    for(let i=0;i<6;i++){const a=i/6*TAU;mesh(p.style==='spores'?GEO.round:GEO.cone,m,Math.sin(a)*.6,.14,Math.cos(a)*.6,p.style==='spores'?.12:.08,p.style==='spores'?.13:.45,.1,g);}
  }else if(type==='vortex'||family==='vortex'){
    ring(flat(color,.65),0,0,0,1,g);ring(flat('#d8c3ff',.4),0,.1,0,.66,g);mesh(GEO.gem,m,0,.24,0,.18,.39,.18,g);
  }else if(type==='wave'||family==='wave'){
    ring(flat(color,.65),0,0,0,1,g);ring(flat('#e7ffff',.35),0,.13,0,.8,g);
  }else if(p.style==='knife'||family==='daggers'){
    mesh(GEO.gem,white,0,0,.16,.125,.045,.40,g);
    mesh(GEO.box,m,0,.015,.12,.035,.04,.48,g);
    mesh(GEO.box,m,0,0,-.12,.29,.065,.075,g);
    mesh(GEO.box,dark,0,0,-.27,.093,.075,.26,g);
  }else if(p.style==='feather'){
    mesh(GEO.gem,m,0,0,.04,.16,.04,.39,g).rotation.y=.21;
    mesh(GEO.box,white,0,.024,-.05,.036,.028,.66,g);
  }else if(p.style==='vial'){
    mesh(GEO.ball,m,0,0,.1,.22,.21,.26,g);
    mesh(GEO.cylinder,white,0,0,-.13,.12,.18,.12,g).rotation.x=Math.PI/2;
    mesh(GEO.cylinder,dark,0,0,-.23,.125,.07,.125,g).rotation.x=Math.PI/2;
  }else if(family==='frost'){
    mesh(GEO.gem,m,0,0,.1,.18,.13,.42,g);
    mesh(GEO.gem,white,.045,.045,.19,.06,.07,.24,g);
  }else if(family==='thorns'){
    mesh(GEO.cone,m,0,0,.05,.13,.77,.13,g).rotation.x=Math.PI/2;
    mesh(GEO.gem,dark,0,0,-.23,.12,.075,.17,g);
  }else if(['bow','spear'].includes(family)){
    const length=family==='spear'?1.1:.72;
    mesh(GEO.box,dark,0,0,-length*.2,.055,.055,length,g);
    const tip=mesh(GEO.cone,m,0,0,length*.43,.14,.39,.12,g);tip.rotation.x=Math.PI/2;
    if(family==='bow')for(const s of[-1,1])mesh(GEO.box,white,s*.1,0,-.44,.22,.035,.16,g).rotation.y=s*.45;
  }else if(family==='boomerang'){
    for(const s of[-1,1])mesh(GEO.box,m,s*.17,0,.11,.16,.1,.64,g).rotation.y=s*.6;
  }else if(family==='fists'){
    mesh(GEO.round,m,0,0,0,.24,.19,.27,g);
    for(const x of[-.14,0,.14])mesh(GEO.round,white,x,.06,.2,.085,.1,.1,g);
    mesh(GEO.cone,flat(color,.4),0,0,-.33,.15,.55,.15,g).rotation.x=Math.PI/2;
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

function animateFallbackStrike(model,attack,time){
  if(!attack||!model.arms[1])return;
  const swing=Math.sin(Math.PI*attackPose(attack,time,.5));
  model.arms[1].rotation.x=-1.25*swing;
  model.arms[1].rotation.z=-.45*swing;
}

// Effect materials are recycled. Disposing the last material of a shader variant makes three.js delete
// that program, and the next effect compiles it again: a stall of tens of milliseconds on a phone.
const FX_MATERIALS={mesh:[],sprite:[],line:[]};
function fxMaterial(kind){
  const reused=FX_MATERIALS[kind].pop();if(reused)return reused;
  const m=kind==='sprite'?new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false}):kind==='line'?new THREE.LineBasicMaterial({transparent:true,opacity:1}):new THREE.MeshBasicMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,forceSinglePass:true});
  m.userData.fxKind=kind;return m;
}
function releaseFxMaterial(m){const pool=FX_MATERIALS[m.userData.fxKind];if(pool&&pool.length<400)pool.push(m);else m.dispose();}
// Damage and XP numbers repeat constantly, so their small canvases are shared instead of drawn and uploaded each time.
const LABELS=new Map();
function sharedLabel(text,options){
  const key=text+'|'+options.color+'|'+options.size;let entry=LABELS.get(key);
  if(entry){LABELS.delete(key);LABELS.set(key,entry);}
  else{const texture=labelTexture(text,{...options,scale:.5});if(!texture)return null;texture.userData.labelKey=key;entry={texture,users:0};LABELS.set(key,entry);}
  entry.users++;
  if(LABELS.size>120)for(const [k,v]of LABELS){if(LABELS.size<=120)break;if(v.users<=0){v.texture.dispose();LABELS.delete(k);}}
  return entry.texture;
}
function releaseLabel(texture){const entry=LABELS.get(texture.userData.labelKey);if(entry&&entry.texture===texture)entry.users--;else texture.dispose();}
let labelScale=1;
function makeEffect(e){
  const terrainColor=e.terrain==='mud'?'#c7ac84':'#b9ecf3',propColor=({crate:'#dfb47a',vase:'#b8d6df',crystal:'#c6baff'})[e.propType]||'#e6bd87';
  const g=group(),color=e.type?.startsWith('rift-')?riftColor(e.tier):e.type==='break'?propColor:e.type==='terrain-entry'?terrainColor:['trap-warning','trap-hit','pickup-heal'].includes(e.type)?FX_COLORS[e.type]:e.color||FX_COLORS[e.type]||'#d8f3b0';
  const own=[];
  const fxMat=(c,opacity=.8)=>{const m=fxMaterial('mesh');m.color.set(c);m.opacity=opacity;own.push(m);return m;};
  const labelMat=texture=>{const m=fxMaterial('sprite');m.map=texture;m.opacity=1;own.push(m);return m;};
  const base=fxMat(color);
  if(e.type==='xp-pickup'){
    const texture=sharedLabel('+'+Math.round(e.amount||1)+' XP',{color:'#9af3ff',size:50});
    if(texture){const sprite=new THREE.Sprite(labelMat(texture));sprite.scale.set(1.7*labelScale,.65*labelScale,1);sprite.position.y=1.1;sprite.renderOrder=119;g.add(sprite);g.userData.textures=[texture];}
    ring(base,0,.12,0,.45,g);
  }else if(e.type==='damage'){
    const amount=Math.max(1,Math.round(e.amount||0)),texture=sharedLabel((e.crit?'✦ ':'')+amount,{color:e.hostile?'#ffb0a1':e.crit?'#ffe6a0':'#f1f8d7',size:e.crit?66:61});
    if(texture){const sprite=new THREE.Sprite(labelMat(texture));sprite.scale.set((e.crit?2.2:1.75)*labelScale,(e.crit?1.1:.875)*labelScale,1);sprite.position.y=e.enemyType==='boss'?3.3:1.8;sprite.renderOrder=120;g.add(sprite);g.userData.textures=[texture];g.userData.label=sprite;}
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
    const lineMat=fxMaterial('line');lineMat.color.set(color);lineMat.opacity=1;lineMat.linewidth=e.type==='beam'?4:2;own.push(lineMat);
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
  renderer.domElement.setAttribute('aria-label','Les terres d’Azur — monde 3D d’AZUROS');renderer.domElement.setAttribute('role','img');
  container.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#26324a');
  const camera=new THREE.OrthographicCamera(-20,20,14,-14,.1,240),spawnCamera=new THREE.OrthographicCamera(-20,20,14,-14,.1,240);
  scene.add(new THREE.HemisphereLight('#e4dfed','#4d536e',1.75));
  const sun=new THREE.DirectionalLight('#f4e5cf',2.2);sun.position.set(-14,28,18);scene.add(sun);
  const fill=new THREE.DirectionalLight('#bdc8e9',.7);fill.position.set(12,10,-16);scene.add(fill);
  if(!software){renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;}
  const environment=createEnvironment(scene,{software,reducedMotion:reduced});
  const sanctum=createSanctum(scene,{software}),riftArena=sanctum.layer;
  const entities=group(scene),heroLayer=group(scene),heroShadow=contactShadow(scene,0,0,1.07,.58,.77,.04);
  const combatTrails=createCombatTrails(entities,{software,reducedMotion:reduced});
  const aura=mesh(GEO.fineRing,flat('#d9cce9',.72),0,.07,0,.9,.9,.9,scene);aura.rotation.x=-Math.PI/2;
  // Revive zone around a downed hero: a faint circle at the real radius, filled clockwise by the progress.
  const REVIVE_SEGMENTS=64,reviveBase=new THREE.MeshBasicMaterial({color:'#ffe4b8',transparent:true,opacity:.4,side:THREE.DoubleSide,depthWrite:false,forceSinglePass:true}),reviveFill=new THREE.MeshBasicMaterial({color:'#ffc777',transparent:true,opacity:.95,side:THREE.DoubleSide,depthWrite:false,forceSinglePass:true});
  const reviveBaseGeometry=new THREE.RingGeometry(REVIVE.radius-.06,REVIVE.radius+.06,REVIVE_SEGMENTS);
  function makeReviveRing(parent){
    const g=group(parent),base=new THREE.Mesh(reviveBaseGeometry,reviveBase),fill=new THREE.Mesh(new THREE.RingGeometry(REVIVE.radius-.2,REVIVE.radius+.1,REVIVE_SEGMENTS,1,Math.PI/2,TAU),reviveFill);
    fill.userData.uniqueGeometry=true;fill.scale.x=-1;
    for(const m of[base,fill]){m.rotation.x=-Math.PI/2;m.position.y=.09;m.renderOrder=3;g.add(m);}
    g.userData.fill=fill;g.visible=false;return g;
  }
  function showReviveRing(ring,progress){const n=Math.round(REVIVE_SEGMENTS*clamp(progress||0));ring.visible=true;ring.userData.fill.visible=n>0;ring.userData.fill.geometry.setDrawRange(0,n*6);}
  const localRevive=makeReviveRing(scene);
  const previewStage=group(scene);
  contactShadow(previewStage,.12,.12,2.95,.55,.84);
  mesh(GEO.cylinder16,paintedMaterial('stone','#454b68'),0,.16,0,2.15,.32,2.15,previewStage);
  mesh(GEO.cylinder16,paintedMaterial('stone','#a4adbc'),0,.35,0,1.94,.12,1.94,previewStage);
  disc(plazaMaterial(),0,.418,0,1.86,previewStage);
  const stageRing=mesh(GEO.fineRing,flat('#ddcba9',.85),0,.425,0,1.79,1.79,1.79,previewStage);stageRing.rotation.x=-Math.PI/2;
  for(let i=0;i<8;i++){const a=i/8*TAU;const rune=mesh(GEO.gem,material(i%2?'#c7bbde':'#e0cfaf',.06),Math.sin(a)*1.98,.26,Math.cos(a)*1.98,.055,.1,.055,previewStage);rune.rotation.y=a;}
  const previewOrbits=group(scene);
  const orbitPreviews=[];
  for(let i=0;i<3;i++){const g=group(previewOrbits);mesh(GEO.moon,material('#e9d8ff',.28),0,0,0,.75,.75,.75,g);mesh(GEO.gem,material('#e8ce92',.12),.12,.02,.03,.08,.12,.08,g);orbitPreviews.push(g);}
  let hero=null,heroId='',previewOverride=null,width=1,height=1,lastTime=0,camX=0,camZ=0,menuZoom=1,lastMenu=true;
  let lastRunId='',viewBounds={minX:-20,maxX:20,minZ:-20,maxZ:20},trailClock=0,lastTrail={x:0,z:0},lastRenderPhase='',lossStartedAt=0;
  const trails=[];
  function withinView(o,padding=5){return o.x>=viewBounds.minX-padding&&o.x<=viewBounds.maxX+padding&&o.z>=viewBounds.minZ-padding&&o.z<=viewBounds.maxZ+padding;}
  function clearEffect(g){disposeModel(g);for(const m of g.userData.materials||[])releaseFxMaterial(m);for(const t of g.userData.textures||[])releaseLabel(t);}
  function getSpawnBounds(player,forceGameplay=false){if(forceGameplay||lastMenu){applyGameplayCamera(spawnCamera,width,height,player?.x||0,player?.z||0);return cameraGroundBounds(spawnCamera);}updateGameplayProjection(camera,width,height);return cameraGroundBounds(camera);}
  function projectWorld(x,z,y=0){const p=new THREE.Vector3(x,y,z).project(camera);return{x:(p.x+1)*width/2,y:(1-p.y)*height/2,visible:Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&p.z>=-1&&p.z<=1};}
  const enemyMap=new Map(),enemyPool=createModelPool({limit:128,perKey:16,dispose:disposeModel}),shotMap=new Map(),shotPool=createModelPool({limit:192,perKey:36,dispose:disposeModel}),gemMap=new Map(),gemPool=[],effectMap=new Map(),remoteHeroes=new Map();
  const corpses=new Map(),corpseBatch=software?null:createCorpseBatch(entities),healthBatch=software?null:createHealthBatch(entities);let animationFrame=0;
  function releaseEnemy(g){g.userData.corpseAppearance?.restore();delete g.userData.corpseAppearance;entities.remove(g);enemyPool.put(g.userData.poolKey,g);}
  function updateAllies(state,time,isMenu){
    const active=new Set();
    for(const ally of isMenu?[]:state.party||[]){
      if(ally.id===state.player.playerId)continue;active.add(ally.id);let entry=remoteHeroes.get(ally.id);
      if(entry&&entry.heroId!==ally.heroId){heroLayer.remove(entry.group);disposeModel(entry.group);entry.texture?.dispose();entry.labelMaterial?.dispose();remoteHeroes.delete(ally.id);entry=null;}
      if(!entry){
        const h=getHero(ally.heroId),g=group(heroLayer),body=makeHero(h,{software});g.add(body);
        const headY=Math.max(1.7,new THREE.Box3().setFromObject(body).max.y*body.userData.baseScale+.32+(body.userData.floating?.2:0));
        const hp=mesh(GEO.box,material('#a8d1b0'),0,headY,0,1.3,.065,.065,g);mesh(GEO.box,material('#17303d'),0,headY-.005,.025,1.36,.1,.065,g);
        const texture=labelTexture(String(ally.name||h.name).slice(0,18),{color:'#e8e4d2',size:40});let labelMaterial=null;
        if(texture){labelMaterial=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false});const label=new THREE.Sprite(labelMaterial);label.position.y=headY+.4;label.scale.set(2.3,.65,1);label.renderOrder=115;g.add(label);}
        ring(flat(h.color,.65),0,.075,0,.73,g);
        entry={heroId:h.id,group:g,body,hp,texture,labelMaterial,revive:makeReviveRing(g)};remoteHeroes.set(ally.id,entry);
      }
      const p=ally.player,m=entry.body.userData,walk=Math.hypot(p.vx||0,p.vz||0)>.15&&state.phase==='playing'?Math.sin(time*15)*.63:0;
      const attack=activeAttack(p.attack,state.t);
      entry.group.position.set(p.x,0,p.z);entry.body.rotation.y=attack?.angle??p.angle??0;entry.body.rotation.z=m.rig?0:p.hp<=0?-1.2:0;entry.body.position.y=p.hp<=0?(m.rig?0:.35):m.floating?.2:0;entry.body.scale.setScalar(m.baseScale);
      for(let i=0;i<m.legs.length;i++)m.legs[i].rotation.x=walk*(i%2?-1:1);
      for(let i=0;i<m.arms.length;i++){m.arms[i].rotation.x=-walk*.62*(i%2?-1:1);m.arms[i].rotation.z=0;}
      m.body.position.y=Math.abs(walk)*.1;
      animateFallbackStrike(m,attack,state.t);
      animateAsset(entry.body,{time:state.t,moving:!!walk,timedAttack:attack,hit:p.hitFlash>0,dead:p.hp<=0});
      for(let i=0;i<m.wings.length;i++)m.wings[i].rotation.z=Math.sin(time*4)*.17*(i%2?-1:1);
      entry.hp.scale.x=1.3*clamp(p.hp/p.maxHp);entry.hp.position.x=-(1.3-entry.hp.scale.x)/2;
      if(p.hp<=0&&state.phase==='playing')showReviveRing(entry.revive,p.reviveProgress);else entry.revive.visible=false;
      entry.group.visible=withinView(p,8);
    }
    for(const[id,entry]of remoteHeroes)if(!active.has(id)){heroLayer.remove(entry.group);disposeModel(entry.group);entry.texture?.dispose();entry.labelMaterial?.dispose();remoteHeroes.delete(id);}
  }
  function setReducedMotion(value){reduced=!!value;environment.setReducedMotion(reduced);combatTrails.setReducedMotion(reduced);}

  function removeEffects(){for(const g of effectMap.values()){entities.remove(g);clearEffect(g);}effectMap.clear();}
  function acquireEnemy(e){
    const key=enemyKey(e),g=enemyPool.take(key)||makeMonster(e.type,e.biome,e.bossKind,e.bossTier,{software,modelKey:enemySpecies(e)});g.userData.poolKey=key;cacheSkeletonPose(g.userData.asset);entities.add(g);return g;
  }
  function updateEnemies(state,time){
    const active=new Set();healthBatch?.begin();animationFrame++;
    const visible=(state.enemies||[]).filter(e=>withinView(e,7+(e.radius||1))),groups=visible.length>220?4:visible.length>140?3:visible.length>90?2:1;
    const priority=groups>1?new Set([...visible].sort((a,b)=>distance(a,state.player)-distance(b,state.player)).slice(0,16).map(e=>e.id)):null;
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
      // The body wind-up remains readable, but directional floor lanes made
      // charges and shots trivial to solve before they happened.
      ud.chargeLane.visible=false;ud.shootLane.visible=false;
      const shadowScale=1-Math.min(.28,hop*.35);ud.shadow.scale.set(1.96*shadowScale,1.96*.75*shadowScale,1);
      updateMonsterFeedback(g,e,time,{reducedMotion:reduced,cameraQuaternion:camera.quaternion});
      healthBatch?.capture(g,ud.bar);
      const important=e.type==='boss'||e.elite||priority?.has(e.id),sample=groups===1||important||phaseOf(e.id)%groups===animationFrame%groups;
      if(ud.asset&&sample)animateAsset(ud.asset,{time,moving:action==='move'||action==='charge',attack:action==='shoot'||action==='windup'&&e.attackKind==='shoot'?'cast':action==='windup',hit:e.hitFlash>0,dead:e.hp<=0,rate:groups>1&&!important?Infinity:distance(e,state.player)>13?15:30});
    }
    for(const[id,g]of enemyMap)if(!active.has(id)){
      enemyMap.delete(id);const death=(state.corpses||[]).find(c=>c.id===id);
      if(death&&withinView(death,7))beginCorpse(g,death,time);else releaseEnemy(g);
    }
    healthBatch?.commit();updateCorpses(state,time);
  }
  function beginCorpse(g,record,time){
    if(corpses.has(record.id)){releaseEnemy(g);return;}
    const ud=g.userData;g.position.set(record.x,0,record.z);g.rotation.set(0,record.angle||0,0);g.scale.setScalar((record.radius||.6)/(record.type==='boss'?.9:.7));
    ud.model.position.set(0,0,0);ud.model.rotation.set(0,0,0);ud.model.scale.setScalar(1);
    for(const key of ['bar','tell','chargeLane','shootLane','flash'])ud[key].visible=false;
    const appearance=corpseAppearance(g);ud.corpseAppearance=appearance;
    if(ud.asset){
      animateAsset(ud.asset,{time,dead:true});const rig=ud.asset.userData.rig,age=Math.max(0,time-record.diedAt);
      if(age>.15&&rig?.action){for(const action of rig.actions.values())action.stopFading().setEffectiveWeight(action===rig.action?1:0);rig.action.time=Math.min(age,rig.action.getClip().duration);rig.mixer.update(0);}
    }
    corpses.set(record.id,{g,record,appearance,frozen:false});
  }
  function updateCorpses(state,time){
    const wanted=new Set();corpseBatch?.begin();
    if(state.phase!=='menu')for(const record of state.corpses||[]){
      const age=time-record.diedAt;if(age<0||age>=CORPSE_LIFETIME||!withinView(record,7))continue;wanted.add(record.id);
      if(!corpses.has(record.id))beginCorpse(acquireEnemy(record),record,time);
      const entry=corpses.get(record.id),g=entry.g,asset=g?.userData.asset;
      if(!entry.frozen&&g){
        if(asset)animateAsset(asset,{time,dead:true,rate:30});else g.userData.model.rotation.z=Math.min(1,age/.45)*-1.25;
        const duration=asset?.userData.rig?.action?.getClip().duration||.7;
        if(age>=duration+.15){
          entry.appearance.freeze();entry.frozen=true;
          if(corpseBatch&&asset&&corpseBatch.prepare(g.userData.poolKey,g)){
            entry.batchKey=g.userData.poolKey;entry.matrix=g.matrix.clone();entry.g=null;releaseEnemy(g);entry.appearance=null;
          }
        }
      }
      if(entry.batchKey)corpseBatch.add(entry.batchKey,entry.matrix,corpseOpacity(age));
      else{entry.appearance.fade(corpseOpacity(age));g.visible=true;}
    }
    for(const[id,entry]of corpses)if(!wanted.has(id)){if(entry.g)releaseEnemy(entry.g);corpses.delete(id);}
    corpseBatch?.commit();
  }

  function updateProjectiles(state,time,heroData){
    const active=new Set();
    for(const shot of state.projectiles||[]){
      if(!withinView(shot,6+(shot.radius||0)))continue;active.add(shot.id);let g=shotMap.get(shot.id);
      const key=(shot.hostile?'hostile:':'')+(shot.type||'projectile')+':'+(shot.family||heroData.family)+':'+(shot.color||heroData.accent)+':'+(shot.style||'');
      if(g&&g.userData.poolKey!==key){entities.remove(g);disposeModel(g);shotMap.delete(shot.id);g=null;}
      if(!g){g=shotPool.take(key)||projectileModel(shot,heroData);g.userData.poolKey=key;shotMap.set(shot.id,g);entities.add(g);}
      const ground=shot.type==='mine'||shot.family==='mines'||shot.type==='vortex'||shot.type==='wave';
      g.position.set(shot.x,Number.isFinite(shot.y)?shot.y:ground?.21:shot.type==='orbit'?1.15:.92,shot.z);
      const angle=Number.isFinite(shot.angle)?shot.angle:Math.atan2(shot.vx||0,shot.vz||1);
      g.rotation.y=['orbit','boomerang','stars','vortex'].includes(shot.type)||['boomerang','stars','vortex'].includes(shot.family)?time*(shot.type==='orbit'?8:5):angle;
      const radius=shot.radius||.18,s=shot.type==='wave'||shot.type==='vortex'?Math.max(.5,radius):clamp(radius/.23,.65,3.4),visualScale=shot.hostile?1.35:1;g.scale.setScalar(s*visualScale);
      if(shot.family==='bees')g.position.y+=Math.sin(time*22+phaseOf(shot.id))*.07;
    }
    for(const[id,g]of shotMap)if(!active.has(id)){entities.remove(g);shotMap.delete(id);shotPool.put(g.userData.poolKey,g);}
  }
  function updateGems(state,time,dt){
    const active=new Set();
    for(const gem of state.gems||[]){
      if(!withinView(gem,4))continue;active.add(gem.id);let g=gemMap.get(gem.id);
      if(!g){g=gemPool.pop()||makeExperience();g.userData.gemId=null;gemMap.set(gem.id,g);entities.add(g);}
      updateExperience(g,gem,time,reduced,state.t,dt);
    }
    for(const[id,g]of gemMap)if(!active.has(id)){entities.remove(g);gemMap.delete(id);if(gemPool.length<200)gemPool.push(g);}
  }
  function updateEffects(state){
    const active=new Set();
    for(const e of state.effects||[]){
      if(reduced&&e.type==='death')continue;
      if(!withinView(e,7+(e.radius||0)))continue;active.add(e.id);let g=effectMap.get(e.id);if(!g){g=makeEffect(e);g.userData.dim=e.ownerId&&e.ownerId!==state.player.playerId&&ALLY_DIMMED.has(e.type)?.42:1;effectMap.set(e.id,g);entities.add(g);}
      const progress=1-clamp(e.life/Math.max(.01,e.maxLife||.4));
      for(const m of g.userData.materials||[])m.opacity=(1-progress)*(m.isLineBasicMaterial||m.isSpriteMaterial?.94:.58)*g.userData.dim;
      if(e.type==='xp-pickup'){g.position.y=.2+progress*.85;g.scale.setScalar(1);continue;}
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
      if(!trail&&trails.length<28){const mat=new THREE.MeshBasicMaterial({color:'#d9d8a1',transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});trail=mesh(GEO.disc,mat,0,.06,0,.2,.2,.2,entities);trail.rotation.x=-Math.PI/2;trail.userData.uniqueMaterial=true;trail.userData.life=0;trails.push(trail);}
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
    if(state.phase!==lastRenderPhase){lossStartedAt=state.phase==='lost'?performance.now():0;lastRenderPhase=state.phase;}
    const lossStage=state.phase==='lost'&&lossStartedAt?deathPresentation(performance.now()-lossStartedAt):null;
    const spectated=livingSpectateTarget(state),cameraSubject=spectated?.player||p;
    const heroData=getHero(isMenu&&previewOverride?previewOverride:state.heroId||'lyra');
    if(heroData.id!==heroId){
      if(hero){heroLayer.remove(hero);disposeModel(hero);}hero=makeHero(heroData,{software});heroLayer.add(hero);heroId=heroData.id;
    }
    if(state.runId!==lastRunId){for(const entry of corpses.values())if(entry.g)releaseEnemy(entry.g);corpses.clear();corpseBatch?.clear();removeEffects();combatTrails.clear();for(const t of trails){t.userData.life=0;t.visible=false;}lastRunId=state.runId;}
    const phone=width<700;menuZoom=isMenu?1:0;
    const baseSpan=isMenu?(phone?10.6:12.5):gameplayFraming(width,height).span,span=baseSpan*(1-(lossStage?.zoomProgress||0)*.28);
    camera.left=-span*width/height/2;camera.right=span*width/height/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();
    const targetX=cameraSubject.x-(isMenu&&!phone?3.1:0),targetZ=cameraSubject.z+(isMenu?(phone?3.15:.55):GAME_CAMERA.leadZ);
    if(lastMenu!==isMenu){camX=targetX;camZ=targetZ;lastMenu=isMenu;lastTrail={x:p.x,z:p.z};}
    const blend=1-Math.exp(-dt*8);camX+=(targetX-camX)*blend;camZ+=(targetZ-camZ)*blend;
    const cameraY=22-menuZoom*10,cameraZ=18-menuZoom*3;
    camera.position.set(camX,cameraY,camZ+cameraZ);camera.lookAt(camX,menuZoom*.9,camZ);camera.updateMatrixWorld(true);
    viewBounds=cameraGroundBounds(camera);
    const inRift=!!state.rift?.arenaActive;environment.layer.visible=!inRift;riftArena.visible=inRift;if(!inRift)environment.update(state,isMenu?p.x:camX,isMenu?p.z:camZ,time,isMenu,viewBounds);
    sanctum.update(state,time,reduced);

    const model=hero.userData,moving=state.phase==='playing'&&Math.hypot(p.vx||0,p.vz||0)>.15;
    const attack=isMenu?null:activeAttack(p.attack,state.t);
    const walk=moving?Math.sin(time*15)*.63:0,dashing=(p.dashTime||0)>0;
    const scale=model.baseScale*(1+menuZoom*.38);hero.scale.setScalar(scale);
    hero.position.set(p.x,(isMenu?.41:0)+(model.floating?.2:0)+(dashing?.16:0),p.z);
    hero.rotation.y=isMenu?-.37+(!reduced?Math.sin(time*.5)*.08:0):(attack?.angle??p.angle??0);
    for(let i=0;i<model.legs.length;i++)model.legs[i].rotation.x=walk*(i%2?-1:1);
    for(let i=0;i<model.arms.length;i++){model.arms[i].rotation.x=-walk*.62*(i%2?-1:1);model.arms[i].rotation.z=0;}
    model.body.position.y=moving?Math.abs(Math.sin(time*15))*(reduced?.035:.065):Math.sin(ambientTime*2.2)*.025;
    model.body.rotation.x=dashing?-.19:0;
    for(let i=0;i<model.wings.length;i++)model.wings[i].rotation.z=Math.sin(ambientTime*(model.family==='bees'?16:4))*.17*(i%2?-1:1);
    if(model.family==='vortex'&&model.ornaments[0])model.ornaments[0].rotation.z=ambientTime*.5;
    animateFallbackStrike(model,attack,state.t);
    animateAsset(hero,{time:isMenu?time:state.t,moving,timedAttack:attack,hit:p.hitFlash>0,dead:p.hp<=0&&!isMenu,menu:isMenu,reducedMotion:reduced});
    hero.visible=true;hero.rotation.z=model.rig?0:p.hp<=0&&!isMenu?-1.2:0;
    heroShadow.visible=!isMenu;heroShadow.position.set(p.x,.04,p.z);
    localRevive.position.set(p.x,0,p.z);if(!isMenu&&p.hp<=0&&state.phase==='playing'&&state.party?.length>1)showReviveRing(localRevive,p.reviveProgress);else localRevive.visible=false;
    reviveBase.opacity=.3+.14*Math.sin(ambientTime*4);
    aura.visible=!isMenu;aura.position.set(p.x,.065,p.z);aura.rotation.z=ambientTime*.25;aura.scale.setScalar(dashing?1.3:.87);aura.material=flat(p.invuln>0?'#efc6a9':'#d9cce9',.72);
    previewStage.visible=isMenu;previewStage.position.set(p.x,0,p.z);stageRing.rotation.z=ambientTime*.06;
    previewOrbits.visible=isMenu&&heroData.family==='orbit';
    for(let i=0;i<orbitPreviews.length;i++){const a=ambientTime*1.1+i/3*TAU;orbitPreviews[i].position.set(p.x+Math.cos(a)*2.35,1.4+Math.sin(a)*.3,p.z+Math.sin(a)*2.35);orbitPreviews[i].rotation.y=ambientTime*2;}
    entities.visible=!isMenu;labelScale=Math.min(width,height)<560?.8:1;updateAllies(state,time,isMenu);
    updateEnemies(state,state.t||0);updateProjectiles(state,time,heroData);combatTrails.update(state,heroData,viewBounds);updateGems(state,ambientTime,dt);updateEffects(state);updateTrails(state,dt,moving,dashing);
    renderer.render(scene,camera);
  }
  return{
    render,resize,renderer,getSpawnBounds,projectWorld,setReducedMotion,previewHero(id){previewOverride=id||null;},
    get mode(){return software?'software':'webgl';},
    dispose(){observer.disconnect();healthBatch?.dispose();enemyPool.clear();shotPool.clear();corpseBatch?.clear();removeEffects();combatTrails.dispose();environment.dispose();sanctum.dispose();const geometries=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});for(const g of geometries)g.dispose();for(const m of mats)m.dispose();renderer.dispose();renderer.domElement.remove();}
  };
}
