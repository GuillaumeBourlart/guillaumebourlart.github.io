import * as THREE from '../vendor/three.module.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

/** Apply after the normal creature gait, keeping recoil entirely visual. */
export function updateMonsterFeedback(g,e,time,{reducedMotion=false,cameraQuaternion}={}){
  const ud=g.userData,s=Math.max(.01,g.scale.x),ratio=clamp(e.hp/Math.max(1,e.maxHp)),flash=Math.max(0,e.hitFlash||0);
  if(ud.feedbackId!==e.id||time<(ud.feedbackTime??time)){
    ud.feedbackId=e.id;ud.feedbackHP=ratio;ud.ghostHP=ratio;ud.hitStarted=-10;ud.flashPrevious=0;ud.feedbackTime=time;ud.hitDirection={x:0,z:-1};
  }
  const dt=Math.max(0,Math.min(.1,time-ud.feedbackTime));ud.feedbackTime=time;
  if(ratio<ud.feedbackHP-.0001||flash>ud.flashPrevious+.001){
    ud.hitStarted=time;
    const source=e.hitDirection;
    const dx=Number.isFinite(source?.x)?source.x:-Math.sin(e.angle||0),dz=Number.isFinite(source?.z)?source.z:-Math.cos(e.angle||0),c=Math.cos(e.angle||0),sine=Math.sin(e.angle||0);
    ud.hitDirection={x:dx*c-dz*sine,z:dx*sine+dz*c};
  }
  ud.feedbackHP=ratio;ud.flashPrevious=flash;
  const age=Math.max(0,time-ud.hitStarted),impact=age<.24?Math.pow(1-age/.24,2):0,amount=impact*(reducedMotion?.35:1)*(e.type==='boss'?.5:1);
  if(amount>0){
    ud.model.scale.x*=1+.12*amount;ud.model.scale.z*=1+.1*amount;ud.model.scale.y*=1-.15*amount;
    ud.model.position.x+=ud.hitDirection.x*.2*amount/s;ud.model.position.z+=ud.hitDirection.z*.2*amount/s;ud.model.position.y+=.055*amount/s;
    ud.model.rotation.x+=ud.hitDirection.z*.18*amount;ud.model.rotation.z-=ud.hitDirection.x*.18*amount;
  }
  ud.flash.visible=flash>0;ud.flash.material.opacity=clamp(flash/.12)*(reducedMotion?.2:.38);
  ud.bar.visible=e.type==='boss'||e.elite||ratio<1||flash>0;
  const width=e.type==='boss'?2.65:e.elite?1.45:1.12;
  const height=Math.min(6.82,ud.modelHeight*s+Math.max(0,e.hop||0)+.38);
  ud.bar.position.y=height/s;ud.bar.scale.set(width/s,1/s,1/s);
  if(cameraQuaternion){ud.barInverse??=new THREE.Quaternion();ud.barInverse.copy(g.quaternion).invert();ud.bar.quaternion.copy(ud.barInverse).multiply(cameraQuaternion);}
  else ud.bar.rotation.y=-g.rotation.y;
  if(age>.11)ud.ghostHP=Math.max(ratio,ud.ghostHP-dt*.95);
  if(ratio>ud.ghostHP)ud.ghostHP=ratio;
  ud.hp.scale.x=.94*ratio;ud.hp.position.x=-(1-ratio)*.47;
  ud.hpGhost.scale.x=.94*ud.ghostHP;ud.hpGhost.position.x=-(1-ud.ghostHP)*.47;
  return{impact,barHeight:height,healthRatio:ratio};
}
