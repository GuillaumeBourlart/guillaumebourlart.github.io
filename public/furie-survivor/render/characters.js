import * as THREE from '../vendor/three.module.js';
import { HERO_SHAPES } from '../game/hero-stats.js';
import { paintedMaterial } from './textures.js';

// Authored silhouettes share geometry and materials; character state stays in the simulation.
const TAU=Math.PI*2,cache=new Map();
const G={
  skin:new THREE.SphereGeometry(1,16,10),
  oval:new THREE.SphereGeometry(1,10,6),
  low:new THREE.IcosahedronGeometry(1,0),
  rock:new THREE.IcosahedronGeometry(1,1),
  cone:new THREE.ConeGeometry(1,1,10),
  tube:new THREE.CylinderGeometry(1,1,1,10),
  gem:new THREE.OctahedronGeometry(1),
  ring:new THREE.TorusGeometry(1,.065,5,24),
  plane:new THREE.PlaneGeometry(1,1),
  lowRing:new THREE.TorusGeometry(1,.065,3,12),
};
const mat=(color,glow=0,metal=0)=>{const key=[color,glow,metal].join(':');if(!cache.has(key))cache.set(key,new THREE.MeshStandardMaterial({color,roughness:metal?.42:.7,metalness:metal,emissive:color,emissiveIntensity:glow}));return cache.get(key);};
const ink=mat('#192535'),gold=mat('#ecc777',.03,.58),ivory=mat('#fff0d4'),leather=mat('#39424b');
function group(parent,x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);parent?.add(g);return g;}
function part(parent,geo,m,x,y,z,sx,sy=sx,sz=sx){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o;}
const orb=(p,m,x,y,z,sx,sy=sx,sz=sx,geo=G.skin)=>part(p,geo,m,x,y,z,sx,sy,sz);
function simplify(model){
  model.traverse(o=>{
    if(o.geometry===G.skin)o.geometry=G.rock;else if(o.geometry===G.oval)o.geometry=G.low;else if(o.geometry===G.ring)o.geometry=G.lowRing;
    else if(o.geometry?.type==='TubeGeometry'){const p=o.geometry.parameters,old=o.geometry;o.geometry=new THREE.TubeGeometry(p.path,5,p.radius,3,p.closed);old.dispose();}
    else if(o.geometry?.type==='LatheGeometry'){const p=o.geometry.parameters,old=o.geometry;o.geometry=new THREE.LatheGeometry(p.points,7);old.dispose();}
  });
}
function link(p,m,a,b,r=.06,geo=G.tube){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=part(p,geo,m,...av.add(bv).multiplyScalar(.5).toArray(),r,v.length(),r);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
function curve(p,m,points,r=.05){const path=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),geo=new THREE.TubeGeometry(path,12,r,6,false),o=part(p,geo,m,0,0,0,1);o.userData.uniqueGeometry=true;return o;}
function lathe(p,m,points,x=0,y=0,z=0,scale=1){const geo=new THREE.LatheGeometry(points.map(v=>new THREE.Vector2(...v)),16),o=part(p,geo,m,x,y,z,scale);o.userData.uniqueGeometry=true;return o;}
function leaf(p,m,x,y,z,size=1,angle=0){const o=orb(p,m,x,y,z,.13*size,.36*size,.055*size,G.oval);o.rotation.z=angle;return o;}
function face(p,y,z,{skin=ivory,eye='#3b557a',spread=.16,robot=false,small=false}={}){
  for(const s of[-1,1]){
    if(!robot)orb(p,ivory,s*spread,y,z,.115,.145,.046,G.oval);
    orb(p,mat(eye,robot?.3:0),s*spread,y-.008,z+.036,robot?.10:.07,robot?.065:.102,.027,G.oval);
    if(!robot){orb(p,ink,s*spread,y-.008,z+.06,.038,.07,.018,G.oval);orb(p,mat('#ffffff',.15),s*spread-.022,y+.035,z+.074,.024,.031,.012,G.oval);}
    if(!small&&!robot){orb(p,mat('#e8a099'),s*(spread+.13),y-.18,z-.025,.09,.04,.02,G.oval);link(p,leather,[s*(spread-.075),y+.2,z-.025],[s*(spread+.07),y+.18,z-.025],.016);}
  }
  if(!robot){orb(p,skin,0,y-.13,z+.025,.07,.08,.07,G.oval);curve(p,mat('#935a59'),[[-.08,y-.25,z-.015],[0,y-.27,z+.005],[.08,y-.25,z-.015]],.012);}
}
function cloak(p,color,length=1){
  const geo=new THREE.PlaneGeometry(.97,1.25*length,6,6),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),t=(.625*length-y)/(1.25*length);pos.setXYZ(i,x*(.65+t*.58),y,-.12-Math.cos(x*9)*.055-t*t*.2);}geo.computeVertexNormals();
  const m=paintedMaterial('cloth',color),o=part(p,geo,m,0,1.05,-.28,1);o.userData.uniqueGeometry=true;
  for(const s of[-1,1])curve(p,gold,[[s*.32,1.67,-.37],[s*.45,1.06,-.5],[s*.56,.42,-.72]],.018);
  return o;
}
function rod(p,color,kind='gem'){
  link(p,mat('#765344'),[0,-.2,0],[0,1.6,0],.045);
  for(const y of[.1,.25,1.22])part(p,G.ring,gold,0,y,0,.105).rotation.x=Math.PI/2;
  part(p,G.gem,mat(color,.35),0,1.57,0,.19,.31,.19);
  const crown=part(p,G.ring,gold,0,1.56,0,.29,.36,.29);crown.rotation.y=.4;
  if(kind==='moon')part(p,G.ring,mat(color,.2),0,1.74,0,.39,.39,.16);
}
function sword(p,color,length=.85){
  part(p,G.gem,mat(color,.08,.5),0,length*.56,0,.13,length*.6,.055);
  link(p,gold,[-.22,.1,0],[.22,.1,0],.045);link(p,leather,[0,-.16,0],[0,.1,0],.055);
  orb(p,gold,0,-.19,0,.075);
}
function human(h,shape){
  const g=group(),body=group(g),family=h.family,coat=paintedMaterial('cloth',h.color),accent=mat(h.accent,.05,.12),skin=mat(h.skin),hair=mat(h.hair);
  const legs=[],arms=[],wings=[],ornaments=[];
  const sturdy=['hammer','fists','spear','grenade'].includes(family),tiny=shape.form==='tiny',robed=['orbit','fireball','wave','scythe','vortex'].includes(family);
  const width=sturdy?.43:tiny?.38:.32,headY=tiny?1.85:2.04;
  if(robed){lathe(body,coat,[[.43,.38],[.5,.47],[.34,.91],[.28,1.38],[.24,1.5]],0,0,0);part(body,G.ring,accent,0,.47,0,.48,.48,.48).rotation.x=Math.PI/2;}
  else{orb(body,coat,0,1.13,0,width,.48,.27);orb(body,leather,0,.69,0,width*.87,.2,.25);}
  if(!robed||family==='orbit')for(const s of[-1,1]){const leg=group(body,s*width*.48,.72,0);orb(leg,coat,0,-.21,0,.13,.29,.14);orb(leg,leather,0,-.51,.08,.17,.16,.25);part(leg,G.ring,gold,0,-.41,.02,.145,.145,.145).rotation.x=Math.PI/2;legs.push(leg);}
  const belt=part(body,G.tube,leather,0,.89,.005,width*1.04,.13,.29);orb(body,gold,0,.9,.297,.09,.085,.025,G.oval);
  for(const s of[-1,1]){
    const arm=group(body,s*(width+.09),1.42,0);orb(arm,coat,0,-.10,0,.17,.23,.18);link(arm,skin,[0,-.19,.015],[s*.025,-.47,.04],.095);orb(arm,skin,s*.025,-.50,.06,.12,.14,.115);
    part(arm,G.ring,accent,s*.018,-.36,.025,.108).rotation.x=Math.PI/2;arms.push(arm);
  }
  const right=group(arms[1],0,-.49,.16),left=group(arms[0],0,-.49,.16);
  orb(body,skin,0,headY,.015,.43,.48,.365);
  for(const s of[-1,1])orb(body,skin,s*.42,headY-.02,0,.085,.13,.08,G.oval);
  face(body,headY+.02,.36,{skin,eye:['orbit','wave'].includes(family)?'#7382b9':'#5a624e'});
  if(!['laser','stars'].includes(family)){
    orb(body,hair,0,headY+.27,-.07,.435,.28,.34);
    for(let i=0;i<5;i++){const x=(i-2)*.14;orb(body,hair,x,headY+.25-Math.abs(i-2)*.02,.22,.125,.18,.10,G.oval).rotation.z=(i-2)*.13;}
  }
  if(['orbit','wave','fireball'].includes(family))for(const s of[-1,1])curve(body,hair,[[s*.33,headY+.15,-.1],[s*.40,headY-.23,-.18],[s*.34,1.35,-.28],[s*.48,1.25,-.34]],.10);
  if(['bow','daggers','scythe','orbit','spear'].includes(family))cloak(body,h.color,1);
  switch(family){
    case'orbit':case'fireball':{
      if(h.id==='selene'){
        for(let i=-2;i<=2;i++)part(body,G.gem,ivory,i*.14,headY+.44+(2-Math.abs(i))*.045,.03,.08,.20,.06);
        const moonCrown=part(body,G.ring,accent,0,headY+.47,-.1,.46,.46,.13);moonCrown.rotation.y=.1;
      }else if(h.id==='cendre'){
        for(let i=-2;i<=2;i++){const flame=part(body,G.cone,mat(i%2?'#f5b76b':'#ba5a55',.08),i*.14,headY+.40+(2-Math.abs(i))*.05,-.03,.13,.47,.13);flame.rotation.z=-i*.13;}
      }else{
      const hat=group(body,0,headY+.32,-.03);part(hat,G.tube,coat,0,.02,0,.59,.075,.51);
      const geo=new THREE.LatheGeometry([new THREE.Vector2(.38,0),new THREE.Vector2(.32,.2),new THREE.Vector2(.19,.48),new THREE.Vector2(.12,.7),new THREE.Vector2(.025,.9)],16);
      const pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setX(i,pos.getX(i)+Math.pow(pos.getY(i),2)*.27);geo.computeVertexNormals();const top=part(hat,geo,coat,0,.03,0,1);top.userData.uniqueGeometry=true;
      part(hat,G.tube,accent,.005,.13,0,.355,.09,.34);part(hat,G.gem,gold,.09,.38,.28,.10,.13,.035);
      }
      rod(right,h.accent,family==='orbit'?'moon':'gem');orb(body,accent,0,1.41,.28,.09,.13,.035);
      if(family==='fireball')orb(left,mat('#ffb75c',.65),0,.15,0,.23,.29,.23);
      break;
    }
    case'bow':{
      for(const s of[-1,1])part(body,G.cone,skin,s*.50,headY+.01,.01,.10,.37,.07).rotation.z=-s*1.25;
      orb(body,coat,0,headY+.28,-.13,.46,.22,.38);leaf(body,accent,.2,headY+.54,-.12,.8,-.5);
      curve(right,mat('#9b7049'),[[0,-.35,0],[.25,-.1,.02],[.33,.3,.02],[.2,.69,0],[0,.9,0]],.045);link(right,ivory,[0,-.35,0],[0,.9,0],.012);
      part(body,G.tube,leather,-.2,1.17,-.39,.15,.75,.15).rotation.z=-.26;for(let i=0;i<3;i++)link(body,ivory,[-.3+i*.1,1.4,-.4],[-.4+i*.1,1.88,-.4],.018);
      break;
    }
    case'daggers':
      orb(body,coat,0,headY-.18,.3,.39,.18,.14);part(body,G.tube,accent,0,headY+.22,.01,.445,.07,.38);sword(right,'#c9e3f4',.6);sword(left,'#c9e3f4',.6);left.rotation.x=1.2;curve(body,coat,[[0,headY+.22,-.32],[.18,headY+.25,-.55],[.48,headY+.16,-.85]],.07);break;
    case'hammer':
      orb(body,hair,0,headY-.28,.28,.30,.30,.17);part(body,G.tube,coat,0,headY+.32,0,.45,.14,.38);
      for(const s of[-1,1])curve(body,ivory,[[s*.4,headY+.35,0],[s*.62,headY+.46,0],[s*.65,headY+.68,.02]],.075);
      link(right,leather,[0,-.2,0],[0,.9,0],.055);orb(right,accent,0,.82,0,.46,.23,.24);part(right,G.tube,mat('#b6cbd0',0,.6),0,.82,0,.25,.47,.25).rotation.z=Math.PI/2;break;
    case'lightning':
      for(const s of[-1,1]){orb(body,gold,s*.21,headY+.035,.37,.19,.16,.06);orb(body,mat('#a6edff',.3),s*.21,headY+.035,.42,.135,.105,.03);link(body,gold,[s*.2,headY+.48,-.05],[s*.35,headY+.78,-.05],.025);orb(body,accent,s*.35,headY+.78,-.05,.07);}
      for(const s of[-1,1])part(body,G.tube,leather,s*.21,1.16,-.35,.13,.65,.13);part(right,G.gem,accent,0,.15,.05,.16,.31,.15);break;
    case'boomerang':
      part(body,G.tube,leather,0,headY+.29,0,.67,.075,.51);part(body,G.cone,coat,0,headY+.49,-.05,.40,.44,.34);for(const s of[-1,1])link(right,accent,[0,.1,0],[s*.3,.6,0],.075);orb(body,leather,.31,.9,.28,.14,.15,.08);break;
    case'wave':
      for(let i=-2;i<=2;i++)part(body,G.gem,accent,i*.14,headY+.46+(2-Math.abs(i))*.07,.05,.07,.18,.06);rod(right,h.accent);orb(body,accent,0,1.37,.27,.12,.12,.04);break;
    case'grenade':case'mines':
      orb(body,coat,0,headY+.25,-.02,.49,.30,.41);for(const s of[-1,1]){part(body,G.ring,gold,s*.2,headY+.07,.35,.16);orb(body,mat('#b9e9ed',.08),s*.2,headY+.07,.36,.12,.10,.045);}
      for(const s of[-1,1]){orb(body,leather,s*.23,1.12,-.35,.16,.33,.15);part(body,G.tube,gold,s*.23,1.45,-.35,.10,.04,.1);}
      orb(right,mat(family==='grenade'?'#9dcfd4':'#49586d',.08),0,.10,.04,.19,.24,.19);part(right,G.tube,gold,0,.34,.04,.07,.09,.07);break;
    case'stars':case'laser':
      orb(body,coat,0,headY,.015,.49,.47,.40);orb(body,ink,0,headY+.025,.28,.40,.25,.17);face(body,headY+.06,.43,{eye:h.accent,spread:.17,robot:true});link(body,gold,[.25,headY+.4,-.05],[.3,headY+.73,-.05],.025);orb(body,accent,.3,headY+.75,-.05,.08);orb(body,coat,0,1.2,-.34,.25,.35,.17);
      if(family==='laser'){part(right,G.tube,leather,0,.02,.21,.14,.50,.14).rotation.x=Math.PI/2;orb(right,accent,0,.02,.49,.11,.11,.035);}else sword(right,h.accent,.6);break;
    case'scythe':
      orb(body,coat,0,headY+.05,-.02,.49,.52,.40);orb(body,ink,0,headY,.28,.35,.33,.16);face(body,headY+.07,.43,{eye:h.accent,robot:true});link(right,leather,[0,-.25,0],[0,1.65,0],.045);curve(right,mat('#d4e8ef',.03,.5),[[.02,1.6,0],[-.3,1.65,0],[-.7,1.44,0],[-.84,1.02,0]],.065);break;
    case'thorns':
      for(let i=0;i<7;i++){const a=i/7*TAU;leaf(body,accent,Math.sin(a)*.32,headY+.38,Math.cos(a)*.24,1,a*.6);}
      rod(right,h.accent);orb(body,mat('#f6c2c8'),-.29,headY+.34,.28,.13);break;
    case'spear':
      orb(body,accent,0,headY+.27,-.07,.47,.27,.40);for(let i=0;i<5;i++)leaf(body,coat,0,headY+.55+i*.035,-.2+i*.11,.55,0);link(right,leather,[0,-.4,0],[0,1.65,0],.038);part(right,G.gem,ivory,0,1.7,0,.13,.30,.06);orb(left,gold,0,.1,.04,.32,.42,.10);orb(left,coat,0,.1,.12,.25,.34,.045);break;
    case'frost':
      rod(right,h.accent);for(const s of[-1,1])part(body,G.cone,ivory,s*.30,headY+.55,0,.15,.40,.13);break;
    case'bees':
      for(const s of[-1,1]){orb(body,ivory,s*.47,1.37,-.35,.23,.38,.04);link(body,ink,[s*.2,headY+.4,0],[s*.29,headY+.75,0],.025);}rod(right,h.accent);break;
    default:sword(right,h.accent,.7);
  }
  if(h.id==='zeste'){
    for(const s of[-1,1]){const ear=orb(body,hair,s*.26,headY+.68,-.05,.11,.44,.10);ear.rotation.z=-s*.20;orb(body,accent,s*.28,headY+.70,.035,.055,.27,.025);}
    orb(body,paintedMaterial('wood','#98734e'),0,1.14,-.38,.36,.39,.23);for(const s of[-1,1])link(body,gold,[s*.23,1.5,-.3],[s*.24,.9,-.27],.025);
  }
  if(h.id==='plume')for(const s of[-1,1])for(let i=0;i<3;i++)leaf(body,ivory,s*(.38+i*.09),1.65+i*.055,-.13,1.05,-s*(.6+i*.2));
  if(h.id==='baltha'){
    orb(body,hair,0,headY-.24,.30,.31,.30,.16);lathe(body,leather,[[.1,.06],[.36,.15],[.4,.5],[.36,.75],[.1,.8]],0,.63,-.44);
    for(let i=0;i<3;i++)orb(body,accent,-.2+i*.15,1.65,-.42,.07,.12,.07);
  }
  if(h.id==='roncin'){
    orb(body,coat,0,headY+.44,-.07,.70,.30,.56);for(let i=0;i<5;i++){const a=i/5*TAU;orb(body,ivory,Math.sin(a)*.42,headY+.64,Math.cos(a)*.32,.085,.035,.075,G.oval);}
    for(const s of[-1,1])leaf(body,accent,s*.42,1.38,.03,.85,-s*.9);
  }
  if(h.id==='helios'){
    const sun=part(body,G.ring,gold,0,2.02,-.36,.68,.68,.20);ornaments.push(sun);
    for(const s of[-1,1])for(let i=0;i<3;i++)leaf(body,ivory,s*(.42+i*.09),headY+.26+i*.11,-.08,.8,-s*(.6+i*.3));
  }
  if(h.id==='chrono'){
    const clock=part(body,G.ring,gold,0,1.32,-.45,.50,.50,.14);ornaments.push(clock);
    for(let i=0;i<8;i++){const a=i/8*TAU;part(body,G.gem,accent,Math.sin(a)*.51,1.32+Math.cos(a)*.51,-.46,.04,.075,.03).rotation.z=-a;}
    orb(body,gold,-.43,headY,0,.17,.19,.10);orb(body,gold,.43,headY,0,.17,.19,.10);
  }
  // Variants are authored by identity, rather than a single uniform recolour.
  const physiques={kael:[.9,1.08,.9],nyx:[.85,1.02,.9],poppy:[1.02,.88,1.02],volt:[.88,1.06,.94],kiko:[1.02,.84,1],boum:[1.2,.89,1.12],ondine:[.88,1.12,.92],astra:[.86,1.06,.95],nox:[.9,1.13,.9],orion:[1.16,1.12,1.08],plume:[.83,.97,.85],zeste:[.94,.91,.98],selene:[.92,1.10,.95],baltha:[1.25,.94,1.16],roncin:[1.13,.91,1.05],chrono:[.89,1.12,.94],cendre:[.87,1.06,.94],gizmo:[1.14,.83,1.08]};
  body.scale.set(...(physiques[h.id]||[1,1,1]));
  if(['selene','astra'].includes(h.id)){const halo=part(body,G.ring,accent,0,headY+.66,-.10,.54,.54,.54);halo.rotation.x=Math.PI/2.4;ornaments.push(halo);}
  if(['zeste','plume'].includes(h.id))for(const s of[-1,1])leaf(body,accent,s*.3,headY+.55,0,1.1,-s*.5);
  g.userData={heroId:h.id,family,body,legs,arms,wings,ornaments,right,left,floating:false,baseScale:shape.modelScale||1,form:shape.form||'humanoid',portraitFocus:[0,headY*body.scale.y,.15]};return g;
}

