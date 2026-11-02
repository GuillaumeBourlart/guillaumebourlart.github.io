// Shared by authoritative simulation and client prediction. One command = 1/60 s.
const STEP=1/60,finite=(n,f=0)=>Number.isFinite(n)?n:f,clamp=n=>Math.max(-1,Math.min(1,finite(n)));
export function movementEnvironment(state){
  const bins=new Map();for(const o of state.obstacles||[]){const key=Math.floor(o.x/8)+','+Math.floor(o.z/8);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(o);}
  return{
    terrain(x,z){if(state.rift?.arenaActive)return'normal';let result='normal';for(const q of state.zones||[])if((x-q.x)**2+(z-q.z)**2<q.radius**2){if(q.type==='mud')return'mud';result='ice';}return result;},
    resolve(p){for(let pass=0;pass<2;pass++){const cx=Math.floor(p.x/8),cz=Math.floor(p.z/8);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const o of bins.get((cx+dx)+','+(cz+dz))||[]){const x=p.x-o.x,z=p.z-o.z,d=Math.hypot(x,z),r=p.radius+o.radius;if(d<r){p.x=o.x+(d>1e-5?x/d:1)*r;p.z=o.z+(d>1e-5?z/d:0)*r;}}const d=Math.hypot(p.x,p.z),edge=(state.rift?.arenaActive?22:state.arenaRadius)-p.radius-.4;if(d>edge){p.x*=edge/d;p.z*=edge/d;}}}
  };
}
export function stepMovement(p,stats,input,env){
  p.dashCD=Math.max(0,finite(p.dashCD)-STEP);p.invuln=Math.max(0,finite(p.invuln)-STEP);p.hitFlash=Math.max(0,finite(p.hitFlash)-STEP);p.hitStun=Math.max(0,finite(p.hitStun)-STEP);
  if(input.moveFrame===false){p.dashTime=Math.max(0,finite(p.dashTime)-STEP);return{dashed:false};}
  const ix=clamp(input.x),iz=clamp(input.z),m=Math.hypot(ix,iz),normal=Math.max(1,m),x=ix/normal,z=iz/normal,terrain=env.terrain(p.x,p.z),factor=terrain==='mud'?.62:1;
  const dashed=Boolean(input.dash)&&p.dashCD<=0;
  if(dashed){p.dashX=m>.05?ix/m:Math.sin(p.angle);p.dashZ=m>.05?iz/m:Math.cos(p.angle);p.dashTime=.2;p.dashCD=2.6/stats.dashRecharge;p.invuln=Math.max(p.invuln,.34);}
  if(p.dashTime>0){p.vx=finite(p.dashX)*23;p.vz=finite(p.dashZ,-1)*23;p.dashTime=Math.max(0,p.dashTime-STEP);}
  else{const blend=1-Math.exp(-(terrain==='ice'?(m>.05?5.5:2.8):22)*STEP),speed=p.speed*factor*(p.hitStun>0?.3:1),momentum=Math.hypot(p.vx,p.vz),limit=p.speed*1.12;if(terrain==='ice'&&momentum>limit){p.vx*=limit/momentum;p.vz*=limit/momentum;}p.vx+=(x*speed-p.vx)*blend;p.vz+=(z*speed-p.vz)*blend;}
  if(m>.05)p.angle=Math.atan2(ix,iz);p.x=finite(p.x)+p.vx*STEP;p.z=finite(p.z)+p.vz*STEP;env.resolve(p);
  const previousTerrain=p.terrain;p.terrain=env.terrain(p.x,p.z);p.terrainMultiplier=p.terrain==='mud'?.62:1;return{dashed,previousTerrain};
}
