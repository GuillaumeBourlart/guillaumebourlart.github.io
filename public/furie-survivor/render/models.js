import * as THREE from '../vendor/three.module.js';
import { paintedMaterial, shadowMaterial } from './textures.js';
import { HERO_SHAPES } from '../game/hero-stats.js';

export const TAU = Math.PI * 2;
export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  plane: new THREE.PlaneGeometry(1,1),
  progress: new THREE.RingGeometry(.94,1,3,1,0,Math.PI*2/12*.77),
  ball: new THREE.IcosahedronGeometry(1, 0),
  round: new THREE.IcosahedronGeometry(1, 1),
  gem: new THREE.OctahedronGeometry(1, 0),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
  cone: new THREE.ConeGeometry(1, 1, 7),
  disc: new THREE.CircleGeometry(1, 24),
  ring: new THREE.RingGeometry(.87, 1, 32),
  arc: new THREE.RingGeometry(.73, 1, 22, 1, -.8, 1.6),
  torus: new THREE.TorusGeometry(1, .1, 4, 18),
  fineRing: new THREE.RingGeometry(.967,1,36),
  cylinder16: new THREE.CylinderGeometry(1,1,1,16),
};
// A single shared, gently bevelled cube keeps the hero soft at menu scale.
GEO.softBox=new THREE.BoxGeometry(1,1,1,2,2,2);
{const p=GEO.softBox.attributes.position,v=new THREE.Vector3(),inner=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);inner.set(Math.max(-.36,Math.min(.36,v.x)),Math.max(-.36,Math.min(.36,v.y)),Math.max(-.36,Math.min(.36,v.z)));v.sub(inner).normalize().multiplyScalar(.14).add(inner);p.setXYZ(i,v.x,v.y,v.z);}GEO.softBox.computeVertexNormals();}
const star = new THREE.Shape();
for (let i = 0; i < 10; i++) {
  const a = i / 10 * TAU + Math.PI / 2, r = i % 2 ? .43 : 1;
  if (!i) star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  else star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
}
star.closePath();
GEO.star = new THREE.ShapeGeometry(star);
const materials = new Map();
export function material(color, glow = 0) {
  const key = String(color) + ':' + glow;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .86, metalness: .02, flatShading: true, emissive: color, emissiveIntensity: glow, side: THREE.DoubleSide }));
  return materials.get(key);
}
export function flat(color, opacity = 1) {
  const key = 'flat:' + color + ':' + opacity;
  if (!materials.has(key)) materials.set(key, new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: opacity === 1 }));
  return materials.get(key);
}
export function mesh(geometry, mat, x = 0, y = 0, z = 0, sx = 1, sy = sx, sz = sx, parent) {
  const m = new THREE.Mesh(geometry, mat);
  m.position.set(x, y, z); m.scale.set(sx, sy, sz);
  if (parent) parent.add(m);
  return m;
}
export function disc(mat, x, y, z, radius, parent) {
  const m = mesh(GEO.disc, mat, x, y, z, radius, radius, radius, parent); m.rotation.x = -Math.PI / 2; return m;
}
export function ring(mat, x, y, z, radius, parent) {
  const m = mesh(GEO.ring, mat, x, y, z, radius, radius, radius, parent); m.rotation.x = -Math.PI / 2; return m;
}
export function contactShadow(parent,x=0,z=0,radius=1,opacity=.36,stretch=.78,y=.028){
  const m=mesh(GEO.plane,shadowMaterial(opacity),x,y,z,radius*2,radius*2*stretch,1,parent);m.rotation.x=-Math.PI/2;m.renderOrder=-18;return m;
}
export function group(parent, x = 0, y = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g;
}
const M = {
  ink: material('#242b46'), white: material('#eee4d5'), gold: material('#dcb879'),
  silver: material('#c5d6e1'), wood: paintedMaterial('wood','#795b4d'), metal: material('#667a96'),
  eye: flat('#101a31'), black: material('#202742'), pink: material('#ff8da6'),
};

function blade(parent, color, length = 1) {
  mesh(GEO.gem, material(color), 0, length * .55, 0, .12, length * .7, .08, parent);
  mesh(GEO.box, M.gold, 0, .08, 0, .4, .09, .11, parent);
  mesh(GEO.cylinder, M.ink, 0, -.09, 0, .06, .23, .06, parent);
}
function staff(parent, color, symbol = 'gem') {
  mesh(GEO.cylinder, M.wood, 0, .35, 0, .06, 1.8, .06, parent);
  mesh(symbol === 'star' ? GEO.star : GEO.gem, material(color, .26), 0, 1.32, 0, .29, .39, .18, parent);
  mesh(GEO.torus, M.gold, 0, 1.2, 0, .35, .35, .35, parent);
}
function cape(parent, color, scale = 1) {
  const c = mesh(GEO.cone, paintedMaterial('cloth',color), 0, .95, -.27, .48 * scale, 1.1, .25, parent);
  c.rotation.x = -.1; c.rotation.z = Math.PI; return c;
}
function eyes(parent, y = 2.01, z = .445, color = '#161c33', spread = .18, robot = false) {
  for (const s of [-1, 1]) {
    if (!robot) mesh(GEO.box, M.white, s * spread, y, z, .20, .17, .045, parent);
    mesh(GEO.box, flat(color), s * spread, y - .015, z + .035, robot ? .19 : .088, robot ? .08 : .12, .04, parent);
  }
}

