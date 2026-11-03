import { GEO,TAU,material,flat,mesh,ring,disc,group,contactShadow } from './models.js';
import { paintedMaterial,riftMaterial } from './textures.js';

const clamp=n=>Math.max(0,Math.min(1,n));
const COLORS=['#c8b5ec','#b6dfe7','#e7b0aa','#e4cfaa'];
export const riftColor=tier=>COLORS[(Math.max(1,Math.floor(tier)||1)-1)%COLORS.length];

/** A view of a temporary offer. Lifetime and boss rules belong to simulation. */
export function makeRift(poi){
  const g=group(),tier=Math.max(1,Math.floor(poi.tier)||1),color=riftColor(tier),radius=poi.radius||4.5;
  g.name='poi:'+poi.id;g.userData.poiId=poi.id;g.userData.poiType='portal';g.userData.visualTier=tier;
  contactShadow(g,.1,.15,3.1,.46,.76);
  const halo=mesh(GEO.fineRing,flat(color,.64),0,.055,0,radius,radius,radius,g);halo.rotation.x=-Math.PI/2;
  const fill=disc(flat(color,.045),0,.037,0,radius,g);
  const progress=group(g);
  for(let i=0;i<12;i++){const s=mesh(GEO.progress,flat('#eddfc5',.82),0,.065,0,radius,radius,radius,progress);s.rotation.set(-Math.PI/2,0,i*TAU/12);s.visible=false;}
  mesh(GEO.cylinder16,paintedMaterial('stone','#4f5874'),0,.12,0,2.26,.24,2.26,g);
  const innerRing=ring(flat(color,.38),0,.25,0,2.02,g);
  const gate=group(g,0,.2,0);gate.rotation.y=-.08;
  for(const side of[-1,1]){
    mesh(GEO.softBox,paintedMaterial('stone','#7c8297'),side*1.77,1.45,0,.42,2.85,.57,gate).rotation.z=-side*.075;
    mesh(GEO.cylinder16,paintedMaterial('stone','#b6b1b8'),side*1.88,.13,0,.46,.25,.48,gate);
    mesh(GEO.gem,material(color,.1),side*1.66,3.01,.03,.25,.51,.24,gate);
    mesh(GEO.box,material(color,.06),side*1.72,1.55,.31,.055,1.55,.025,gate);
  }
  mesh(GEO.torus,paintedMaterial('stone','#5c607b'),0,2.02,0,1.55,1.94,.74,gate);
  mesh(GEO.torus,material(color,.07),0,2.02,.07,1.42,1.82,.42,gate);
  const aperture=group(gate,0,2.02,.095);aperture.scale.set(1.39,1.78,1);
  const core=mesh(GEO.plane,riftMaterial(tier).clone(),0,0,0,2,2,1,aperture);core.userData.uniqueMaterial=true;
  const crest=mesh(GEO.gem,material('#e8d9bd',.08),0,4.13,0,.18,.27,.16,gate);
  const runes=[];
  for(let i=0;i<8;i++){
    const a=i*TAU/8,rune=group(g,Math.sin(a)*3.2,.08,Math.cos(a)*3.2);rune.rotation.y=a;
    mesh(GEO.box,flat(color,.65),0,0,0,.055,.025,.25,rune);mesh(GEO.box,flat(color,.65),0,0,.14,.19,.025,.045,rune);
    runes.push(rune);
  }
  const complete=group(g,0,2.15,.3);
  for(const[x,y,l,a]of[[-.18,0,.5,-.65],[.15,.15,.83,.65]])mesh(GEO.softBox,material('#ead7ad',.06),x,y,0,.13,l,.08,complete).rotation.z=a;
  complete.visible=false;
  Object.assign(g.userData,{halo,fill,progress,gate,aperture,core,crest,innerRing,runes,complete});
  return g;
}

export function updateRift(g,poi,state,time,{reduced=false}={}){
  const u=g.userData,radius=poi.radius||4.5,phase=poi.phase||(poi.completed?'won':poi.active?'active':'offer'),won=phase==='won'||poi.completed;
  const near=Math.hypot(poi.x-state.player.x,poi.z-state.player.z)<radius;
  const age=Math.max(0,(state.t||0)-(poi.offerAt||0)),appear=reduced?1:clamp(age/.85),ease=1-Math.pow(1-appear,3);
  const remaining=Math.max(0,(poi.expiresAt??Infinity)-(state.t||0));
  const closing=!won&&['offer','activating'].includes(phase)&&remaining<.65?clamp(remaining/.65):1;
  u.gate.scale.set(.86+.14*ease,(.06+.94*ease)*(reduced?1:.3+.7*closing),1);
  u.core.material.opacity=won?Math.max(0,1-Math.max(0,(state.t||0)-(poi.completedAt||0))/.9):(.7+.3*ease)*closing;
  // Acceptance and charge remain legible in reduced-motion mode; only the
  // ornamental swirl, floating crest and materialization are stopped.
  u.core.rotation.z=reduced?0:time*(phase==='incoming'?.55:phase==='active'?.3:.16);
  u.crest.position.y=4.13+(reduced?0:Math.sin(time*1.6)*.07);
  u.halo.visible=!won;u.fill.visible=!won;u.fill.material=flat(riftColor(poi.tier),near?.09:.035);
  u.innerRing.material=flat(won?'#e4cea2':riftColor(poi.tier),won?.56:.38);
  u.complete.visible=!!won;
  const amount=won?1:['offer','activating'].includes(phase)?clamp(poi.activation||0):clamp(poi.progress||0);
  for(let i=0;i<u.progress.children.length;i++)u.progress.children[i].visible=amount>i/12;
  for(let i=0;i<u.runes.length;i++)u.runes[i].position.y=.08+(reduced||won?0:Math.sin(time*1.4+i)*.025);
  g.userData.phase=phase;g.userData.activation=amount;
}