function creature(h,shape){
  const g=group(),body=group(g),form=shape.form,coat=mat(h.color),accent=mat(h.accent,.08),dark=mat(h.hair||'#30464c'),skin=mat(h.skin),legs=[],arms=[],wings=[],ornaments=[];
  const leg=(x,y,z,r=.18,len=.55)=>{const l=group(body,x,y,z);orb(l,dark,0,-len*.45,0,r,len*.55,r);orb(l,dark,0,-len+.08,.08,r*1.18,.13,r*1.5);legs.push(l);return l;};
  const arm=(s,x=.6,y=1.4,len=.6,r=.18)=>{const a=group(body,s*x,y,0);orb(a,coat,0,-len*.4,0,r,len*.6,r);orb(a,dark,0,-len,.1,r*1.15);arms.push(a);return a;};
  if(form==='golem'){
    const rocky=paintedMaterial('stone',h.color),r=h.id==='rocco'?1.15:1;
    orb(body,rocky,0,1.16,0,.64*r,.68,.43,G.rock);orb(body,dark,0,2.02,0,.43,.42,.38,G.rock);
    for(const s of[-1,1]){leg(s*.35,.68,0,.23);const a=arm(s,.77,1.58,.7,.27);orb(a,rocky,0,-.24,0,.32,.35,.31,G.rock);part(body,G.gem,accent,s*.18,2.06,.34,.09,.055,.035);orb(body,rocky,s*.48,1.64,-.02,.33,.28,.34,G.rock);for(let i=0;i<3;i++)part(a,G.gem,accent,s*.12,-.45-i*.12,.28,.028,.08,.02);}
    part(body,G.gem,accent,0,1.25,.43,.20,.30,.06);part(body,G.ring,gold,0,1.25,.46,.27,.35,.16);
    for(let i=0;i<5;i++)leaf(body,mat('#75aa73'),(i-2)*.14,2.4,0,.7,(i-2)*.4);
    if(h.id==='rocco')for(const s of[-1,1])part(body,G.gem,accent,s*.44,2.48,-.05,.15,.38,.15).rotation.z=-s*.4;
  }else if(form==='bee'){
    orb(body,accent,0,1.20,0,.45,.61,.45);for(const y of[.95,1.24,1.49])part(body,G.ring,dark,0,y,0,.43,.43,.43).rotation.x=Math.PI/2;
    orb(body,coat,0,1.97,.08,.43,.42,.38);face(body,2.02,.43,{skin,eye:'#395f75',spread:.16});
    for(const s of[-1,1]){arm(s,.46,1.38,.42,.095);link(body,dark,[s*.18,2.29,.05],[s*.29,2.62,.03],.025);orb(body,accent,s*.29,2.64,.03,.075);const w=group(body,s*.3,1.66,-.23);orb(w,mat('#d8f5f0',.12),s*.30,.03,0,.42,.09,.55);orb(w,ivory,s*.17,-.15,0,.30,.055,.34);wings.push(w);}
    if(h.id==='miel')for(let i=-1;i<=1;i++)part(body,G.gem,gold,i*.16,2.42,.08,.06,.18,.06);
    else part(body,G.cone,dark,0,.58,-.1,.12,.31,.12);
  }else if(form==='quadruped'){
    orb(body,coat,0,.83,-.12,.47,.45,.72);orb(body,ivory,0,1.24,.49,.40,.42,.38);orb(body,coat,0,1.36,.47,.36,.32,.35);orb(body,ivory,0,1.12,.81,.24,.16,.17);orb(body,dark,0,1.17,.96,.075,.055,.05);face(body,1.36,.77,{eye:'#538eaf',spread:.17,small:true});
    for(const s of[-1,1]){part(body,G.cone,ivory,s*.25,1.85,.37,.14,.57,.15).rotation.z=-s*.2;part(body,G.cone,accent,s*.25,1.85,.43,.075,.33,.05).rotation.z=-s*.2;for(const z of[-.5,.34])leg(s*.32,.52,z,.10,.46);}
    const tail=curve(body,ivory,[[0,.8,-.65],[.23,1.04,-1],[.46,1.45,-1.14],[.36,1.7,-1.10]],.20);ornaments.push(tail);part(body,G.gem,accent,0,1.55,.8,.06,.13,.025);
  }else if(form==='plant'){
    lathe(body,paintedMaterial('wood','#877956'),[[.4,.15],[.38,.4],[.3,.8],[.27,1.5]],0,0,0);orb(body,coat,0,1.95,0,.5,.46,.43);face(body,1.99,.39,{skin:coat,eye:'#448967',spread:.17});
    for(let i=0;i<9;i++){const a=i/9*TAU;leaf(body,accent,Math.sin(a)*.4,2.30+Math.cos(a)*.12,Math.cos(a)*.17,1.05,-a);}
    for(const s of[-1,1]){const a=arm(s,.46,1.37,.67,.09);leaf(a,coat,s*.13,-.26,.02,1.1,s*.8);leg(s*.22,.5,0,.14,.4);}
    orb(body,mat('#e9adbd'),-.25,2.37,.23,.10);
  }else if(form==='spirit'){
    lathe(body,coat,[[.06,.18],[.42,.35],[.60,.52],[.4,.85],[.3,1.45],[.42,1.77]],0,0,0);orb(body,dark,0,1.99,0,.46,.49,.36);face(body,2.04,.35,{eye:h.accent,robot:true,spread:.16});
    for(const s of[-1,1]){const a=arm(s,.55,1.51,.5,.13);part(a,G.gem,accent,0,-.6,.04,.14,.21,.12);part(body,G.cone,coat,s*.38,2.39,-.03,.15,.45,.15).rotation.z=-s*.55;}
    const halo=part(body,G.ring,accent,0,1.22,0,.81,.81,.81);halo.rotation.x=Math.PI/2.4;ornaments.push(halo);
    for(let i=0;i<5;i++){const a=i/5*TAU;part(body,G.gem,accent,Math.sin(a)*.48,.40,Math.cos(a)*.48,.06,.14,.06);}
  }else if(form==='turtle'){
    orb(body,coat,0,.84,-.12,.85,.49,.78);orb(body,dark,0,1.03,-.22,.77,.53,.69);for(let i=0;i<7;i++){const a=i/6*TAU,r=i===6?0:.46;orb(body,accent,Math.sin(a)*r,1.42-(i===6?-.08:.10),-.22+Math.cos(a)*r,.25,.13,.22,G.rock);}
    orb(body,skin,0,1.04,.67,.34,.33,.37);face(body,1.10,1.0,{skin,eye:'#438783',spread:.14,small:true});for(const s of[-1,1])for(const z of[-.44,.35])leg(s*.58,.56,z,.16,.4);
    for(let i=0;i<3;i++)leaf(body,coat,(i-1)*.19,1.66,-.2,.6,(i-1)*.5);
  }else if(form==='dragon'){
    orb(body,coat,0,1.04,0,.46,.62,.39);orb(body,accent,0,1.02,.30,.30,.43,.12);orb(body,coat,0,1.97,.03,.46,.44,.39);orb(body,accent,0,1.83,.37,.32,.22,.29);orb(body,dark,-.13,1.96,.59,.032,.025,.025);orb(body,dark,.13,1.96,.59,.032,.025,.025);face(body,2.10,.35,{skin:coat,eye:'#f3d49a',spread:.20,small:true});
    for(const s of[-1,1]){leg(s*.27,.62,0,.16);arm(s,.48,1.34,.48,.13);curve(body,ivory,[[s*.27,2.29,-.1],[s*.4,2.55,-.17],[s*.36,2.76,-.15]],.065);const w=group(body,s*.37,1.6,-.29);const membrane=new THREE.Shape();membrane.moveTo(0,0);membrane.quadraticCurveTo(s*.55,.85,s*1.07,.70);membrane.lineTo(s*.88,-.23);membrane.quadraticCurveTo(s*.6,.03,s*.47,-.4);membrane.lineTo(0,-.22);const geo=new THREE.ShapeGeometry(membrane,8),wm=paintedMaterial('cloth',h.accent);const wing=part(w,geo,wm,0,0,0,1);wing.userData.uniqueGeometry=true;link(w,coat,[0,0,0],[s*1.07,.7,0],.035);wings.push(w);}
    curve(body,coat,[[0,.7,-.28],[.2,.45,-.76],[.48,.68,-1.07],[.58,.97,-1.15]],.13);part(body,G.gem,accent,.58,1.0,-1.15,.15,.22,.08);
  }else{
    orb(body,ivory,0,1.1,0,.56,.64,.39);orb(body,ivory,0,1.96,.05,.49,.47,.39);for(const s of[-1,1]){orb(body,dark,s*.34,2.3,0,.18,.20,.13);orb(body,dark,s*.19,1.99,.39,.15,.18,.04);leg(s*.3,.62,0,.20);arm(s,.58,1.44,.62,.22);}face(body,2.02,.41,{skin:ivory,eye:'#4b5676',spread:.18});orb(body,coat,0,.86,.32,.43,.18,.15);orb(body,dark,0,1.82,.45,.09,.065,.05);
  }
  const right=arms[1]||group(body,.4,1.3,.2),left=arms[0]||group(body,-.4,1.3,.2);
  g.userData={heroId:h.id,family:h.family,body,legs,arms,wings,ornaments,right,left,floating:['bee','spirit'].includes(form),baseScale:shape.modelScale||1,form,portraitFocus:form==='turtle'?[0,1.1,.7]:form==='quadruped'?[0,1.35,.5]:[0,2,.1]};return g;
}
export function buildHero(hero,{software=false}={}){
  const shape=HERO_SHAPES[hero.id]||{},model=shape.form&&shape.form!=='tiny'?creature(hero,shape):human(hero,shape);
  if(software)simplify(model);
  return model;
}

