import * as THREE from '../vendor/three.module.js';
import { GEO,TAU,material,flat,mesh,disc,group,contactShadow,disposeModel } from './models.js';
import { paintedMaterial,terrainZoneMaterial } from './textures.js';

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const phaseOf=id=>{let n=0;for(const c of String(id))n=(n*31+c.charCodeAt(0))%997;return n;};
const inside=(o,b,margin=0)=>!b||(o.x>=b.minX-margin&&o.x<=b.maxX+margin&&o.z>=b.minZ-margin&&o.z<=b.maxZ+margin);
function ownedMaterial(color,opacity=1){return new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:false});}
function ownMesh(mat,...args){const m=mesh(GEO.plane,mat,...args);m.userData.uniqueMaterial=true;return m;}
function makeZone(o){
  const g=group(),ice=o.type==='ice',r=o.radius||3;
  const floor=mesh(GEO.plane,terrainZoneMaterial(o.type),0,.027,0,r*2,r*2,1,g);floor.rotation.x=-Math.PI/2;floor.renderOrder=-45;
  const marker=group(g,-r*.67,.07,r*.63),color=ice?'#c8f5fa':'#e0c48c';
  disc(flat(ice?'#35657f':'#4b4438',.8),0,0,0,.37,marker);
  if(ice){
    for(let i=0;i<3;i++)mesh(GEO.box,flat(color),0,.025,0,.05,.035,.5,marker).rotation.y=i*TAU/6;
  }else{
    for(const s of[-1,1]){mesh(GEO.box,flat(color),s*.105,.025,s*.08,.11,.035,.23,marker).rotation.y=-.35;mesh(GEO.ball,flat(color),s*.105,.027,s*.08-.11,.06,.022,.045,marker);}
  }
  g.userData.floor=floor;g.userData.marker=marker;return g;
}
function makeTrap(o){
  const g=group(),r=o.radius||1.45,plate=disc(paintedMaterial('stone','#494858'),0,.03,0,r,g);plate.renderOrder=-20;
  const border=mesh(GEO.fineRing,flat('#b18b8b',.7),0,.06,0,r,r,r,g);border.rotation.x=-Math.PI/2;
  const warningMaterial=ownedMaterial('#ff796f',.16),warning=ownMesh(warningMaterial,0,.065,0,r*2,r*2,1,g);warning.rotation.x=-Math.PI/2;warning.geometry=GEO.disc;warning.scale.set(r,r,r);warning.renderOrder=-10;
  const progress=group(g);for(let i=0;i<12;i++){const segment=mesh(GEO.progress,flat('#ffb69b',.9),0,.078,0,r*1.04,r*1.04,r*1.04,progress);segment.rotation.set(-Math.PI/2,0,i*TAU/12);segment.visible=false;}
  const spikes=group(g),caps=group(g);
  for(let i=0;i<7;i++){
    const a=i/6*TAU,rr=i===6?0:r*.63,x=Math.cos(a)*rr,z=Math.sin(a)*rr;
    mesh(GEO.cylinder,material('#272e41'),x,.06,z,.14,.08,.14,caps);
    mesh(GEO.cone,material('#bdc7d5'),x,.42,z,.16,.8,.16,spikes);
    mesh(GEO.cone,material('#f0d3be'),x,.7,z,.07,.2,.07,spikes);
  }
  // A permanent, low triangular glyph identifies the trap before activation.
  const marker=mesh(GEO.cone,flat('#d6a18b'),0,.085,0,.25,.025,.25,g);marker.rotation.y=Math.PI;
  g.userData={...g.userData,spikes,border,warning,progress,marker,phase:'idle'};return g;
}
function makeBreakable(o){
  const g=group(),body=group(g),r=o.radius||.65,type=o.type||'crate',hp=o.hp??1;
  contactShadow(g,.05,.03,r*1.7,.35,.8);
  const loot=o.loot?.heal>0?'heal':o.loot?.type||o.loot||'xp',lootColor=loot==='heal'?'#a3e2b4':'#b3d7f3';
  if(type==='vase'){
    mesh(GEO.cylinder,paintedMaterial('stone','#a77787'),0,.34,0,r*.69,.68,r*.69,body);
    mesh(GEO.ball,paintedMaterial('stone','#c19a9b'),0,.48,0,r*.82,.53,r*.82,body);
    mesh(GEO.cylinder,material('#745774'),0,.95,0,r*.43,.19,r*.43,body);
    mesh(GEO.cylinder,material('#f0d1a6'),0,1.06,0,r*.52,.09,r*.52,body);
    for(const s of[-1,1])mesh(GEO.torus,material('#d4b399'),s*r*.83,.67,0,r*.25,r*.32,r*.2,body);
  }else if(type==='crystal'){
    mesh(GEO.ball,paintedMaterial('stone','#52617b'),0,.19,0,r,.3,r,body);
    for(let i=0;i<3;i++){const gem=mesh(GEO.gem,material(i?'#92b4cc':'#b7e7e5',.16),(i-1)*r*.36,.62+(i===1?.26:0),(i%2)*.12,r*.31,i===1?.9:.6,r*.3,body);gem.rotation.z=(i-1)*-.17;}
  }else{
    const w=r*1.65;
    mesh(GEO.box,paintedMaterial('wood','#9e734e'),0,.48,0,w,.93,w,body);
    for(const y of[.16,.8])mesh(GEO.box,paintedMaterial('wood','#dbb17b'),0,y,0,w+.06,.12,w+.06,body);
    for(const s of[-1,1])mesh(GEO.box,paintedMaterial('wood','#664c3c'),s*w*.36,.5,w*.505,.1,.7,.04,body);
    mesh(GEO.box,material('#dcc692'),0,.51,w*.54,.19,.2,.05,body);
    const brace=mesh(GEO.box,paintedMaterial('wood','#c69966'),0,.5,-w*.52,.1,.99,.05,body);brace.rotation.z=-.7;
  }
  const glint=group(g,0,type==='crystal'?1.65:1.4,0);
  if(loot==='heal'){mesh(GEO.box,flat(lootColor),0,0,0,.1,.34,.075,glint);mesh(GEO.box,flat(lootColor),0,0,0,.29,.1,.075,glint);}
  else mesh(GEO.gem,material(lootColor,.1),0,0,0,.1,.17,.1,glint);
  const flashMaterial=ownedMaterial('#fff0c7',.0);flashMaterial.transparent=true;
  const flash=mesh(GEO.ball,flashMaterial,0,.6,0,r*1.1,.7,r*1.1,g);flash.userData.uniqueMaterial=true;flash.visible=false;
  const bar=group(g,0,1.22,0);mesh(GEO.box,flat('#1d2439'),0,0,0,1.02,.09,.06,bar);const fill=mesh(GEO.box,flat('#ef8e81'),0,0,.04,.96,.055,.04,bar);bar.visible=false;
  g.userData={...g.userData,body,glint,glintY:glint.position.y,bar,fill,flash,lastHp:hp,hitAt:-100};return g;
}
function makePickup(){
  const g=group(),body=group(g,0,.6,0);contactShadow(g,0,0,.7,.26);
  const halo=disc(flat('#a0f0b5',.17),0,.055,0,.7,g);
  mesh(GEO.ball,material('#ec8192',.13),0,0,0,.32,.35,.31,body);
  mesh(GEO.box,flat('#fff8df'),0,.06,.28,.09,.33,.05,body);mesh(GEO.box,flat('#fff8df'),0,.06,.28,.29,.09,.05,body);
  const leaf=mesh(GEO.gem,material('#cce6ac'),.08,.36,0,.15,.06,.09,body);leaf.rotation.z=.4;
  g.userData={...g.userData,body,halo};return g;
}

