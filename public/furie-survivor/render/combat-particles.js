import * as THREE from '../vendor/three.module.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=(v,f=0)=>Number.isFinite(v)?v:f;
const palette={fireball:'#ffbd72',dragon:'#ffa95c',frost:'#bcefff',thorns:'#bce892',bees:'#ffe2a3',bow:'#ffedb7',daggers:'#d3e9ff',stars:'#c9bcff',boomerang:'#c6e6ff',grenade:'#ffd1a3'};
const hash=n=>{const v=Math.sin(n*12.9898+78.233)*43758.5453;return v-Math.floor(v);};

/** Simulation-clock particles: one instanced draw on WebGL, a bounded mesh pool
 * on the software fallback. No gameplay state is changed by this adapter. */
export function createCombatTrails(parent,{software=false,capacity=software?240:384,reducedMotion=false}={}){
  capacity=clamp(Math.floor(capacity)||1,1,640);
  const layer=new THREE.Group();layer.name='combat-trails';parent.add(layer);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute([0,.5,0,.5,0,0,0,-.5,0,-.5,0,0],3));geometry.setIndex([0,1,2,0,2,3]);
  const material=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.76,depthWrite:false,side:THREE.DoubleSide});
  const batch=software?null:new THREE.InstancedMesh(geometry,material,capacity);
  if(batch){batch.name='projectile-trail-batch';batch.count=0;batch.frustumCulled=false;batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);layer.add(batch);}
  const particles=[],emitters=new Map(),color=new THREE.Color(),white=new THREE.Color('#ffffff'),matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),position=new THREE.Vector3(),scale=new THREE.Vector3(),rotation=new THREE.Euler();
  let cursor=0,serial=0,runId=null,lastTime=null,disposed=false,reduced=!!reducedMotion;

  function clear(){for(const p of particles){p.life=0;if(p.mesh)p.mesh.visible=false;}emitters.clear();if(batch)batch.count=0;cursor=0;lastTime=null;}
  function acquire(){
    let p;
    if(particles.length<capacity){p={life:0};particles.push(p);if(software){const own=material.clone();const m=new THREE.Mesh(geometry,own);m.name='projectile-trail';m.visible=false;layer.add(m);p.mesh=m;}}
    else{p=particles[cursor];cursor=(cursor+1)%capacity;}
    return p;
  }
  function emit(shot,hero,x,y,z,heading,born,segment){
    const orbital=shot.type==='orbit',flame=['fireball','dragon','grenade'].includes(shot.family),spark=serial++%3===0,h=hash(serial),p=acquire();
    const base=shot.hostile?'#ff929a':orbital?(spark?'#fff1bd':'#c9b4ff'):palette[shot.family]||shot.color||hero.accent||'#d8c5ff';
    color.set(base).lerp(white,spark?.3:.06);
    Object.assign(p,{x,y,z,born,life:(orbital?.43:flame?.35:.23)*(reduced?.6:1),heading:heading+(flame&&spark?Math.PI*.12:0),width:(orbital?.12:flame?.15:.07)*(spark?1.45:1),length:clamp(segment*(orbital?1.35:.9),.14,orbital?.7:.48),driftX:flame?(h-.5)*.23:0,driftZ:flame?(hash(serial+11)-.5)*.23:0,rise:flame?.35:orbital?.07:.02,color:color.getHex(),spark});
  }
  function draw(now){
    let used=0;
    for(const p of particles){
      const age=Math.max(0,now-p.born),left=p.life>0?clamp(1-age/p.life,0,1):0;
      if(left<=0){p.life=0;if(p.mesh)p.mesh.visible=false;continue;}
      const shrink=Math.pow(left,.7),width=p.width*shrink,length=p.length*(.25+.75*shrink);
      position.set(p.x+p.driftX*age,p.y+p.rise*age,p.z+p.driftZ*age);rotation.set(-Math.PI/2,0,p.heading);quaternion.setFromEuler(rotation);scale.set(width,length,1);
      if(p.mesh){p.mesh.visible=true;p.mesh.position.copy(position);p.mesh.quaternion.copy(quaternion);p.mesh.scale.copy(scale);p.mesh.material.color.setHex(p.color);p.mesh.material.opacity=left*(reduced?.5:.78);}
      else{matrix.compose(position,quaternion,scale);batch.setMatrixAt(used,matrix);color.setHex(p.color);batch.setColorAt(used,color);}
      used++;
    }
    if(batch){batch.count=used;batch.instanceMatrix.needsUpdate=true;if(batch.instanceColor)batch.instanceColor.needsUpdate=true;}
  }
  function update(state,hero={},bounds){
    if(disposed)return;
    const now=finite(state?.t),nextRun=state?.runId??state?.seed??'';
    if(nextRun!==runId||lastTime!==null&&now<lastTime){clear();runId=nextRun;}
    if(state?.phase==='menu'||state?.preview===true){clear();lastTime=now;return;}
    if(state?.phase!=='playing'){draw(now);lastTime=now;return;}
    const active=new Set();
    for(const shot of state.projectiles||[]){
      if(['mine','wave','vortex'].includes(shot.type)||!Number.isFinite(shot.x)||!Number.isFinite(shot.z))continue;
      if(bounds&&(shot.x<bounds.minX-4||shot.x>bounds.maxX+4||shot.z<bounds.minZ-4||shot.z>bounds.maxZ+4))continue;
      active.add(shot.id);
      const y=finite(shot.y,shot.type==='orbit'?1.15:.92)+.025,prev=emitters.get(shot.id);
      if(!prev){emitters.set(shot.id,{x:shot.x,y,z:shot.z,t:now,carry:0});continue;}
      const dt=now-prev.t,dx=shot.x-prev.x,dz=shot.z-prev.z,travel=Math.hypot(dx,dz);
      if(dt<=0)continue;
      const orbital=shot.type==='orbit',interval=(orbital?.022:shot.hostile?.065:.04)*(reduced?2:1);
      if(dt<=.3&&travel<12){
        const count=Math.min(16,Math.floor((prev.carry+dt+1e-9)/interval));
        if(travel>.012){const heading=Math.atan2(dx,dz);for(let i=0;i<count;i++){const offset=interval*(i+1)-prev.carry,u=clamp(offset/dt,0,1);emit(shot,hero,prev.x+dx*u,prev.y+(y-prev.y)*u,prev.z+dz*u,heading,prev.t+offset,travel*interval/dt);}}
        prev.carry=clamp(prev.carry+dt-count*interval,0,interval-1e-10);
      }else prev.carry=0;
      prev.x=shot.x;prev.y=y;prev.z=shot.z;prev.t=now;
    }
    for(const id of emitters.keys())if(!active.has(id))emitters.delete(id);
    draw(now);lastTime=now;
  }
  return{update,clear,setReducedMotion(value){reduced=!!value;},get stats(){return{allocated:particles.length,active:particles.filter(p=>p.life>0).length,emitters:emitters.size,capacity,instanced:!!batch};},dispose(){if(disposed)return;disposed=true;clear();for(const p of particles)p.mesh?.material.dispose();geometry.dispose();material.dispose();parent.remove(layer);particles.length=0;}};
}