function makeCreatureHero(hero,form){
  if(!['golem','plant','bee','quadruped','spirit','turtle','beast'].includes(form))return null;
  const g=group(),body=group(g),coat=paintedMaterial('cloth',hero.color),accent=material(hero.accent,.08),dark=material(hero.hair||'#273749'),pale=material(hero.skin||'#e7c49d');
  const legs=[],arms=[],wings=[],ornaments=[];let floating=['bee','spirit'].includes(form);
  const limb=(x,y,z,sx,sy,sz,mat=dark)=>{const part=group(body,x,y,z);mesh(GEO.softBox,mat,0,-sy*.5,0,sx,sy,sz,part);legs.push(part);return part;};
  if(form==='golem'){
    mesh(GEO.softBox,coat,0,1.12,0,1.18,1.12,.8,body);mesh(GEO.softBox,dark,0,2.02,.03,.83,.68,.7,body);mesh(GEO.gem,accent,0,1.22,.43,.24,.34,.12,body);
    for(const side of[-1,1]){limb(side*.34,.69,0,.4,.72,.42);const arm=group(body,side*.78,1.55,0);mesh(GEO.softBox,coat,0,-.36,0,.45,.88,.48,arm);mesh(GEO.ball,dark,0,-.82,.1,.34,.3,.37,arm);arms.push(arm);mesh(GEO.box,accent,side*.23,2.08,.39,.12,.08,.05,body);}
  }else if(form==='bee'){
    mesh(GEO.ball,accent,0,1.26,0,.62,.72,.76,body);for(const y of[1.02,1.32,1.58])mesh(GEO.torus,dark,0,y,.02,.55,.55,.55,body).rotation.x=Math.PI/2;
    mesh(GEO.ball,coat,0,2.05,.12,.51,.48,.5,body);eyes(body,2.08,.53,'#17283a',.2);
    for(const side of[-1,1]){const wing=mesh(GEO.ball,material('#e8fbff',.08),side*.64,1.62,-.25,.58,.08,.82,body);wing.rotation.z=side*.42;wings.push(wing);const arm=group(body,side*.5,1.32,.2);mesh(GEO.cylinder,dark,0,-.25,0,.07,.55,.07,arm);arms.push(arm);mesh(GEO.cylinder,dark,side*.22,2.55,.05,.035,.48,.035,body).rotation.z=-side*.28;mesh(GEO.ball,accent,side*.29,2.8,.05,.09,.09,.09,body);}
  }else if(form==='quadruped'){
    mesh(GEO.ball,coat,0,.95,-.08,.82,.62,1.02,body);mesh(GEO.ball,pale,0,1.3,.65,.56,.54,.58,body);eyes(body,1.43,1.17,'#195b90',.23);
    for(const [x,z]of[[-.45,-.42],[.45,-.42],[-.42,.38],[.42,.38]])limb(x,.67,z,.24,.58,.28,dark);
    for(const side of[-1,1])mesh(GEO.cone,coat,side*.33,1.82,.55,.2,.55,.18,body).rotation.z=-side*.25;
    const tail=mesh(GEO.cone,pale,0,1.02,-1.05,.2,1.15,.2,body);tail.rotation.x=-1.2;ornaments.push(tail);
  }else if(form==='plant'){
    mesh(GEO.cylinder,paintedMaterial('wood','#6e7a4b'),0,1.05,0,.42,1.45,.42,body);mesh(GEO.ball,coat,0,2.02,0,.64,.54,.58,body);eyes(body,2.05,.5,'#223a2a',.21);
    for(let i=0;i<7;i++){const a=i/7*TAU;const petal=mesh(GEO.ball,accent,Math.sin(a)*.58,2.35+Math.cos(a)*.12,Math.cos(a)*.28,.32,.16,.24,body);petal.rotation.z=a;ornaments.push(petal);}
    for(const side of[-1,1]){const arm=group(body,side*.48,1.35,0);mesh(GEO.cylinder,coat,0,-.35,0,.09,.75,.09,arm);mesh(GEO.ball,accent,0,-.75,.04,.16,.12,.2,arm);arms.push(arm);limb(side*.25,.55,0,.2,.62,.24,dark);}
  }else if(form==='spirit'){
    mesh(GEO.cone,coat,0,.88,0,.72,1.55,.56,body);mesh(GEO.ball,dark,0,1.95,.02,.62,.64,.53,body);eyes(body,2.02,.5,hero.accent,.2,true);
    const halo=mesh(GEO.torus,accent,0,2.72,0,.7,.7,.7,body);halo.rotation.x=Math.PI/2;ornaments.push(halo);for(const side of[-1,1]){const arm=group(body,side*.55,1.45,0);mesh(GEO.cone,coat,0,-.4,0,.17,.85,.16,arm);arms.push(arm);}
  }else if(form==='turtle'){
    mesh(GEO.ball,coat,0,1.05,-.08,1.05,.62,.9,body);mesh(GEO.ball,accent,0,1.12,-.25,.86,.48,.72,body);mesh(GEO.ball,pale,0,1.28,.78,.46,.42,.48,body);eyes(body,1.38,1.2,'#244b55',.2);
    for(const [x,z]of[[-.7,-.35],[.7,-.35],[-.65,.43],[.65,.43]])limb(x,.7,z,.31,.42,.38,dark);
  }else{
    mesh(GEO.ball,pale,0,1.75,.1,.65,.68,.58,body);mesh(GEO.softBox,coat,0,1.02,0,.92,.88,.66,body);eyes(body,1.83,.62,'#263743',.22);for(const side of[-1,1]){limb(side*.3,.68,0,.3,.6,.34,dark);const arm=group(body,side*.62,1.3,0);mesh(GEO.ball,coat,0,-.35,0,.3,.45,.32,arm);arms.push(arm);}}
  const right=arms[1]||group(body,.4,1.3,.2),left=arms[0]||group(body,-.4,1.3,.2),shape=HERO_SHAPES[hero.id]||{};
  g.userData={heroId:hero.id,family:hero.family,body,legs,arms,wings,ornaments,right,left,floating,baseScale:shape.modelScale||1,form};return g;
}