/** View-only reconciliation; missing or completed streamed objects are removed. */
export function createTerrainFeatures(layer){
  const maps={zone:new Map(),trap:new Map(),breakable:new Map(),pickup:new Map()};let run='';
  const drop=(map,id,g)=>{layer.remove(g);disposeModel(g);map.delete(id);};
  function clear(){for(const map of Object.values(maps))for(const[id,g]of map)drop(map,id,g);}
  function reconcile(kind,list,make,state,time,bounds,isMenu,reduced){
    const map=maps[kind],active=new Set();
    for(const o of list||[]){
      if(o.destroyed||o.collected||o.hp===0||!inside(o,bounds,(o.radius||1)+2))continue;
      const id=o.id??`${o.x}:${o.z}`,signature=[o.type,o.radius,o.loot?.heal>0?'heal':'xp'].join(':');active.add(id);
      let g=map.get(id);if(g&&g.userData.signature!==signature){drop(map,id,g);g=null;}
      if(!g){g=make(o);g.name=kind+':'+id;Object.assign(g.userData,{featureType:kind,featureId:id,signature});map.set(id,g);layer.add(g);}
      g.position.set(o.x,0,o.z);g.visible=!isMenu;
      const u=g.userData,phase=phaseOf(id),anim=reduced?0:time;
      if(kind==='trap'){
        const mode=o.phase||'idle',warning=mode==='warning',activeNow=mode==='active',cooling=mode==='cooldown',p=clamp(o.phaseProgress??((o.phaseTime||0)/(o.phaseDuration||1)));
        u.phase=mode;u.warning.visible=warning||activeNow;u.warning.material.opacity=activeNow?.36:.12+p*.2;
        u.border.material=flat(warning||activeNow?'#ff9a88':'#b18b8b',warning||activeNow?.9:.55);
        const height=activeNow?1:warning?.045:cooling?Math.max(.025,1-p*6):.025;u.spikes.scale.y=height;
        for(let i=0;i<12;i++)u.progress.children[i].visible=activeNow||warning&&p>i/12;
        u.marker.visible=!warning&&!activeNow;
      }else if(kind==='breakable'){
        if(o.hp<u.lastHp)u.hitAt=state.t;u.lastHp=o.hp;
        const age=(state.t||0)-u.hitAt,hit=age>=0&&age<.2?(1-age/.2):0;
        u.body.scale.set(1+hit*(reduced?.035:.12),1-hit*(reduced?.035:.11),1+hit*(reduced?.035:.12));
        u.body.rotation.z=reduced?0:Math.sin(age*36)*hit*.08;
        u.flash.visible=hit>0;u.flash.material.opacity=hit*(reduced?.11:.23);
        u.glint.position.y=u.glintY+Math.sin(anim*2+phase)*.07;u.glint.rotation.y=anim*.5;
        const fraction=clamp((o.hp||0)/(o.maxHp||1));u.bar.visible=fraction<.999;u.fill.scale.x=.96*fraction;u.fill.position.x=-(1-fraction)*.48;
      }else if(kind==='pickup'){
        u.body.position.y=.62+Math.sin(anim*2.7+phase)*.1;u.body.rotation.y=reduced?0:Math.sin(anim*.6+phase)*.3;
        u.halo.scale.setScalar(.64+Math.sin(anim*2+phase)*.035);
      }
    }
    for(const[id,g]of map)if(!active.has(id))drop(map,id,g);
  }
  return{
    update(state,time,bounds,{isMenu=false,reduced=false}={}){
      const nextRun=String(state.runId??state.seed??'');if(nextRun!==run){clear();run=nextRun;}
      reconcile('zone',state.zones,makeZone,state,time,bounds,isMenu,reduced);
      reconcile('trap',state.traps,makeTrap,state,time,bounds,isMenu,reduced);
      reconcile('breakable',state.breakables,makeBreakable,state,time,bounds,isMenu,reduced);
      reconcile('pickup',state.pickups,makePickup,state,time,bounds,isMenu,reduced);
    },dispose:clear
  };
}
