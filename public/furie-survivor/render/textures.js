import * as THREE from '../vendor/three.module.js';

// Original, deterministic painted materials. Small shared canvases, no downloads.
const textures=new Map(),materials=new Map();
const randFrom=seed=>{let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};};
const hash=s=>[...s].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
function color(hex,light){const c=new THREE.Color(hex);c.multiplyScalar(light);return '#'+c.getHexString();}
export function paintedTexture(kind,base){
  const key=kind+':'+base;if(textures.has(key))return textures.get(key);
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');if(!ctx)return null;
  const r=randFrom(hash(key)),s=512;ctx.fillStyle=base;ctx.fillRect(0,0,s,s);
  const wash=(x,y,radius,c,alpha)=>{ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,radius);g.addColorStop(0,c);g.addColorStop(1,base);ctx.fillStyle=g;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);};
  // Broad, low-contrast painted masses keep monsters and rewards readable.
  for(let i=0;i<16;i++)wash(r()*s,r()*s,75+r()*160,color(base,.84+r()*.3),.17);
  ctx.globalAlpha=1;
  if(['forest','swamp','crystal','desert'].includes(kind)){
    const palettes={forest:['#3c655e','#567c68','#80937a','#4c7568'],swamp:['#355c62','#47716e','#65847b','#76918a'],crystal:['#5c6380','#7e8a9e','#6f7b94','#a2b3bd'],desert:['#a38870','#bba184','#cfb598','#b4997e']};
    const p=palettes[kind];
    if(kind==='desert'){
      ctx.lineWidth=2.2;for(let y=-20;y<560;y+=42){ctx.beginPath();for(let x=-20;x<550;x+=10){const yy=y+Math.sin(x*.012+y*.025)*11; x===-20?ctx.moveTo(x,yy):ctx.lineTo(x,yy);}ctx.strokeStyle=p[Math.floor(r()*p.length)];ctx.globalAlpha=.17;ctx.stroke();}
    }
    for(let i=0;i<(kind==='desert'?95:160);i++){
      const x=r()*s,y=r()*s,k=3+r()*6;ctx.globalAlpha=.1+r()*.13;ctx.fillStyle=p[Math.floor(r()*p.length)];
      if(kind==='forest'||kind==='swamp'){
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1-r()*2,y-k);ctx.lineTo(x+2,y-1);ctx.fill();
        if(i%4===0){ctx.beginPath();ctx.moveTo(x+4,y+1);ctx.lineTo(x+7,y-k*.6);ctx.lineTo(x+6,y+2);ctx.fill();}
      }else if(kind==='crystal'){
        ctx.beginPath();ctx.moveTo(x,y-k);ctx.lineTo(x+k,y);ctx.lineTo(x,y+k*.5);ctx.lineTo(x-k*.4,y);ctx.closePath();ctx.fill();
      }else{ctx.fillRect(x,y,1+r()*2,1);}
    }
    for(let i=0;i<12;i++){
      const x=r()*s,y=r()*s,rx=2+r()*3;ctx.globalAlpha=.24;ctx.fillStyle=kind==='desert'?'#dbc6aa':kind==='crystal'?'#acb9cf':'#a6b29a';ctx.beginPath();ctx.ellipse(x,y,rx,rx*.6,r()*6,0,Math.PI*2);ctx.fill();
    }
  }else if(kind==='water'){
    ctx.lineCap='round';
    for(let i=0;i<45;i++){const x=r()*s,y=r()*s;ctx.globalAlpha=.06+r()*.045;ctx.strokeStyle=i%3?'#b4d1dd':'#9bace0';ctx.lineWidth=2+r()*4;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+8,y-3,x+21,y+3,x+30+r()*26,y);ctx.stroke();}
  }else if(kind==='stone'){
    // Stone is a material, not a repeated brick wall on every little prop.
    for(let i=0;i<11;i++){const x=r()*s,y=r()*s;ctx.globalAlpha=.1;ctx.strokeStyle=color(base,i%2?.68:1.2);ctx.lineWidth=1+r()*2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12+r()*37,y+9+r()*20);ctx.lineTo(x+35+r()*42,y+4+r()*30);ctx.stroke();}
    const bevel=ctx.createLinearGradient(0,0,512,512);bevel.addColorStop(0,'#ffffff14');bevel.addColorStop(.35,'#ffffff00');bevel.addColorStop(1,'#1822381a');ctx.globalAlpha=1;ctx.fillStyle=bevel;ctx.fillRect(0,0,s,s);
  }else if(kind==='wood'){
    for(let x=0;x<512;x+=128){ctx.fillStyle=color(base,.88+r()*.19);ctx.fillRect(x,0,126,512);ctx.fillStyle=color(base,.73);ctx.fillRect(x,0,2,512);}
    ctx.lineWidth=1.5;for(let i=0;i<40;i++){const x=r()*s;ctx.strokeStyle=color(base,.7+r()*.45);ctx.globalAlpha=.18;ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+18,160,x-14,350,x+5,512);ctx.stroke();}
    for(let i=0;i<10;i++){ctx.globalAlpha=.28;ctx.strokeStyle=color(base,.45);ctx.beginPath();ctx.ellipse(r()*s,r()*s,3+r()*8,12+r()*20,0,0,Math.PI*2);ctx.stroke();}
  }else if(kind==='cloth'){
    for(let y=0;y<s;y+=7){ctx.globalAlpha=.045;ctx.fillStyle=y%14?'#ffffff':'#142a39';ctx.fillRect(0,y,s,1);}
    for(let x=0;x<s;x+=8){ctx.globalAlpha=.035;ctx.fillStyle='#ffffff';ctx.fillRect(x,0,1,s);}
    const g=ctx.createLinearGradient(0,0,512,512);g.addColorStop(0,'#ffffff33');g.addColorStop(.4,'#ffffff00');g.addColorStop(1,'#07192355');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(0,0,s,s);
  }
  ctx.globalAlpha=1;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.name='Azur painted '+kind;texture.userData.originalProcedural=true;textures.set(key,texture);return texture;
}
export function paintedMaterial(kind,base,{flat=false,glow=0}={}){
  const key=[kind,base,flat,glow].join(':');if(materials.has(key))return materials.get(key);
  const map=paintedTexture(kind,base),parameters={color:map?'#ffffff':base,map,side:THREE.DoubleSide};
  const mat=flat?new THREE.MeshBasicMaterial(parameters):new THREE.MeshStandardMaterial({...parameters,roughness:.91,metalness:0,flatShading:true,emissive:base,emissiveIntensity:glow});
  materials.set(key,mat);return mat;
}
export function labelTexture(text,{color='#fff5ce',stroke='#142c39',size=72}={}){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const c=canvas.getContext('2d');if(!c)return null;c.font=`900 ${size}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=9;c.strokeStyle=stroke;c.strokeText(text,128,66);c.fillStyle=color;c.fillText(text,128,66);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

// A soft, irregular fringe hides the square chunk boundary between regions.
export function fringeMaterial(kind,base){
  const key='fringe:'+kind+':'+base;if(materials.has(key))return materials.get(key);
  const source=paintedTexture(kind,base);if(!source)return paintedMaterial(kind,base,{flat:true});
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');c.drawImage(source.image,0,0);
  c.globalCompositeOperation='destination-in';const fade=c.createLinearGradient(100,0,460,0);fade.addColorStop(0,'#ffffffff');fade.addColorStop(.28,'#ffffffef');fade.addColorStop(.68,'#ffffff55');fade.addColorStop(1,'#ffffff00');c.fillStyle=fade;c.fillRect(0,0,512,512);
  // Offset cut-outs create an organic shore rather than a perfectly straight fade.
  c.globalCompositeOperation='destination-out';for(let i=0;i<9;i++){c.beginPath();c.ellipse(385+Math.sin(i*2)*36,i*65,55,28+i%3*9,Math.sin(i)*.5,0,Math.PI*2);c.fill();}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:THREE.DoubleSide});materials.set(key,mat);return mat;
}

function decalMaterial(key,size,draw,{color='#ffffff',opacity=1}={}){
  if(materials.has(key))return materials.get(key);
  let map=null;
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d');
    if(c){draw(c,size);map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.userData.originalProcedural=true;}
  }
  const mat=new THREE.MeshBasicMaterial({color:map?'#ffffff':color,map,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});materials.set(key,mat);return mat;
}

/** Two triangles per soft contact shadow, shared by every actor and prop. */
export function shadowMaterial(opacity=.36){
  return decalMaterial('contact-shadow:'+opacity,128,(c,s)=>{
    const g=c.createRadialGradient(s/2,s/2,s*.08,s/2,s/2,s*.48);
    g.addColorStop(0,'#182334d9');g.addColorStop(.32,'#1823348c');g.addColorStop(.72,'#18233428');g.addColorStop(1,'#18233400');c.fillStyle=g;c.fillRect(0,0,s,s);
  },{color:'#182334',opacity});
}

/** Gentle winding routes are painted once, not assembled from noisy blocks. */
export function pathMaterial(biome,axis='vertical'){
  const color={forest:'#9aa38a',swamp:'#869d94',crystal:'#a3afbc',desert:'#d4bda0'}[biome]||'#9aa38a';
  return decalMaterial('path:'+biome+':'+axis,512,(c,s)=>{
    const stroke=()=>{c.beginPath();c.moveTo(256,-24);c.bezierCurveTo(206,130,306,378,256,536);};
    const paint=()=>{
      c.lineCap='round';c.strokeStyle=color;
      for(const[w,a]of[[155,.06],[141,.1],[126,.15],[112,.28]]){c.lineWidth=w;c.globalAlpha=a;stroke();c.stroke();}
      c.globalAlpha=.24;c.strokeStyle='#e7e3ca';c.lineWidth=2;
      for(let y=45;y<512;y+=102){c.beginPath();c.moveTo(212,y);c.quadraticCurveTo(255,y+6,296,y-7);c.stroke();}
      c.globalAlpha=.2;c.fillStyle='#647363';for(let i=0;i<7;i++){const y=30+i*78,x=256+Math.sin(y*.017)*23;c.beginPath();c.ellipse(x+(i%2?65:-65),y,5,2.5,.2,0,Math.PI*2);c.fill();}
    };
    if(axis!=='horizontal')paint();
    if(axis!=='vertical'){c.save();c.translate(256,256);c.rotate(Math.PI/2);c.translate(-256,-256);paint();c.restore();}
    c.globalAlpha=1;
  },{color,opacity:1});
}

export function plazaMaterial(){
  return decalMaterial('astral-plaza',512,(c,s)=>{
    c.fillStyle='#788c94';c.fillRect(0,0,s,s);
    const light=c.createRadialGradient(190,130,0,256,256,340);light.addColorStop(0,'#c9c8b131');light.addColorStop(1,'#273b550d');c.fillStyle=light;c.fillRect(0,0,s,s);
    c.strokeStyle='#c7c8b080';c.lineWidth=3;for(const r of[174,211,241]){c.beginPath();c.arc(256,256,r,0,Math.PI*2);c.stroke();}
    c.strokeStyle='#354e6238';c.lineWidth=2;
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;c.beginPath();c.moveTo(256+Math.sin(a)*174,256+Math.cos(a)*174);c.lineTo(256+Math.sin(a)*240,256+Math.cos(a)*240);c.stroke();}
    c.strokeStyle='#d9c9a9a8';c.lineWidth=3;c.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=i%2?36:135;i?c.lineTo(256+Math.sin(a)*r,256+Math.cos(a)*r):c.moveTo(256+Math.sin(a)*r,256+Math.cos(a)*r);}c.closePath();c.stroke();
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;c.save();c.translate(256+Math.sin(a)*224,256+Math.cos(a)*224);c.rotate(-a);c.fillStyle=i%3?'#e1d3b078':'#ddd1b8c0';c.fillRect(-1.5,-6,3,12);c.restore();}
  },{color:'#788c94'});
}

export function riftMaterial(tier=1){
  const palette=[['#c6b3f2','#7774b8'],['#b4e4e9','#527ca3'],['#efb0a5','#a96d89'],['#ebd29d','#af9562']][(Math.max(1,tier)-1)%4];
  return decalMaterial('rift-core:'+((Math.max(1,tier)-1)%4),256,(c,s)=>{
    const g=c.createRadialGradient(128,128,9,128,128,126);g.addColorStop(0,'#181d36ff');g.addColorStop(.42,'#343253f8');g.addColorStop(.73,palette[1]+'e8');g.addColorStop(.86,palette[0]+'d0');g.addColorStop(1,palette[0]+'00');c.fillStyle=g;c.fillRect(0,0,s,s);
    c.lineCap='round';
    for(let arm=0;arm<3;arm++){
      c.beginPath();for(let i=0;i<=42;i++){const t=i/42,a=arm*Math.PI*2/3+t*3.9,r=12+t*100,x=128+Math.sin(a)*r,y=128+Math.cos(a)*r;i?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=palette[0]+'91';c.lineWidth=3.5;c.stroke();
    }
    c.fillStyle='#f8e9d3';c.beginPath();c.arc(128,128,4,0,Math.PI*2);c.fill();
  },{color:palette[0]});
}

/** Shared two-triangle terrain decals; the perimeter matches the rule radius. */
export function terrainZoneMaterial(type='mud'){
  const ice=type==='ice',base=ice?'#88d3e2':'#71563d';
  return decalMaterial('terrain-zone:'+type,256,(c,s)=>{
    const r=randFrom(hash(type)),mid=s/2,edge=s*.485;
    c.save();c.beginPath();c.arc(mid,mid,edge,0,Math.PI*2);c.clip();
    const g=c.createRadialGradient(mid-28,mid-35,9,mid,mid,edge);
    if(ice){g.addColorStop(0,'#c1edf1e6');g.addColorStop(.7,'#63b1c6d9');g.addColorStop(1,'#a3e2ed8c');}
    else{g.addColorStop(0,'#4a483ddf');g.addColorStop(.74,'#756245e8');g.addColorStop(1,'#a2936580');}
    c.fillStyle=g;c.fillRect(0,0,s,s);
    if(ice){
      c.strokeStyle='#e0fcffb8';c.lineWidth=2.4;c.lineJoin='round';
      for(let i=0;i<7;i++){const a=i*Math.PI*2/7,x=mid+Math.cos(a)*edge,y=mid+Math.sin(a)*edge;c.beginPath();c.moveTo(x,y);c.lineTo(mid+Math.cos(a+.4)*edge*.53,mid+Math.sin(a+.4)*edge*.53);c.lineTo(mid+Math.cos(a-.13)*edge*.29,mid+Math.sin(a-.13)*edge*.29);c.stroke();}
      c.strokeStyle='#f2ffff63';c.lineWidth=8;c.lineCap='round';for(let i=0;i<3;i++){c.beginPath();c.moveTo(35+i*47,90+i*22);c.lineTo(83+i*47,56+i*22);c.stroke();}
    }else{
      for(let i=0;i<18;i++){const x=18+r()*220,y=18+r()*220,rr=3+r()*13;c.fillStyle=i%3?'#a08c5b34':'#292e335e';c.beginPath();c.ellipse(x,y,rr,rr*.45,r(),0,Math.PI*2);c.fill();c.strokeStyle='#b8a16b4d';c.lineWidth=1;c.stroke();}
      c.strokeStyle='#b4a06b54';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(mid+i*12,mid+18*i,30+i*15,8+i*5,-.3,0,Math.PI);c.stroke();}
    }
    c.restore();c.strokeStyle=ice?'#bdf4ffbf':'#c5ae73b3';c.lineWidth=2.4;c.beginPath();c.arc(mid,mid,edge,0,Math.PI*2);c.stroke();
  },{color:base});
}