/** Twenty original modular silhouettes, selected by the attack family. */
export function makeHero(hero) {
  const shape=HERO_SHAPES[hero.id]||{},creature=makeCreatureHero(hero,shape.form);if(creature)return creature;
  const g = group(), body = group(g), family = hero.family;
  const coat = paintedMaterial('cloth',hero.color || '#8b79f2'), accent = material(hero.accent || '#ffda74');
  const skin = material(hero.skin || '#eab078'), hair = material(hero.hair || '#503a39');
  const legs = [], arms = [], wings = [], ornaments = [];
  const heavy = family === 'fists' || family === 'hammer', mechanical = family === 'laser' || family === 'stars';
  const floating = family === 'vortex';
  const torsoWidth = heavy ? .83 : .64;
  mesh(GEO.softBox, coat, 0, 1.1, 0, torsoWidth, .77, .48, body);
  mesh(GEO.box, accent, 0, .84, .02, torsoWidth + .04, .12, .46, body);
  mesh(GEO.box, M.gold, 0, .85, .27, .15, .13, .06, body);
  mesh(GEO.box, M.ink, 0, .64, 0, .56, .27, .36, body);
  if (!floating) for (const side of [-1, 1]) {
    const leg = group(body, side * .18, .68, 0);
    mesh(GEO.box, mechanical ? coat : M.ink, 0, -.18, 0, .23, .4, .28, leg);
    mesh(GEO.softBox, M.ink, 0, -.49, .09, .31, .23, .45, leg);
    mesh(GEO.box, accent, 0, -.39, .05, .28, .075, .34, leg); legs.push(leg);
  }
  for (const side of [-1, 1]) {
    const arm = group(body, side * (torsoWidth / 2 + .11), 1.37, 0);
    mesh(GEO.ball, coat, 0, -.11, 0, .2, .23, .21, arm);
    mesh(GEO.box, mechanical ? M.silver : skin, 0, -.35, .01, .2, .33, .23, arm);
    mesh(GEO.ball, mechanical ? coat : skin, 0, -.56, .05, .145, .16, .16, arm); arms.push(arm);
  }
  const right = group(arms[1], 0, -.5, .16), left = group(arms[0], 0, -.5, .16);
  if (family === 'laser') {
    mesh(GEO.box, coat, 0, 1.96, 0, .89, .76, .66, body);
    mesh(GEO.box, M.ink, 0, 2.01, .35, .72, .38, .08, body); eyes(body, 2.04, .41, hero.accent, .19, true);
    mesh(GEO.box, M.white, 0, 1.81, .42, .25, .035, .02, body);
    mesh(GEO.cylinder, M.gold, .26, 2.5, -.05, .035, .35, .035, body);
    mesh(GEO.ball, accent, .26, 2.72, -.05, .12, .12, .12, body);
    mesh(GEO.cylinder, M.ink, 0, -.1, .29, .18, .68, .18, right).rotation.x = Math.PI / 2;
    mesh(GEO.cylinder, material(hero.accent, .35), 0, -.1, .66, .14, .05, .14, right).rotation.x = Math.PI / 2;
    mesh(GEO.box, M.ink, 0, 1.1, -.34, .47, .59, .26, body);
  } else if (family === 'vortex') {
    mesh(GEO.cone, coat, 0, .73, 0, .52, 1.13, .42, body);
    mesh(GEO.ball, coat, 0, 2.02, 0, .55, .62, .45, body);
    mesh(GEO.ball, M.ink, 0, 1.97, .28, .38, .4, .2, body); eyes(body, 2.02, .46, hero.accent, .17, true);
    for (const s of [-1, 1]) mesh(GEO.cone, accent, s * .48, 2.45, -.04, .13, .46, .13, body).rotation.z = -s * .6;
    ornaments.push(mesh(GEO.torus, material(hero.accent, .18), 0, 1.17, 0, 1.03, 1.03, 1.03, body));
    ornaments[0].rotation.x = Math.PI / 2.7;
  } else if (family === 'dragon') {
    mesh(GEO.ball, coat, 0, 1.99, .02, .56, .55, .47, body);
    mesh(GEO.ball, accent, 0, 1.85, .39, .37, .27, .33, body);
    eyes(body, 2.09, .40, '#172844', .24);
    for (const s of [-1, 1]) {
      mesh(GEO.cone, M.white, s * .35, 2.55, -.08, .14, .52, .14, body).rotation.z = -s * .28;
      const w = group(body, s * .42, 1.38, -.25);
      mesh(GEO.cone, accent, s * .4, .16, -.16, .58, .85, .09, w).rotation.z = -s * .9; wings.push(w);
    }
    const tail = mesh(GEO.cone, coat, 0, .72, -.75, .24, 1.2, .24, body); tail.rotation.x = -Math.PI / 2.7; ornaments.push(tail);
    for (let i = 0; i < 3; i++) mesh(GEO.cone, accent, 0, 1.47 - i * .25, -.33 - i * .19, .12, .3, .12, body);
  } else if (family === 'frost') {
    mesh(GEO.ball, M.white, 0, 2.0, 0, .53, .5, .45, body);
    mesh(GEO.ball, coat, 0, 2.09, -.08, .48, .38, .43, body);
    mesh(GEO.ball, M.white, 0, 1.85, .38, .31, .24, .24, body);
    mesh(GEO.ball, M.ink, 0, 1.9, .57, .085, .065, .07, body);
    for (const s of [-1, 1]) {
      mesh(GEO.cone, M.white, s * .34, 2.54, -.03, .23, .6, .2, body).rotation.z = -s * .2;
      mesh(GEO.cone, accent, s * .34, 2.55, .06, .13, .36, .06, body).rotation.z = -s * .2;
    }
    eyes(body, 2.06, .41, '#195b90', .23);
    const tail = mesh(GEO.ball, M.white, .28, .82, -.75, .32, .48, .75, body); tail.rotation.z = -.4; ornaments.push(tail);
    staff(right, hero.accent);
  } else {
    mesh(GEO.round, skin, 0, 2.0, .015, .49, .52, .44, body);
    if (!mechanical && !['scythe', 'mines', 'bees', 'grenade', 'spear'].includes(family)) {
      mesh(GEO.round, hair, 0, 2.3, -.07, .49, .28, .42, body);
      for (let i = 0; i < 3; i++) mesh(GEO.cone, hair, -.25 + i * .23, 2.49, -.05, .17, .25, .16, body).rotation.z = -.4;
    }
    for (const side of [-1, 1]) mesh(GEO.ball, skin, side * .48, 1.99, 0, .12, .17, .1, body);
    eyes(body);
    mesh(GEO.ball, skin, 0, 1.88, .43, .11, .13, .13, body);
    mesh(GEO.box, M.ink, 0, 1.76, .43, .17, .035, .025, body);
  }

  switch (family) {
    case 'hammer':
      mesh(GEO.cone, hair, 0, 1.68, .35, .36, .58, .2, body).rotation.z = Math.PI;
      mesh(GEO.cylinder, coat, 0, 2.35, -.04, .54, .22, .48, body);
      for (const s of [-1, 1]) mesh(GEO.cone, M.white, s * .58, 2.4, 0, .14, .48, .14, body).rotation.z = -s * .9;
      mesh(GEO.cylinder, M.wood, 0, .35, 0, .075, 1.04, .075, right);
      mesh(GEO.box, accent, 0, .88, 0, .94, .47, .45, right);
      mesh(GEO.box, M.silver, 0, .88, 0, .24, .51, .5, right); break;
    case 'orbit':
      cape(body, hero.color);
      mesh(GEO.cone, coat, 0, 2.65, -.06, .55, .94, .5, body).rotation.z = -.18;
      mesh(GEO.cylinder, accent, 0, 2.3, -.03, .66, .09, .62, body);
      mesh(GEO.star, accent, .1, 2.61, .32, .17, .17, .17, body);
      mesh(GEO.ball, hair, -.38, 1.87, -.2, .18, .43, .2, body);
      mesh(GEO.ball, hair, .38, 1.87, -.2, .18, .43, .2, body);
      staff(right, hero.accent); break;
    case 'bow': {
      cape(body, hero.color);
      mesh(GEO.cone, coat, 0, 2.43, -.13, .52, .48, .5, body).rotation.z = -.24;
      for (const s of [-1, 1]) mesh(GEO.cone, skin, s * .56, 2.03, .02, .12, .39, .1, body).rotation.z = -s * Math.PI / 2;
      const bow = mesh(new THREE.TorusGeometry(.65, .06, 4, 12, Math.PI * 1.45), M.wood, 0, .32, .12, .65, 1, 1, right); bow.rotation.z = -.7; bow.userData.uniqueGeometry = true;
      mesh(GEO.box, M.white, 0, .31, .12, .02, 1.05, .02, right);
      mesh(GEO.cylinder, M.wood, -.14, 1.24, -.36, .16, .79, .16, body).rotation.z = -.25; break;
    }
    case 'daggers':
      mesh(GEO.box, coat, 0, 1.83, .36, .76, .29, .22, body);
      mesh(GEO.box, accent, 0, 2.22, .39, .85, .11, .08, body);
      mesh(GEO.cone, hair, .1, 2.34, -.54, .18, .78, .2, body).rotation.x = -1.2;
      blade(right, '#dfefff', .58); blade(left, '#dfefff', .58); left.rotation.x = 1.6; break;
    case 'fireball':
      cape(body, hero.color);
      mesh(GEO.cone, coat, 0, 2.73, -.07, .57, 1.1, .54, body).rotation.z = .15;
      mesh(GEO.cylinder, accent, 0, 2.33, 0, .69, .11, .63, body);
      staff(right, '#ffb948');
      mesh(GEO.ball, material('#ff8944', .3), 0, .18, .1, .23, .32, .23, left); break;
    case 'lightning':
      mesh(GEO.box, M.ink, 0, 2.03, .43, .78, .22, .1, body);
      for (const s of [-1, 1]) mesh(GEO.box, accent, s * .18, 2.03, .49, .25, .12, .04, body);
      mesh(GEO.box, coat, 0, 1.15, -.42, .48, .74, .3, body);
      for (const s of [-1, 1]) mesh(GEO.cone, accent, s * .37, 2.53, -.13, .1, .62, .1, body).rotation.z = -s * .45;
      mesh(GEO.gem, accent, 0, .17, .09, .2, .36, .2, right); break;
    case 'boomerang':
      mesh(GEO.cylinder, accent, 0, 2.39, 0, .76, .1, .63, body);
      mesh(GEO.cone, coat, 0, 2.52, -.07, .49, .39, .44, body);
      for (const s of [-1, 1]) mesh(GEO.box, M.wood, s * .17, .3, 0, .16, .61, .1, right).rotation.z = -s * .7;
      mesh(GEO.box, accent, 0, 1.07, .26, .56, .49, .06, body).rotation.z = -.1; break;
    case 'fists':
      mesh(GEO.box, accent, 0, 2.28, .36, .87, .12, .12, body);
      for (const hand of [right, left]) { mesh(GEO.ball, coat, 0, -.03, .08, .33, .3, .34, hand); mesh(GEO.box, M.white, 0, -.1, .35, .35, .12, .06, hand); }
      mesh(GEO.box, skin, 0, 1.22, .24, .62, .36, .07, body); break;
    case 'wave':
      mesh(GEO.cone, coat, 0, .82, 0, .47, .66, .4, body);
      for (let i = -1; i <= 1; i++) mesh(GEO.cone, accent, i * .22, 2.55 - Math.abs(i) * .1, .01, .12, .44, .12, body);
      mesh(GEO.ball, hair, 0, 1.96, -.28, .52, .6, .27, body);
      staff(right, hero.accent); break;
    case 'grenade':
      mesh(GEO.ball, coat, 0, 2.23, -.04, .58, .37, .49, body);
      for (const s of [-1, 1]) { mesh(GEO.cylinder, M.gold, s * .21, 2.11, .43, .19, .08, .19, body).rotation.x = Math.PI / 2; mesh(GEO.cylinder, M.ink, s * .21, 2.11, .49, .13, .08, .13, body).rotation.x = Math.PI / 2; }
      mesh(GEO.cylinder, M.metal, 0, 1.1, -.42, .28, .72, .28, body);
      mesh(GEO.ball, M.ink, 0, .06, .1, .26, .29, .26, right);
      mesh(GEO.box, accent, 0, .32, .1, .12, .12, .12, right); break;
    case 'thorns':
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; mesh(GEO.cone, accent, Math.cos(a) * .4, 2.43, Math.sin(a) * .26, .22, .49, .12, body).rotation.z = Math.cos(a) * -.6; }
      mesh(GEO.ball, M.pink, -.3, 2.39, .32, .17, .16, .1, body);
      for (const s of [-1, 1]) mesh(GEO.cone, skin, s * .57, 2.0, 0, .12, .43, .1, body).rotation.z = -s * Math.PI / 2;
      staff(right, '#9be870'); break;
    case 'stars':
      mesh(GEO.round, M.white, 0, 2.06, -.06, .64, .64, .57, body);
      mesh(GEO.ball, material('#335d91'), 0, 2.05, .32, .51, .4, .24, body);
      mesh(GEO.box, flat('#b7ffff'), -.19, 2.2, .51, .19, .07, .03, body).rotation.z = -.25;
      mesh(GEO.box, M.white, 0, 1.17, -.4, .51, .66, .33, body);
      mesh(GEO.star, accent, 0, .28, .12, .35, .35, .35, right); break;
    case 'scythe':
      cape(body, hero.color, 1.25);
      mesh(GEO.cone, coat, 0, 2.31, -.03, .58, .76, .48, body);
      mesh(GEO.ball, M.ink, 0, 2.01, .3, .4, .39, .2, body); eyes(body, 2.04, .48, hero.accent, .16, true);
      mesh(GEO.cylinder, M.wood, 0, .35, 0, .065, 2.15, .065, right);
      mesh(GEO.gem, M.silver, -.36, 1.41, 0, .71, .16, .08, right).rotation.z = -.24;
      mesh(GEO.gem, M.silver, -.82, 1.14, 0, .12, .37, .08, right).rotation.z = -.4; break;
    case 'bees':
      mesh(GEO.ball, coat, 0, 2.18, -.08, .58, .5, .51, body);
      mesh(GEO.torus, M.ink, 0, 2.0, .39, .47, .48, .23, body);
      for (const s of [-1, 1]) { mesh(GEO.cylinder, M.ink, s * .24, 2.67, -.02, .035, .36, .035, body).rotation.z = -s * .25; mesh(GEO.ball, accent, s * .29, 2.86, -.02, .1, .1, .1, body); const w=mesh(GEO.ball, M.white, s * .42, 1.37, -.35, .33, .5, .08, body); w.rotation.z = -s * .6; wings.push(w); }
      for (const y of [.97, 1.2]) mesh(GEO.box, M.ink, 0, y, .235, .65, .09, .045, body);
      mesh(GEO.cylinder, accent, 0, .17, .09, .22, .38, .22, right); break;
    case 'mines':
      mesh(GEO.ball, coat, 0, 2.25, -.05, .57, .32, .49, body);
      mesh(GEO.box, accent, 0, 2.16, .44, .24, .21, .08, body);
      mesh(GEO.ball, material('#ffffb5', .5), 0, 2.17, .52, .1, .1, .055, body);
      mesh(GEO.box, M.wood, 0, 1.1, -.42, .62, .8, .35, body);
      mesh(GEO.cylinder, M.ink, 0, 0, .15, .31, .12, .31, right);
      mesh(GEO.ball, accent, 0, .1, .15, .1, .1, .1, right); break;
    case 'spear':
      cape(body, hero.color);
      mesh(GEO.ball, accent, 0, 2.24, -.08, .57, .38, .5, body);
      mesh(GEO.box, accent, 0, 2.0, .42, .12, .46, .1, body);
      mesh(GEO.box, coat, 0, 2.64, -.08, .14, .53, .69, body);
      mesh(GEO.cylinder, M.wood, 0, .49, 0, .055, 2.28, .055, right);
      mesh(GEO.gem, M.silver, 0, 1.79, 0, .15, .43, .09, right);
      mesh(GEO.cylinder, accent, -.1, .05, .08, .43, .12, .43, left).rotation.x = Math.PI / 2;
      mesh(GEO.star, coat, -.1, .05, .16, .23, .23, .23, left); break;
  }
  g.userData = { heroId: hero.id, family, body, legs, arms, wings, ornaments, right, left, floating, baseScale: (heavy ? 1.06 : family === 'dragon' ? 1.03 : 1)*(shape.modelScale||1),form:shape.form||'humanoid' };
  return g;
}

