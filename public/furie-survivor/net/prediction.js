import {stepMovement,movementEnvironment} from '../game/movement.js';
import {GAME_SPEED} from '../game/timing.js';
const angleLerp=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
export class MovementPrediction{
  constructor(state){this.pending=[];this.offset={x:0,z:0};this.sequence=0;this.reconcile(state,-1,true);}
  configure(state){if(this.obstacles!==state.obstacles||this.zones!==state.zones||this.arena!==Boolean(state.rift?.arenaActive)){this.environment=movementEnvironment(state);this.obstacles=state.obstacles;this.zones=state.zones;this.arena=Boolean(state.rift?.arenaActive);}this.stats=state.stats;}
  step(input){
    const command={seq:this.sequence++,x:Number.isFinite(input.x)?Math.max(-1,Math.min(1,input.x)):0,z:Number.isFinite(input.z)?Math.max(-1,Math.min(1,input.z)):0,dash:Boolean(input.dash)};
    this.previous={...this.body};if(this.body.hp>0)stepMovement(this.body,this.stats,command,this.environment);this.pending.push(command);if(this.pending.length>240)this.pending.shift();return command;
  }
  reconcile(state,ack=-1,reset=false){
    this.configure(state);const before=this.body,oldPrevious=this.previous;
    this.pending=reset||state.phase!=='playing'?[]:this.pending.filter(c=>c.seq>ack);
    this.body={...state.player};if(this.body.hp>0)for(const command of this.pending)stepMovement(this.body,state.stats,command,this.environment);
    if(reset||!before){this.previous={...this.body};this.offset={x:0,z:0};}
    else{const dx=before.x-this.body.x,dz=before.z-this.body.z;this.offset.x+=dx;this.offset.z+=dz;this.previous={...this.body,x:this.body.x+(oldPrevious.x-before.x),z:this.body.z+(oldPrevious.z-before.z)};}
  }
  stop(){this.pending=[];this.body.vx=this.body.vz=0;this.body.dashTime=0;this.previous={...this.body};}
  sample(dt,alpha=1){const blend=Math.exp(-Math.max(0,dt)*12);this.offset.x*=blend;this.offset.z*=blend;const u=Math.max(0,Math.min(1,alpha));return{...this.body,x:this.previous.x+(this.body.x-this.previous.x)*u+this.offset.x,z:this.previous.z+(this.body.z-this.previous.z)*u+this.offset.z,angle:angleLerp(this.previous.angle||0,this.body.angle||0,u)};}
}

// Remote entities use a server-time buffer, independently of the local prediction.
export class SnapshotInterpolation{
  constructor(delay=.1*GAME_SPEED){this.delay=delay;this.frames=[];}
  clear(){this.frames=[];}
  push(state,now){const last=this.frames.at(-1);if(last?.state.t>state.t)return;if(last?.state.t===state.t){now=last.now;this.frames.pop();}this.frames.push({state,now});if(this.frames.length>20)this.frames.shift();}
  sample(now){
    const last=this.frames.at(-1);if(!last)return null;const limit=last.state.phase==='playing'?.08*GAME_SPEED:0,time=Math.min(last.state.t+limit,last.state.t+Math.max(0,(now-last.now)/1000)*GAME_SPEED-this.delay);
    let a=this.frames[0],b=a;for(const f of this.frames){if(f.state.t<=time)a=f;if(f.state.t>=time){b=f;break;}b=f;}
    const t=b.state.t>a.state.t?Math.max(0,Math.min(1,(time-a.state.t)/(b.state.t-a.state.t))):1;
    function entities(key){const old=new Map((a.state[key]||[]).map(o=>[o.id,o]));return(b.state[key]||[]).map(entity=>{const from=old.get(entity.id);if(!from)return{...entity};const nested=key==='party',start=nested?from.player:from,end=nested?entity.player:entity,pose={...end,x:start.x+(end.x-start.x)*t,z:start.z+(end.z-start.z)*t,angle:angleLerp(start.angle||0,end.angle||0,t)};for(const k of ['gaitPhase','hop','telegraph','y'])if(Number.isFinite(start[k])&&Number.isFinite(end[k]))pose[k]=start[k]+(end[k]-start[k])*t;if(a===b&&time>b.state.t){const delta=Math.min(.08,time-b.state.t);pose.x+=(end.vx||0)*delta;pose.z+=(end.vz||0)*delta;}return nested?{...entity,player:pose}:pose;});}
    return{t:Math.max(0,time),enemies:entities('enemies'),party:entities('party'),projectiles:entities('projectiles')};
  }
}
