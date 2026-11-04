import * as THREE from '../vendor/three.module.js';
import { paintedMaterial, shadowMaterial } from './textures.js';
import { buildHero, buildEnemyBody } from './characters.js';
import {importedHero,importedEnemy,releaseAsset} from './asset-library.js';

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
const moon=new THREE.Shape();moon.moveTo(.21,.53);moon.bezierCurveTo(-.64,.50,-.65,-.49,.20,-.53);moon.bezierCurveTo(-.18,-.28,-.17,.27,.21,.53);GEO.moon=new THREE.ShapeGeometry(moon,14);
const materials = new Map();
export function material(color, glow = 0) {
  const key = String(color) + ':' + glow;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .86, metalness: .02, flatShading: true, emissive: color, emissiveIntensity: glow, side: THREE.DoubleSide }));
  return materials.get(key);
}
// Flat decals are drawn in one pass. A transparent double-sided material is otherwise drawn twice per
// frame, and three.js re-evaluates its shader parameters on both passes.
export function flat(color, opacity = 1) {
  const key = 'flat:' + color + ':' + opacity;
  if (!materials.has(key)) materials.set(key, new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: opacity === 1, forceSinglePass: true }));
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
export function makeHero(hero,options={}) { return !options.software&&importedHero(hero)||buildHero(hero,options); }

export function makeMonster(type, biome = 'forest', bossKind = 0, bossTier = 1, options = {}) {
  const g = group(), model = group(g);
  const visualTier=Math.max(1,Math.min(10,Math.floor(bossTier)||1));
  const asset=!options.software&&options.modelKey?importedEnemy(options.modelKey,type):null;
  if(asset)model.add(asset);
  const {limbs,flaps}=asset?{limbs:[],flaps:[]}:buildEnemyBody(model,type,biome,bossKind,visualTier,options);
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
  const shootLane=group(g),shootLines=[];shootLane.visible=false;
  for(const a of[-.24,0,.24]){const ray=group(shootLane);ray.rotation.y=a;mesh(GEO.box,flat('#ffafad',.45),0,.085,6,.06,.015,12,ray);mesh(GEO.cone,flat('#ffc9ad',.7),0,.11,11.8,.28,.6,.012,ray).rotation.x=Math.PI/2;shootLines.push(ray);}
  g.userData={type,biome,bossKind,bossTier:visualTier,model,asset,modelHeight,limbs,flaps,tell,bar,hp,hpGhost,shadow,chargeLane,lane,shootLane,shootLines,flash}; return g;
}

export function disposeModel(root) {
  releaseAsset(root);
  root.traverse(o=>{if(o.userData.uniqueGeometry)o.geometry?.dispose();if(o.userData.uniqueMaterial)o.material?.dispose();});
}
