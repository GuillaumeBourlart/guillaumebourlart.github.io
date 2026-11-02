import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/addons/loaders/GLTFLoader.js';
import {clone} from '../vendor/addons/utils/SkeletonUtils.js';
import {CREATURE_ROSTER} from '../game/monster-roster.js';
import {HERO_SHAPES} from '../game/hero-stats.js';
import {enemyCreature} from '../game/creatures.js';

const templates=new Map(),textureCache=new Map(),materialCache=new Map(),loader=new GLTFLoader(),pending=new Map();
THREE.Cache.enabled=true;
const base=new URL('../assets/models/',import.meta.url);
export const DUNGEON_DECOR=Object.freeze(['chest','chest-gold','barrel-large','barrel-small-stack','box-stacked','crates-stacked','pillar','pillar-decorated','column','wall-broken','wall-arched','wall-cracked','rubble-large','rubble-half','torch-lit','torch-mounted','banner-blue','banner-red','banner-shield-blue','candle-triple','table-long-decorated-A','sword-shield-broken','floor-tile-small-broken-A','floor-tile-small-weeds-A','floor-tile-small-decorated','stairs-wide','bottle-A-green']);
let manifest=[];
let instanceSerial=0;
export async function loadAsset(key){
  if(templates.has(key))return templates.get(key);if(pending.has(key))return pending.get(key);
  const task=loader.loadAsync(new URL(key+'.glb',base).href).then(gltf=>{
    gltf.scene.traverse(o=>{
      if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
      const originals=Array.isArray(o.material)?o.material:[o.material],shared=originals.map(m=>{
        m.metalness=0;m.roughness=.84;
        if(m.alphaTest>0){m.alphaToCoverage=true;m.alphaTest=.2;}
        if(key.startsWith('nature-')&&m.name.includes('Leaves')){m.side=THREE.FrontSide;m.color.set('#b5c9bb');}
        for(const slot of ['map','normalMap','emissiveMap'])if(m[slot]){const t=m[slot],id=(t.name||key)+':'+slot;if(textureCache.has(id)&&textureCache.get(id)!==t){m[slot]=textureCache.get(id);t.dispose();}else textureCache.set(id,t);}
        const materialKey=[m.name,m.color.getHex(),m.map?.uuid,m.normalMap?.uuid,m.side,m.alphaTest,m.transparent,m.opacity].join(':');
        if(materialCache.has(materialKey)){const shared=materialCache.get(materialKey);if(shared!==m)m.dispose();return shared;}materialCache.set(materialKey,m);return m;
      });o.material=Array.isArray(o.material)?shared:shared[0];
      if(o.isSkinnedMesh)o.frustumCulled=false;
    });
    const box=new THREE.Box3().setFromObject(gltf.scene),size=box.getSize(new THREE.Vector3());
    const value={...gltf,box,size};templates.set(key,value);return value;
  }).finally(()=>pending.delete(key));pending.set(key,task);return task;
}
export async function preloadGameAssets(progress=()=>{}){
  manifest=await fetch(new URL('manifest.json',base)).then(r=>{if(!r.ok)throw new Error('Bibliothèque 3D indisponible');return r.json();});
  const keys=manifest.filter(m=>m.group!=='dungeon'||DUNGEON_DECOR.includes(m.name.replaceAll('_','-'))).map(m=>m.key),failed=[];let cursor=0,done=0;
  async function worker(){while(cursor<keys.length){const key=keys[cursor++];try{await loadAsset(key);}catch(error){failed.push(key);console.warn('Asset unavailable:',key,error.message);}progress(++done,keys.length);}}
  await Promise.all(Array.from({length:6},worker));return {loaded:done-failed.length,total:keys.length,failed};
}
export function assetReady(key){return templates.has(key);}
export function staticAsset(key,{height=1,width=Infinity,rotation=0}={}){
  const t=templates.get(key);if(!t)return null;
  const root=new THREE.Group(),model=t.scene.clone(true),s=Math.min(height/Math.max(.001,t.size.y),width/Math.max(.001,t.size.x,t.size.z));
  model.scale.multiplyScalar(s);model.position.add(new THREE.Vector3(-(t.box.min.x+t.box.max.x)*.5*s,-t.box.min.y*s,-(t.box.min.z+t.box.max.z)*.5*s));model.rotation.y=rotation;root.add(model);root.userData.assetKey=key;return root;
}
function animatedAsset(key,height,maxWidth=3.1){
  const t=templates.get(key);if(!t)return null;
  const root=new THREE.Group(),body=new THREE.Group(),model=clone(t.scene),s=Math.min(height/Math.max(.01,t.size.y),maxWidth/Math.max(.01,t.size.x));
  model.scale.multiplyScalar(s);model.position.set(-(t.box.min.x+t.box.max.x)*.5*s,-t.box.min.y*s,-(t.box.min.z+t.box.max.z)*.5*s);body.add(model);root.add(body);
  const mixer=new THREE.AnimationMixer(model),clips=new Map(t.animations.map(c=>[c.name.toLowerCase(),c])),actions=new Map();
  const phase=(++instanceSerial%31)/31;
  root.userData={assetKey:key,body,legs:[],arms:[],wings:[],ornaments:[],baseScale:1,floating:key.startsWith('flying-'),portraitFocus:[0,height*.68,.05],rig:{mixer,clips,actions,current:'',action:null,lastTime:null,lastHit:false,attackUntil:0,hitUntil:0,seed:phase,accumulated:phase/30}};
  animateAsset(root,{time:0,menu:true});return root;
}
export function importedHero(hero){
  const height=hero.group==='blob'?1.85:2.35,root=animatedAsset(hero.modelKey,height);if(!root)return null;
  Object.assign(root.userData,{heroId:hero.id,family:hero.family,delivery:hero.spell?.delivery,baseScale:HERO_SHAPES[hero.id]?.modelScale||(hero.group==='blob'?.85:1),form:hero.group});return root;
}
export function importedEnemy(key,type){return animatedAsset(key,type==='boss'?1.9:key.startsWith('big-')?1.65:1.4,2.4);}
const choose=(clips,candidates)=>candidates.find(name=>clips.has(name))||clips.keys().next().value;
export function animateAsset(root,{time=0,moving=false,attack=false,hit=false,dead=false,menu=false,reducedMotion=false,rate=60}={}){
  const rig=root?.userData?.rig;if(!rig)return;
  if(rig.lastTime!==null&&time<rig.lastTime-.0001){rig.mixer.stopAllAction();rig.current='';rig.action=null;rig.attackUntil=rig.hitUntil=0;rig.attackRanged=false;rig.lastHit=false;rig.accumulated=0;}
  const dt=rig.lastTime===null?0:Math.min(.1,Math.max(0,time-rig.lastTime));rig.lastTime=time;
  if(hit&&!rig.lastHit)rig.hitUntil=time+.24;rig.lastHit=hit;
  if(attack){rig.attackUntil=time+.32;rig.attackRanged=attack==='cast'||root.userData.delivery&&!['melee','orbit'].includes(root.userData.delivery);}
  const state=dead?'death':time<rig.hitUntil?'hit':time<rig.attackUntil?'attack':moving?'move':'idle';
  const ranged=rig.attackRanged||root.userData.delivery&&!['melee','orbit'].includes(root.userData.delivery);
  const names={death:['death'],hit:['hitreact','hitreceive'],attack:ranged?['weapon','yes','headbutt','punch','bite_front']:['punch','bite_front','headbutt','weapon'],move:['run','fast_flying','walk','flying_idle'],idle:['idle','flying_idle','walk']};
  const clipName=choose(rig.clips,names[state]);if(!clipName)return;
  const changed=rig.current!==clipName;
  if(changed){
    let next=rig.actions.get(clipName);if(!next){next=rig.mixer.clipAction(rig.clips.get(clipName));rig.actions.set(clipName,next);}
    const once=state==='death'||state==='hit';next.reset().setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);next.clampWhenFinished=once;next.time=state==='idle'?rig.seed*next.getClip().duration:0;next.play();
    if(rig.action&&rig.action!==next)next.crossFadeFrom(rig.action,.12,true);rig.action=next;rig.current=clipName;
  }
  rig.accumulated=(rig.accumulated||0)+dt;
  if(changed||rig.accumulated>=1/rate){if(!(menu&&reducedMotion)){rig.mixer.update(rig.accumulated*(state==='move'?1.15:1));rig.poseVersion=(rig.poseVersion||0)+1;}rig.accumulated=0;}
}
export function releaseAsset(root){const skeletons=new Set();root?.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton)skeletons.add(o.skeleton);if(o.userData.rig){o.userData.rig.mixer.stopAllAction();o.userData.rig.mixer.uncacheRoot(o.userData.rig.mixer.getRoot());}});for(const skeleton of skeletons)skeleton.dispose();}

export function enemySpecies(e){return enemyCreature(e).modelKey;}
