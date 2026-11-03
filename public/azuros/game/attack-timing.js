export function attackTiming(time,cooldown,angle,melee){
  const windup=melee?Math.max(1,Math.round(Math.min(.1,cooldown*.4)*60))/60:0;
  return {startedAt:time,impactAt:time+windup,endAt:time+Math.min(.31,cooldown*.92),angle};
}

export function activeAttack(attack,time){
  return attack&&time+1e-6>=attack.startedAt&&time<attack.endAt?attack:null;
}

export function attackPose(attack,time,contact){
  if(time<attack.impactAt&&attack.impactAt>attack.startedAt){
    return contact*Math.max(0,(time-attack.startedAt)/(attack.impactAt-attack.startedAt));
  }
  const recovery=Math.max(0,Math.min(1,(time-attack.impactAt)/(attack.endAt-attack.impactAt)));
  return contact+(1-contact)*recovery;
}