export function makeMonster(type, biome = 'forest', bossKind = 0, bossTier = 1) {
  const g = group(), model = group(g);
  const bossTheme=String(bossKind).includes('crystal')?'crystal':String(bossKind).includes('desert')?'desert':String(bossKind).includes('swamp')?'swamp':biome;
  const visualTier=Math.max(1,Math.min(10,Math.floor(bossTier)||1));
  const tierColors=[['#8171a6','#d5b9ed'],['#598c9c','#b7e2e7'],['#ae707f','#efb5a9'],['#ab9272','#ead09d']][(visualTier-1)%4];
  const base = type === 'boss' ? tierColors[0] : ({goblin:'#73aa8f',slime:'#a4bc76',runner:'#d48991',bat:'#9882bb',mushroom:'#ce947b',brute:'#7996ac',wraith:'#9889bc',wisp:'#9889bc',spitter:'#b49bc5',scarab:'#b89b73'}[type] || '#739bb1');
  const skin = material(base), glow = material(type === 'boss' ? tierColors[1] : '#ead6a4', .08);
  const limbs = [], flaps = [];
  if (type === 'boss' || type === 'brute') {
    mesh(GEO.box, skin, 0, .95, 0, 1.22, 1.2, .91, model);
    mesh(GEO.ball, M.ink, 0, 1.85, -.015, .66, .61, .56, model);
    mesh(GEO.box, skin, 0, 2.03, -.02, 1.28, .49, 1.05, model);
    mesh(GEO.gem, glow, 0, 1.1, .49, .23, .33, .09, model);
    for (const s of [-1, 1]) {
      mesh(GEO.cone, M.white, s * .6, 2.47, -.06, .2, .74, .18, model).rotation.z = -s * .5;
      mesh(GEO.box, flat('#ffda7e'), s * .23, 1.86, .57, .23, .12, .04, model);
      const arm = group(model, s * .78, 1.52, 0); mesh(GEO.box, skin, 0, -.39, 0, .45, .87, .5, arm); mesh(GEO.box, M.ink, 0, -.79, .07, .48, .39, .54, arm); limbs.push(arm);
      mesh(GEO.box, M.ink, s * .32, .3, .08, .45, .53, .62, model);
    }
    if (type === 'boss') {
      for (const s of [-1, 1]) { mesh(GEO.gem, glow, s * .93, 1.79, -.02, .35, .4, .3, model); mesh(GEO.cone, skin, s * .85, 2.04, -.38, .2, .68, .2, model).rotation.z = -s * .8; }
      mesh(GEO.torus, glow, 0, 2.97, 0, .68, .68, .68, model).rotation.x = Math.PI / 2;
      for(let i=0;i<Math.min(5,1+Math.ceil(visualTier/2));i++){const a=i*TAU/Math.min(5,1+Math.ceil(visualTier/2));mesh(GEO.gem,glow,Math.sin(a)*.62,3.16,Math.cos(a)*.62,.075,.17,.075,model);}
      if(bossTheme==='crystal')for(const s of[-1,1])mesh(GEO.gem,material('#c9d8ff',.1),s*.62,2.62,-.44,.25,.94,.24,model).rotation.z=-s*.28;
      if(bossTheme==='desert')mesh(GEO.cone,glow,0,2.73,-.1,.32,.78,.23,model);
      if(bossTheme==='swamp')for(const s of[-1,1])mesh(GEO.cone,material('#a5d8ba'),s*.6,1.76,-.42,.23,1.4,.2,model).rotation.z=s*.33;
      if(bossTheme==='forest')mesh(GEO.ball,material('#8eb776'),0,2.39,-.43,.76,.36,.53,model);
    }
  } else if (type === 'bat') {
    mesh(GEO.ball, skin, 0, 1, 0, .49, .56, .4, model);
    for (const s of [-1, 1]) {
      const wing = group(model, s * .32, 1.02, -.03);
      mesh(GEO.cone, skin, s * .48, .08, 0, .59, 1.1, .09, wing).rotation.z = -s * Math.PI / 2;
      mesh(GEO.box, M.ink, s * .46, .39, 0, .98, .07, .09, wing).rotation.z = s * .17; flaps.push(wing);
      mesh(GEO.cone, skin, s * .27, 1.6, -.02, .19, .52, .16, model);
      mesh(GEO.box, glow, s * .18, 1.13, .37, .15, .15, .035, model);
      mesh(GEO.cone, M.white, s * .12, .8, .38, .06, .17, .06, model).rotation.z = Math.PI;
    }
  } else if (type === 'mushroom' || type === 'spitter') {
    mesh(GEO.cylinder, M.white, 0, .48, 0, .35, .89, .35, model);
    mesh(GEO.ball, skin, 0, 1.11, 0, .9, .48, .75, model);
    for (const [x,z] of [[-.42,.12],[.3,.28],[.07,-.35]]) mesh(GEO.ball, M.white, x, 1.42, z, .17, .07, .14, model);
    for (const s of [-1,1]) mesh(GEO.box, M.ink, s * .14, .69, .32, .1, .15, .04, model);
    mesh(GEO.ball, M.pink, 0, .54, .36, .12, .06, .05, model);
  } else if (type === 'wraith' || type === 'wisp') {
    mesh(GEO.cone, skin, 0, .72, 0, .64, 1.3, .49, model);
    mesh(GEO.ball, skin, 0, 1.47, .02, .55, .58, .45, model);
    mesh(GEO.ball, M.ink, 0, 1.45, .29, .38, .36, .2, model);
    for (const s of [-1,1]) { mesh(GEO.box, glow, s * .15, 1.49, .46, .12, .07, .04, model); mesh(GEO.cone, skin, s * .65, .91, .03, .18, .72, .17, model).rotation.z = s * .8; }
  } else if (type === 'slime') {
    mesh(GEO.ball, skin, 0, .51, 0, .84, .66, .72, model);
    for (const s of [-1,1]) { mesh(GEO.box, M.white, s * .24, .68, .61, .23, .22, .04, model); mesh(GEO.box, M.ink, s * .22, .68, .65, .1, .15, .03, model); }
    mesh(GEO.gem, glow, 0, 1.13, -.04, .19, .3, .17, model);
  } else {
    mesh(GEO.ball, skin, 0, .56, 0, .52, .62, .42, model);
    mesh(GEO.ball, skin, 0, 1.18, .08, .63, .52, .48, model);
    for (const s of [-1,1]) {
      mesh(GEO.cone, skin, s * .67, 1.29, 0, .2, .65, .13, model).rotation.z = -s * 1.15;
      mesh(GEO.box, glow, s * .23, 1.3, .51, .22, .15, .04, model);
      mesh(GEO.box, M.ink, s * .23, 1.28, .55, .085, .11, .03, model);
      const leg = mesh(GEO.box, M.ink, s * .22, .17, .06, .24, .29, .35, model); limbs.push(leg);
    }
    mesh(GEO.box, M.ink, 0, .72, .31, .46, .13, .09, model);
    mesh(GEO.cone, M.white, -.15, 1.05, .52, .065, .2, .055, model);
    const club = mesh(GEO.box, M.wood, .65, .57, .06, .17, .88, .17, model); club.rotation.z = -.3;
  }
  const tell = ring(flat('#e99c8c', .58),0,.06,0,1.4,g); tell.visible = false;
  const shadow=contactShadow(g,0,0,.98,.48,.75);
  model.updateMatrixWorld(true);
  const modelHeight=new THREE.Box3().setFromObject(model).max.y;
  const bar=group(g,0,modelHeight+.38,0);bar.name='enemy-health';
  const backing=mesh(GEO.plane,flat('#2b1d32'),0,0,0,1,.15,1,bar);
  const hpGhost=mesh(GEO.plane,flat('#ffc0a5'),0,0,.002,.94,.083,1,bar);
  const hp=mesh(GEO.plane,flat('#f26872'),0,0,.004,.94,.083,1,bar);
  // Small camera-facing bars stay legible above each silhouette, including a hop.
  for(const part of[backing,hpGhost,hp])part.renderOrder=85;
  const chargeLane=group(g);chargeLane.visible=false;
  const lane=mesh(GEO.box,flat('#df8c86',.21),0,.075,3.6,1.6,.016,7.2,chargeLane);
  for(const side of[-1,1])mesh(GEO.box,flat('#f0c3a5',.68),side*.82,.085,3.6,.045,.016,7.2,chargeLane);
  mesh(GEO.cone,flat('#edc3a6',.76),0,.11,7.1,.48,.9,.012,chargeLane).rotation.x=Math.PI/2;
  const flashMaterial=new THREE.MeshBasicMaterial({color:'#fff9ca',transparent:true,opacity:0,depthWrite:false});
  const flash=mesh(GEO.ball,flashMaterial,0,type==='boss'?1.5:.8,0,type==='boss'?1.2:.75,type==='boss'?1.6:.86,.65,g);flash.visible=false;flash.userData.uniqueMaterial=true;
  g.userData={type,biome,bossKind,bossTier:visualTier,model,modelHeight,limbs,flaps,tell,bar,hp,hpGhost,shadow,chargeLane,lane,flash}; return g;
}

export function disposeModel(root) {
  root.traverse(o=>{if(o.userData.uniqueGeometry)o.geometry?.dispose();if(o.userData.uniqueMaterial)o.material?.dispose();});
}
