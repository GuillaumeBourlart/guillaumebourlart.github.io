import {createGame} from './simulation.js';
const STEP=1/60;
const SHARED=['enemies','corpses','gems','breakables','pickups'];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

// One shared world and AI tick; each hero retains their own weapon/build state.
// This module contains no sockets, database or renderer and also drives guest solo.
export function createExpedition({roster,seed=12345,runId='expedition'}={}){
  if(!Array.isArray(roster)||roster.length<1||roster.length>4||new Set(roster.map(p=>p.id)).size!==roster.length)throw new Error('Une expédition accueille de 1 à 4 joueurs distincts.');
  const actors=new Map(),inputs=new Map(),bounds=new Map(),returnPositions=new Map();
  let nextID=1,time=0,phase='menu',pausedBy=null,root,wasInRift=false,accumulator=0;
  const players=()=>[...actors.values()].filter(a=>!a.departed).map(a=>a.game.state.player);
  const views=()=>players().filter(p=>p.hp>0).map(p=>{const b=bounds.get(p.playerId);return b?{minX:p.x+b.minX,maxX:p.x+b.maxX,minZ:p.z+b.minZ,maxZ:p.z+b.maxZ}:{minX:p.x-24,maxX:p.x+24,minZ:p.z-27,maxZ:p.z+22};});
  function shareReward(source,sourceId){
    for(const [id,a]of actors)if(id!==sourceId&&!a.departed){
      a.game.coop.grant(source);
      if(source.kind==='rift'&&source.reward){a.game.state.relics.push({...source.reward});a.game.state.stats[source.reward.stat]+=source.reward.value;}
      const p=a.game.state.player;if(p.hp>0)p.hp=Math.min(p.maxHp,p.hp+({chest:12,shrine:10,camp:15,rift:25}[source.kind]||0));
    }
  }
  for(const member of roster){
    const context={actorId:member.id,nextId:()=>nextID++,players,population:()=>Math.max(1,[...actors.values()].filter(a=>!a.departed).length||roster.length),views,
      reward:source=>shareReward(source,member.id),
      onXP:value=>{for(const a of actors.values())if(!a.departed){const gain=value*a.game.state.stats.xpGain;a.game.state.xp+=gain;a.game.state.collected+=gain;}},
      hurtPlayer:(id,...args)=>actors.get(id)?.game.coop.hurtPlayer(...args)};
    if(root){context.addGem=(...args)=>root.coop.addGem(...args);context.completeBoss=boss=>root.coop.completeRift(boss);}
    const game=createGame({seed,runId,heroId:member.heroId,heroLevel:member.heroLevel,bonuses:member.bonuses,cooperative:context});
    const actor={...member,game,offerVersion:0,offerKey:'',revive:0};actors.set(member.id,actor);root??=game;
  }
  function sync(){for(const a of actors.values())if(a.game!==root)a.game.coop.syncWorld(root);}
  function transition(){
    const inRift=root.state.rift.arenaActive;if(inRift===wasInRift)return false;
    let i=0;
    for(const [id,a]of actors){
      const p=a.game.state.player;
      if(a.game!==root){
        if(inRift){returnPositions.set(id,{x:p.x,z:p.z});p.x=(i%2?1:-1)*1.5;p.z=1.5+Math.floor(i/2)*1.5;}
        else{Object.assign(p,returnPositions.get(id)||{x:root.state.player.x+1.5,z:root.state.player.z});}
      }
      if(!inRift&&root.state.rift.phase==='failed')p.hp=Math.max(1,p.maxHp*.35);
      a.revive=0;p.reviveProgress=0;p.vx=p.vz=0;p.invuln=Math.max(p.invuln,2);a.game.coop.resetProjectiles();i++;
    }
    wasInRift=inRift;sync();return true;
  }
  function offers(){
    for(const a of actors.values()){
      if(a.departed)continue;
      a.game.coop.openOffers();const s=a.game.state,key=JSON.stringify([s.offers,s.upgradeSource]);
      if(key!==a.offerKey){a.offerKey=key;a.offerVersion++;}
    }
    phase=[...actors.values()].some(a=>!a.departed&&a.game.state.phase==='upgrade')?'upgrade':'playing';
  }
  function start(){
    if(phase!=='menu')return false;root.start();let i=0;
    for(const [id,a]of actors){if(a.game!==root){a.game.start();a.game.state.player.x=(i%2?1:-1)*1.2;a.game.state.player.z=1.5+Math.floor(i/2)*1.2;}a.game.state.player.playerId=id;i++;}
    sync();phase='playing';return true;
  }
  function finish(outcome){for(const a of actors.values())a.game.coop.finish(outcome);phase=outcome==='death'?'lost':'won';inputs.clear();return true;}
  function tick(){
    if(phase!=='playing')return;time+=STEP;
    if([...actors.values()].some(a=>a.game===root&&a.departed)){const anchor=players().find(p=>p.hp>0);if(anchor){root.state.player.x=anchor.x;root.state.player.z=anchor.z;}}
    root.state.phase='playing';root.coop.worldTick(time);transition();sync();
    for(const [id,a]of actors){
      if(a.departed)continue;
      if(a.game!==root)a.game.coop.syncWorld(root);
      const revision=root.state.worldRevision;
      a.game.coop.actorTick(inputs.get(id)||{},time);
      const input=inputs.get(id);if(input)input.dash=false;
      if(root.state.worldRevision===revision&&a.game!==root)for(const key of SHARED)root.state[key]=a.game.state[key];
      transition();
    }
    root.coop.finishWorld();sync();
    const alive=players().filter(p=>p.hp>0);
    if(!alive.length){if(root.state.rift.arenaActive){root.coop.failRift();transition();sync();}else{finish('death');return;}}
    for(const a of actors.values()){
      if(a.departed)continue;
      const p=a.game.state.player;
      if(p.hp<=0){const near=alive.some(q=>dist(p,q)<=3);a.revive=near?a.revive+STEP:Math.max(0,a.revive-STEP*.5);p.reviveProgress=Math.min(1,a.revive/4);if(a.revive>=4){p.hp=p.maxHp*.4;p.invuln=3;a.revive=0;p.reviveProgress=0;a.game.coop.resetProjectiles();}}
    }
    offers();
  }
  function step(dt=STEP){if(!Number.isFinite(dt)||dt<=0||phase!=='playing')return;accumulator=Math.min(.1,accumulator+Math.min(.1,dt));while(accumulator+1e-10>=STEP&&phase==='playing'){accumulator-=STEP;tick();}}
  function input(id,value){if(!actors.has(id)||!value||typeof value!=='object')return false;const n=v=>Number.isFinite(v)?Math.max(-1,Math.min(1,v)):0;inputs.set(id,{x:n(value.x),z:n(value.z),dash:Boolean(value.dash)||Boolean(inputs.get(id)?.dash),moveFrame:value.moveFrame!==false});return true;}
  function setBounds(id,value){const a=actors.get(id);if(!a||!value||!['minX','maxX','minZ','maxZ'].every(k=>Number.isFinite(value[k])))return false;const p=a.game.state.player,b={minX:value.minX-p.x,maxX:value.maxX-p.x,minZ:value.minZ-p.z,maxZ:value.maxZ-p.z};if(b.minX>=b.maxX||b.minZ>=b.maxZ||b.minX>0||b.maxX<0||b.minZ>0||b.maxZ<0||Math.max(...Object.values(b).map(Math.abs))>65)return false;bounds.set(id,b);return true;}
  function choose(id,key,version){const a=actors.get(id);if(phase!=='upgrade'||!a||version!==a.offerVersion)return false;const ok=a.game.chooseUpgrade(key);if(ok){a.offerVersion++;a.offerKey='';offers();}return ok;}
  function reroll(id,version){const a=actors.get(id);if(phase!=='upgrade'||!a||version!==a.offerVersion)return false;const ok=a.game.reroll();if(ok){a.offerVersion++;a.offerKey='';offers();}return ok;}
  function pause(id){if(phase!=='playing')return false;phase='paused';pausedBy=id;inputs.clear();return true;}
  function resume(){if(phase!=='paused')return false;phase='playing';pausedBy=null;return true;}
  function snapshot(id){
    const a=actors.get(id);if(!a)return null;const s=a.game.state,team=[...actors.values()],active=team.filter(a=>!a.departed);
    return{...s,phase:phase==='upgrade'?(s.phase==='upgrade'?'upgrade':'waiting'):phase,t:time,offerVersion:a.offerVersion,pausedBy,rewardPlayers:roster.length,
      kills:team.reduce((n,a)=>n+a.game.state.kills,0),bossesDefeated:team.reduce((n,a)=>n+a.game.state.bossesDefeated,0),
      riftsCleared:root.state.riftsCleared,chestsOpened:root.state.chestsOpened,discovered:root.state.discovered,wave:root.state.wave,
      party:active.map(a=>({id:a.id,name:a.name||'Aventurier',heroId:a.game.state.heroId,player:{...a.game.state.player}})),
      projectiles:active.flatMap(a=>a.game.state.projectiles),effects:active.flatMap(a=>a.game.state.effects)};
  }
  function stop(id){const a=actors.get(id);if(!a)return;a.game.state.player.vx=a.game.state.player.vz=0;a.game.state.player.dashTime=0;inputs.delete(id);}
  function depart(id){const a=actors.get(id);if(!a)return false;a.departed=true;a.game.state.player.hp=0;a.game.coop.resetProjectiles();inputs.delete(id);if(phase==='upgrade')offers();return true;}
  return{actors,get phase(){return phase;},get time(){return time;},get root(){return root;},start,step,input,setBounds,choose,reroll,pause,resume,snapshot,stop,depart,extract:()=>finish('extracted'),finish};
}

export function createSoloExpedition(options={}){
  const id='local',expedition=createExpedition({seed:options.seed,runId:options.runId,roster:[{id,heroId:options.heroId,heroLevel:options.heroLevel,bonuses:options.bonuses}]}),game=expedition.root;
  return{get state(){return expedition.snapshot(id);},start:()=>expedition.start(),step:(dt,value)=>{expedition.input(id,value);expedition.step(dt);},pause:()=>expedition.pause(id),resume:expedition.resume,extract:expedition.extract,chooseUpgrade:key=>expedition.choose(id,key,expedition.actors.get(id).offerVersion),reroll:()=>expedition.reroll(id,expedition.actors.get(id).offerVersion),setSpawnBounds:b=>expedition.setBounds(id,b),snapshot:()=>({...game.snapshot(),phase:expedition.phase}),expedition};
}
