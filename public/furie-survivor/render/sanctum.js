import * as THREE from '../vendor/three.module.js';
import {GEO,TAU,material,flat,mesh,disc,ring,group,contactShadow} from './models.js';
import {paintedMaterial} from './textures.js';

function sanctumFloor(){
  if(typeof document==='undefined')return paintedMaterial('stone','#303347');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d'),s=1024;
  c.fillStyle='#242d3d';c.fillRect(0,0,s,s);c.translate(512,512);
  const wash=c.createRadialGradient(-130,-120,0,0,0,520);wash.addColorStop(0,'#61717a');wash.addColorStop(.55,'#37485b');wash.addColorStop(1,'#202838');c.fillStyle=wash;c.fillRect(-512,-512,1024,1024);
  for(let r=70;r<500;r+=46){c.strokeStyle=r%3?'#bec0ae22':'#d3b77b75';c.lineWidth=2;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();for(let i=0;i<24;i++){const a=(i+(r/46%2)*.5)/24*TAU;c.strokeStyle='#15202c66';c.beginPath();c.moveTo(Math.sin(a)*r,Math.cos(a)*r);c.lineTo(Math.sin(a)*(r+46),Math.cos(a)*(r+46));c.stroke();}}
  c.strokeStyle='#b8a8d45e';c.lineWidth=3;for(const r of[141,280,452]){c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();}
  for(let i=0;i<16;i++){const a=i/16*TAU;c.save();c.rotate(a);c.translate(0,350);c.strokeStyle='#d3bf8e';c.lineWidth=3;c.beginPath();c.moveTo(-9,-13);c.lineTo(8,-3);c.lineTo(-7,12);c.moveTo(0,-14);c.lineTo(0,14);c.stroke();c.restore();}
  c.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%2?36:120;i?c.lineTo(Math.sin(a)*r,Math.cos(a)*r):c.moveTo(Math.sin(a)*r,Math.cos(a)*r);}c.closePath();c.strokeStyle='#d3c39599';c.stroke();
  for(let i=0;i<180;i++){const a=i*2.4,r=30+(i*37)%460,x=Math.sin(a)*r,y=Math.cos(a)*r;c.strokeStyle='#131f3440';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x+8,y+12);c.lineTo(x+5,y+20);c.stroke();}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map,roughness:.92});
}

/** A separate guardian chamber, with a clear playable floor and detail at its perimeter. */
export function createSanctum(scene,{software=false}={}){
  const layer=group(scene);layer.name='guardian-sanctum';layer.visible=false;
  const stone=paintedMaterial('stone','#4b5062'),dark=paintedMaterial('stone','#282c43'),trim=material('#bdab82'),flames=[],banners=[],sigils=[];
  mesh(GEO.cylinder16,dark,0,-.20,0,23.4,.4,23.4,layer);
  const floorMat=sanctumFloor(),floor=disc(floorMat,0,.016,0,22.5,layer);floor.userData.uniqueMaterial=!!floorMat.map;floor.userData.ownedTexture=floorMat.map;
  for(const radius of[6.5,13.2,21.6])ring(flat('#bb9ad9',radius>20?.58:.14),0,.035,0,radius,layer);
  for(let i=0;i<12;i++){
    const a=i/12*TAU,x=Math.sin(a)*21.7,z=Math.cos(a)*21.7,g=group(layer,x,0,z);g.rotation.y=a;
    contactShadow(g,.15,.15,1.5,.5);
    mesh(GEO.cylinder16,dark,0,.15,0,.95,.3,.95,g);mesh(GEO.cylinder16,stone,0,.43,0,.76,.25,.76,g);
    mesh(GEO.cylinder,stone,0,1.7,0,.46,2.35,.46,g);for(const y of[.68,2.6])mesh(GEO.cylinder16,trim,0,y,0,.59,.14,.59,g);
    if(!software)for(let j=0;j<5;j++){const angle=j/5*TAU;mesh(GEO.cylinder,material('#62667b'),Math.sin(angle)*.47,1.7,Math.cos(angle)*.47,.045,1.75,.045,g);}
    mesh(GEO.cylinder16,dark,0,2.84,0,.72,.30,.72,g);
    const bowl=mesh(GEO.cone,trim,0,3.12,0,.53,.38,.53,g);bowl.rotation.z=Math.PI;
    const fire=group(g,0,3.25,0);mesh(GEO.round,material(i%2?'#d5bcff':'#ffcda1',.9),0,.12,0,.26,.46,.26,fire);mesh(GEO.gem,material('#fff0da',.9),0,.18,.02,.12,.32,.12,fire);flames.push(fire);
    if(!software&&i%3===0){const l=new THREE.PointLight(i%2?'#ad8cff':'#ffb882',13,9,2);l.position.set(x,3.8,z);layer.add(l);}
    if(i%3===0){const b=group(g,0,2.1,-.64);mesh(GEO.plane,paintedMaterial('cloth','#635276'),0,0,0,.73,1.65,1,b);mesh(GEO.gem,trim,0,.1,.015,.16,.31,.025,b);banners.push(b);}
    const rune=mesh(GEO.gem,material('#d4b7ef',.24),Math.sin(a)*18,.05,Math.cos(a)*18,.14,.025,.3,layer);rune.rotation.y=a;sigils.push(rune);
  }
  // Broken stairs, framing arches and crystal clusters never change the collision arena.
  for(let i=0;i<4;i++){
    const a=i/4*TAU+Math.PI/4,g=group(layer,Math.sin(a)*24,0,Math.cos(a)*24);g.rotation.y=a;
    for(const side of[-1,1]){mesh(GEO.cylinder16,stone,side*1.7,2.05,0,.48,4.1,.48,g);mesh(GEO.cylinder16,dark,side*1.7,.2,0,.79,.4,.79,g);}
    const archGeo=new THREE.TorusGeometry(1,.16,5,18,Math.PI),arch=mesh(archGeo,stone,0,3.9,0,1.7,1.5,1.7,g);arch.userData.uniqueGeometry=true;
    for(let j=0;j<3;j++){const shard=mesh(GEO.gem,material(j%2?'#917bac':'#b8b4d6',.12),-2.5+j*.4,.35+j*.2,.4,.22,.6+j*.23,.2,g);shard.rotation.z=(j-1)*.28;}
  }
  const debris=[];for(let i=0;i<(software?12:45);i++){const a=i*2.4,r=22.9+(i%3)*.7;const o=mesh(GEO.ball,i%2?dark:stone,Math.sin(a)*r,.13,Math.cos(a)*r,.15+i%3*.1,.12,.2,layer);o.rotation.y=a;debris.push(o);}
  function update(state,time,reduced){
    layer.visible=!!state.rift?.arenaActive;if(!layer.visible)return;const t=reduced?0:time;
    for(let i=0;i<flames.length;i++){const f=flames[i];f.scale.set(1+Math.sin(t*3+i)*.06,1+Math.sin(t*4+i)*.14,1);f.rotation.y=t*.35+i;}
    for(let i=0;i<banners.length;i++)banners[i].rotation.x=Math.sin(t*1.2+i)*.035;
  }
  return{layer,update,dispose(){floorMat.map?.dispose();}};
}