export function buildEnemyBody(model,type,biome,bossKind,tier,{software=false}={}){
  const limbs=[],flaps=[],geo=software?G.low:G.rock,eyeGeo=software?G.plane:G.oval;
  const color=({slime:'#8fcb7c',runner:'#d8958c',wisp:'#899bd8',wraith:'#899bd8',spitter:'#b68acb',mushroom:'#d98978',brute:'#6c928f',goblin:'#81b29a',bat:'#8d80b4'})[type]||'#638e91';
  const skin=mat(color),dark=mat('#283948'),glow=mat('#ffe6a6',.28);
  const ball=(p,m,x,y,z,sx,sy=sx,sz=sx)=>orb(p,m,x,y,z,sx,sy,sz,geo);
  const eyes=(p,y,z,spread=.16,evil=false)=>{for(const s of[-1,1]){part(p,eyeGeo,evil?glow:ivory,s*spread,y,z,.11,.13,software?1:.035);part(p,eyeGeo,ink,s*spread,y-.01,z+.035,.045,.085,software?1:.018);if(!software)part(p,G.oval,ivory,s*spread-.016,y+.035,z+.056,.018,.023,.01);}};
  const arm=(s,m=skin,x=.58,y=1.3,len=.6,r=.18)=>{const a=group(model,s*x,y,0);ball(a,m,0,-len*.4,0,r,len*.6,r);ball(a,dark,0,-len,.08,r*1.1);limbs.push(a);return a;};
  if(type==='boss'){
    const theme=String(bossKind).includes('crystal')?'crystal':String(bossKind).includes('desert')?'desert':String(bossKind).includes('swamp')?'swamp':biome;
    const colors={forest:['#466b69','#b6d99e'],crystal:['#716796','#c4d9ff'],desert:['#ae8260','#ffe1a2'],swamp:['#506c75','#c6a2df']},[base,light]=colors[theme]||colors.forest,armor=mat(base),magic=mat(light,.24),robe=paintedMaterial('cloth',theme==='desert'?'#2e5361':'#373a59');
    // Four guardian identities: antler warden, crystal oracle, jackal sentinel, mire shaman.
    lathe(model,robe,[[.56,.12],[.70,.27],[.45,.84],[.47,1.52],[.37,1.76]]);
    ball(model,armor,0,1.42,0,.65,.65,.43);part(model,G.gem,magic,0,1.43,.43,.20,.30,.06);
    for(const s of[-1,1]){const a=arm(s,armor,.80,1.72,.66,.24);ball(model,armor,s*.62,1.86,-.04,.33,.30,.31);ball(model,dark,s*.32,.2,.13,.24,.22,.32);if(!software)part(a,G.ring,gold,0,-.45,0,.245).rotation.x=Math.PI/2;}
    if(theme==='forest'){
      ball(model,ivory,0,2.19,.06,.37,.46,.31);ball(model,ivory,0,2.02,.32,.24,.20,.24);eyes(model,2.24,.35,.15,true);
      for(const s of[-1,1]){curve(model,mat('#a58a70'),[[s*.27,2.48,0],[s*.55,2.75,-.06],[s*.91,2.88,-.1],[s*1.05,3.17,-.15]],.065);link(model,mat('#a58a70'),[s*.59,2.78,-.06],[s*.58,3.12,.02],.045);if(!software)for(let i=0;i<3;i++)leaf(model,magic,s*(.62+i*.13),1.9+i*.11,-.28,.7,-s*.8);}
    }else if(theme==='crystal'){
      ball(model,dark,0,2.22,0,.37,.44,.29);part(model,G.gem,ivory,0,2.2,.25,.28,.34,.12);eyes(model,2.23,.35,.12,true);
      for(let i=-2;i<=2;i++)part(model,G.gem,magic,i*.20,2.72+(2-Math.abs(i))*.10,-.03,.12,.29,.12).rotation.z=-i*.18;
      for(const s of[-1,1])for(let i=0;i<3;i++)part(model,G.gem,magic,s*(.73+i*.18),1.85+i*.1,-.27,.12,.47-i*.06,.10).rotation.z=-s*(.4+i*.23);
    }else if(theme==='desert'){
      ball(model,dark,0,2.22,0,.35,.40,.28);ball(model,dark,0,2.12,.27,.21,.17,.32);eyes(model,2.3,.27,.15,true);
      for(const s of[-1,1]){part(model,G.cone,dark,s*.23,2.8,-.04,.15,.65,.12).rotation.z=-s*.12;part(model,G.cone,gold,s*.23,2.77,.03,.075,.4,.035).rotation.z=-s*.12;}
      part(model,G.ring,gold,0,1.91,.04,.47,.16,.35).rotation.x=.2;
    }else{
      ball(model,armor,0,2.12,.02,.52,.37,.38);ball(model,magic,0,2.35,0,.79,.24,.58);for(const s of[-1,1]){ball(model,armor,s*.29,2.30,.25,.18);eyes(model,2.32,.39,.29,true);}
      if(!software)for(let i=0;i<6;i++){const a=i/6*TAU;orb(model,ivory,Math.sin(a)*.5,2.54,Math.cos(a)*.35,.09,.04,.09,G.oval);}
      for(const s of[-1,1])curve(model,magic,[[s*.3,1.95,.25],[s*.40,1.7,.36],[s*.32,1.47,.39]],.035);
    }
    const halo=part(model,G.ring,magic,0,2.63,-.30,.75,.75,.75);halo.rotation.x=Math.PI/2.8;
    for(let i=0;i<Math.min(5,Math.ceil(tier/2));i++){const a=i/5*TAU;part(model,G.gem,gold,Math.sin(a)*.65,2.97,Math.cos(a)*.32,.05,.12,.05);}
  }else if(type==='slime'){
    ball(model,skin,0,.47,0,.78,.58,.68);ball(model,mat('#bae4a0'),-.19,.68,.16,.37,.31,.34);eyes(model,.55,.62,.23);
    for(const s of[-1,1])ball(model,skin,s*.55,.11,.25,.30,.13,.29);
    part(model,G.gem,glow,0,1.0,-.04,.12,.23,.12);
    if(!software)for(const s of[-1,1])orb(model,mat('#d3ecb8'),s*.42,.43,.53,.09,.045,.02,G.oval);
  }else if(type==='brute'){
    ball(model,skin,0,1.00,0,.62,.73,.43);ball(model,skin,0,1.91,.02,.45,.44,.37);ball(model,skin,0,1.7,.31,.34,.23,.22);eyes(model,1.99,.36,.20,true);
    for(const s of[-1,1]){const a=arm(s,skin,.66,1.47,.65,.23);ball(model,dark,s*.33,.25,0,.22,.3,.27);part(model,G.cone,ivory,s*.24,1.74,.43,.065,.28,.055);ball(model,mat('#756a62'),s*.56,1.55,-.01,.28,.22,.31);}
    link(limbs[1],mat('#795e4b'),[0,-.55,.08],[0,.30,.35],.075);ball(limbs[1],mat('#687e83'),0,.3,.35,.29,.37,.28);
  }else if(['spitter','mushroom'].includes(type)){
    ball(model,ivory,0,.55,0,.32,.48,.30);ball(model,skin,0,1.11,0,.80,.43,.69);eyes(model,.70,.28,.14);ball(model,dark,0,.46,.34,.13,.10,.07);
    for(const s of[-1,1])ball(model,mat('#eee1c3'),s*.23,.10,.10,.21,.12,.25);
    if(!software)for(let i=0;i<5;i++){const a=i/5*TAU;orb(model,ivory,Math.sin(a)*.48,1.40,Math.cos(a)*.38,.12,.045,.1,G.oval);}
  }else if(['wisp','wraith'].includes(type)){
    lathe(model,skin,[[.01,.1],[.37,.35],[.48,.6],[.32,.95],[.41,1.33],[.27,1.8],[.01,1.98]]);ball(model,dark,0,1.33,.27,.30,.30,.13);eyes(model,1.4,.39,.13,true);
    for(const s of[-1,1]){const a=arm(s,skin,.49,1.15,.40,.10);part(a,G.gem,glow,0,-.5,0,.08,.14,.07);}
    part(model,G.ring,glow,0,1.91,0,.34,.34,.34).rotation.x=Math.PI/2;
  }else if(type==='bat'){
    ball(model,skin,0,1,0,.36,.46,.28);eyes(model,1.13,.27,.13,true);
    for(const s of[-1,1]){part(model,G.cone,skin,s*.2,1.56,0,.13,.4,.12);const w=group(model,s*.28,1.14,0);part(w,G.cone,skin,s*.36,0,0,.40,.83,.07).rotation.z=-s*1.2;flaps.push(w);}
  }else{
    ball(model,skin,0,.86,0,.35,.43,.26);ball(model,skin,0,1.41,.06,.43,.37,.33);eyes(model,1.46,.37,.17,true);
    for(const s of[-1,1]){part(model,G.cone,skin,s*.48,1.52,0,.14,.53,.11).rotation.z=-s*1.15;const l=group(model,s*.2,.55,0);ball(l,dark,0,-.22,.02,.10,.29,.12);ball(l,dark,0,-.46,.1,.15,.11,.22);limbs.push(l);arm(s,skin,.36,1.14,.4,.10);}
    curve(model,skin,[[0,.65,-.2],[.3,.74,-.5],[.39,1.02,-.55]],.045);orb(model,mat('#845c4c'),0,1.14,-.16,.35,.13,.25,geo);
  }
  if(software)simplify(model);
  return{limbs,flaps};
}
