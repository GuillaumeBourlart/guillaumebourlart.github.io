import * as THREE from '../vendor/three.module.js';
import {GEO,TAU,material,mesh,group,contactShadow} from './models.js';
import {paintedMaterial} from './textures.js';
import {batchStaticChildren} from './static-batch.js';

const leafGeometry=new THREE.SphereGeometry(1,7,5),smoothCache=new Map();
const smooth=c=>{if(!smoothCache.has(c))smoothCache.set(c,paintedMaterial('canopy',c));return smoothCache.get(c);};
function branch(parent,a,b,r){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),mid=new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5),o=mesh(GEO.cylinder,paintedMaterial('wood','#68523f'),mid.x,mid.y,mid.z,r,v.length(),r,parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
export function buildTree(parent,pal,r=1,{full=true,biome='forest',seed=0}={}){
  const trunk=paintedMaterial('wood',biome==='swamp'?'#63575d':'#796047');
  mesh(GEO.cylinder,trunk,0,r*.76,0,r*.17,r*1.55,r*.16,parent).rotation.z=.06;
  for(let i=0;i<4;i++){const a=i/4*TAU;branch(parent,[0,r*.35,0],[Math.sin(a)*r*.53,.06,Math.cos(a)*r*.51],r*.075);}
  const canopy=group(parent,0,r*1.10,0);
  if(biome==='desert'){
    for(let i=0;i<7;i++){const a=i/7*TAU,l=mesh(leafGeometry,smooth(i%2?pal.patch:pal.leaf),Math.sin(a)*r*.62,r*.7,Math.cos(a)*r*.62,r*.26,r*.95,r*.11,canopy);l.rotation.set(Math.cos(a)*1.0,0,-Math.sin(a)*1.0);}
  }else{
    const clusters=full?8:4;
    for(let i=0;i<clusters;i++){const a=i*2.4,h=i%3*.25,x=i===0?0:Math.sin(a)*r*.57,z=i===0?0:Math.cos(a)*r*.52;mesh(GEO.round,smooth([pal.leaf,pal.patch,pal.leaf,'#80a78e'][i%4]),x,r*(.55+h),z,r*(i===0?.94:.56),r*(i===0?.85:.51),r*(i===0?.89:.59),canopy);}
    if(full)for(let i=0;i<4;i++){const a=i*2.4+seed*.3;branch(parent,[0,r*1.05,0],[Math.sin(a)*r*.65,r*1.83,Math.cos(a)*r*.60],r*.06);}
    if(full&&biome==='swamp')for(let i=0;i<6;i++){const a=i/6*TAU,leaf=mesh(leafGeometry,smooth(pal.leaf),Math.sin(a)*r*.75,r*.08,Math.cos(a)*r*.75,r*.1,r*.7,r*.06,canopy);leaf.rotation.z=Math.sin(a)*.12;}
    if(full&&biome==='forest')for(let i=0;i<4;i++){const a=i*2.4+seed;mesh(GEO.round,material(i%2?'#edba7e':'#efc49c'),Math.sin(a)*r*.67,r*1.48,Math.cos(a)*r*.65,r*.085,r*.11,r*.085,parent);}
  }
  if(full)for(let i=0;i<5;i++){const a=i*2.4+seed,x=Math.sin(a)*r*.62,z=Math.cos(a)*r*.62;mesh(GEO.round,smooth(pal.dark),x,.13,z,.28,.19,.27,parent);for(let j=0;j<3;j++){const l=mesh(leafGeometry,smooth(pal.patch),x+(j-1)*.07,.25+j*.04,z,.055,.26,.025,parent);l.rotation.z=(j-1)*.42;}if(i%2===0)mesh(GEO.round,material('#e6c8a1'),x,.37,z,.06,.045,.06,parent);}
  if(full){batchStaticChildren(canopy);batchStaticChildren(parent);}
  return canopy;
}
export function dressCamp(home,{software=false}={}){
  if(software)return;
  const leaves=smooth('#507d6b'),stone=paintedMaterial('stone','#7f9195');
  for(const side of[-1,1]){
    const g=group(home,side*2.45,0,-5.1);
    for(let i=0;i<(software?4:10);i++){const y=.35+i*.27,x=Math.sin(i*1.4)*.33;const l=mesh(leafGeometry,leaves,x,y,.43,.12,.24,.045,g);l.rotation.z=side*(.5+Math.sin(i)*.4);if(i%3===0)mesh(GEO.round,material('#d9b5d2'),x+.13,y,.45,.085,.07,.06,g);}
    const patch=group(home,side*5.1,.03,-2.7);contactShadow(patch,0,0,.9,.22);
    for(let i=0;i<5;i++){const a=i*2.4;mesh(GEO.round,leaves,Math.sin(a)*.45,.18,Math.cos(a)*.4,.35,.26,.30,patch);}
    for(let i=0;i<6;i++){const a=i*2.4;mesh(GEO.round,material(i%2?'#d6b1d2':'#f2d9ac'),Math.sin(a)*.55,.37,Math.cos(a)*.5,.065,.06,.065,patch);}
    batchStaticChildren(g);batchStaticChildren(patch);
    const post=group(home,side*5.4,0,3.3);mesh(GEO.cylinder16,stone,0,.32,0,.40,.64,.4,post);mesh(GEO.cylinder16,material('#c2b38e'),0,.65,0,.49,.12,.49,post);mesh(GEO.gem,material('#b8cce2',.18),0,.99,0,.16,.26,.16,post);
  }
  for(let i=0;i<12;i++){const a=i*TAU/12,slab=mesh(GEO.softBox,stone,Math.sin(a)*5.1,.025,Math.cos(a)*5.1,.44,.08,.33,home);slab.rotation.y=a+.1;}
}
