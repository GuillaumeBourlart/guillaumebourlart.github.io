import {apiURL} from './account.js';
import {MovementPrediction,SnapshotInterpolation} from './prediction.js';
import {WIRE_PROTOCOL,createSnapshotDecoder,createWorldDecoder} from './wire.js';
export function createMultiplayer({account,onLobby=()=>{},onGame=()=>{},onSettled=()=>{},onStatus=()=>{},onLeft=()=>{}}){
  const uid=account.user?.uid;
  let ws=null,room=null,game=null,world=null,revision='',closed=false,connecting=false,authenticated=false,retry=0,retryTimer=null,desired=null,lastReceive=0;
  const snapshots=createSnapshotDecoder(),worlds=createWorldDecoder();
  const listeners=new Set();
  const active=()=>Boolean(uid)&&!closed&&account.user?.uid===uid;
  function send(message){if(active()&&authenticated&&ws?.readyState===1){ws.send(JSON.stringify(message));return true;}return false;}
  function status(text){onStatus(text);for(const fn of listeners)fn(text);}
  async function connect(){
    if(!active()||connecting||ws?.readyState===1||ws?.readyState===0)return;
    connecting=true;
    try{
      const token=await account.token(false,uid);
      if(!active())return;
      const url=apiURL('multiplayer');url.protocol=url.protocol==='https:'?'wss:':'ws:';
      const socket=new WebSocket(url);ws=socket;authenticated=false;lastReceive=0;snapshots.reset();worlds.reset();world=null;revision='';
      socket.onopen=()=>{if(active()&&socket===ws)socket.send(JSON.stringify({type:'hello',token,protocol:WIRE_PROTOCOL}));else socket.close();};
      socket.onmessage=event=>{
        if(!active()||socket!==ws)return;let data;try{data=JSON.parse(event.data);}catch{return;}lastReceive=performance.now();
        if(data.type==='hello'){authenticated=true;retry=0;status('Connecté');if(room&&!data.room){room=null;game=null;world=null;onLobby(null);onLeft();}if(desired){send(desired);desired=null;}}
        else if(data.type==='lobby'){room=data;onLobby(room);}
        else if(data.type==='world'){
          const next=worlds.apply(data);
          // A chunk this socket never received means both sides disagree: start a clean connection.
          if(!next){resync(socket);return;}
          world=next;revision=data.revision;
        }
        else if(data.type==='snapshot'){
          // Every delta must be decoded, even one shown late, or the next ones would miss fields.
          const partial=data.delta?snapshots.apply(data.state):data.state;
          if(!world||revision!==data.revision)return;
          const state={...world,...partial,online:true,isHost:room?.host===account.user?.uid};
          if(!game||game.state.runId!==state.runId){game=makeGame(state);onGame(game);}else game.receive(state);
          status('Connecté');
        }else if(data.type==='settled')onSettled(data);
        else if(data.type==='left'){room=null;game=null;world=null;snapshots.reset();worlds.reset();onLobby(null);onLeft();}
        else if(data.type==='error'){status(data.message);if(!room)desired=null;}
      };
      socket.onerror=()=>{};
      socket.onclose=event=>{
        if(socket!==ws)return;ws=null;
        if(!active())return;
        if(event.code===4001){closed=true;room=null;game=null;world=null;onLobby(null);onLeft();status('Cette carrière est ouverte dans une autre fenêtre.');return;}
        if(game)game.state.phase='reconnecting';status('Reconnexion au groupe…');
        clearTimeout(retryTimer);retryTimer=setTimeout(connect,event.code===4000?0:Math.min(5000,500*2**Math.min(retry++,4)));
      };
    }catch(error){if(active()){status(error.message);if(room)retryTimer=setTimeout(connect,3000);}}
    finally{connecting=false;}
  }
  function resync(socket){if(socket===ws)socket.close(4000,'resync');}
  // A phone that wakes up or regains its network should not wait for the next heartbeat.
  function wake(){if(!active()||!room&&!desired)return;if(ws?.readyState===1&&lastReceive&&performance.now()-lastReceive>2500){const stale=ws;ws=null;stale.close();if(game)game.state.phase='reconnecting';}if(!ws){clearTimeout(retryTimer);retryTimer=setTimeout(connect,0);}}
  const onVisible=()=>{if(typeof document==='undefined'||!document.hidden)wake();};
  globalThis.addEventListener?.('online',wake);globalThis.document?.addEventListener('visibilitychange',onVisible);
  function command(type,extra={}){return send({type,...extra});}
  function makeGame(initial){
    let state=structuredClone(initial),latest=initial,bounds=null,sentBounds='',packets=[],commandPending=0,lastClear=0,stats={commands:0,reconciliations:0,maxCorrection:0};
    let prediction=new MovementPrediction(initial),generation=initial.connectionGeneration,epoch=Boolean(initial.rift.arenaActive);
    const interpolation=new SnapshotInterpolation(),effects=new Map();interpolation.push(initial,performance.now());
    function rememberFX(next){for(const fx of next.effects)effects.set(fx.id,{...fx,bornAt:next.t-(fx.maxLife-fx.life)});while(effects.size>240)effects.delete(effects.keys().next().value);}
    rememberFX(initial);
    return{online:true,get state(){return state;},
      receive(next){
        const teleported=epoch!==Boolean(next.rift.arenaActive)||next.runId!==latest.runId;
        const reconnect=generation!==next.connectionGeneration;generation=next.connectionGeneration;epoch=Boolean(next.rift.arenaActive);
        if(teleported){const sequence=reconnect?0:prediction.sequence;prediction=new MovementPrediction(next);prediction.sequence=sequence;interpolation.clear();effects.clear();packets=[];}
        else{
          if(reconnect){prediction.sequence=0;prediction.pending=[];packets=[];sentBounds='';interpolation.clear();}
          const before={...prediction.body};prediction.reconcile(next,next.inputAck??-1,false);stats.reconciliations++;stats.maxCorrection=Math.max(stats.maxCorrection,Math.hypot(before.x-prediction.body.x,before.z-prediction.body.z));
        }
        latest=next;state={...next,player:{...next.player},enemies:next.enemies.map(p=>({...p})),party:next.party.map(p=>({...p,player:{...p.player}})),projectiles:next.projectiles.map(p=>({...p}))};
        if(next.phase!=='playing')packets=[];
        interpolation.push(next,performance.now());rememberFX(next);commandPending=0;
      },
      advance(dt,alpha=1){
        const sample=interpolation.sample(performance.now());
        if(sample){
          state.t=sample.t;state.enemies=sample.enemies;state.projectiles=sample.projectiles;state.party=sample.party;
          state.gems=sample.gems;state.corpses=sample.corpses;
        }
        const pose=prediction.sample(dt,alpha);for(const key of ['x','z','vx','vz','angle','dashTime','dashCD','dashX','dashZ','terrain','terrainMultiplier'])state.player[key]=pose[key];
        const local=sample?.party.find(m=>m.id===state.player.playerId)?.player;
        if(local)state.player.attack=local.attack;
        if(local)for(const shot of state.projectiles)if(shot.type==='orbit'&&shot.ownerId===state.player.playerId){shot.x+=pose.x-local.x;shot.z+=pose.z-local.z;}
        if(state.phase==='playing')state.player.invuln=pose.invuln;
        state.effects=[];for(const[id,fx]of effects){const age=state.t-fx.bornAt;if(age>fx.maxLife){effects.delete(id);continue;}if(age>=0)state.effects.push({...fx,life:fx.maxLife-age});}
        if(performance.now()-lastReceive>5000&&state.phase==='playing')state.phase='reconnecting';
      },
      step(dt,input){
        // Prediction keeps the hero responsive while acknowledgements are late; only a long silence pauses it.
        if(state.phase!=='playing')return;if(prediction.pending.length>=180){state.phase='reconnecting';return;}const command=prediction.step(input);packets.push(command);stats.commands++;
        // Three frames per message normally; a congested socket gets fewer, fuller messages (12 is the server maximum).
        // The server keeps camera bounds relative to the hero, so they travel again only when that frame changes.
        const congested=ws?.bufferedAmount>0;
        if(input.dash||packets.length>=12||packets.length>=3&&!congested){const p=state.player,key=bounds?[bounds.minX-p.x,bounds.maxX-p.x,bounds.minZ-p.z,bounds.maxZ-p.z].map(v=>Math.round(v*2)/2).join():'',changed=key!==sentBounds;if(send({type:'input',commands:packets,...(changed&&bounds?{bounds}:{})})&&changed)sentBounds=key;packets=[];}
      },
      clearInput(){const now=performance.now();if(now-lastClear<100)return;lastClear=now;if(state.phase==='playing'){prediction.stop();packets=[];send({type:'neutral'});}},
      setSpawnBounds(value){bounds=value;},
      chooseUpgrade(id){if(performance.now()<commandPending)return false;commandPending=performance.now()+800;return command('choose',{id,version:state.offerVersion});},
      reroll(){if(performance.now()<commandPending)return false;commandPending=performance.now()+800;return command('reroll',{version:state.offerVersion});},
      pause:()=>command('pause'),resume:()=>command('resume'),extract:()=>command('extract'),
      get lag(){return lastReceive?performance.now()-lastReceive:0;},
      snapshot:()=>({phase:state.phase,runId:state.runId,t:state.t,heroId:state.heroId,player:state.player,party:state.party,kills:state.kills,level:state.level,enemies:state.enemies.length,offers:state.offers.map(o=>o.id),offerVersion:state.offerVersion,online:true,network:{...stats,pending:prediction.pending.length}})
    };
  }
  const heartbeat=setInterval(()=>{if(active()&&ws?.readyState===1){if(lastReceive&&performance.now()-lastReceive>6500){const stale=ws;ws=null;stale.close();if(game)game.state.phase='reconnecting';retryTimer=setTimeout(connect,500);}else command('ping',{time:Date.now()});}},3000);
  const reauth=setInterval(async()=>{
    const socket=ws;
    if(!active()||socket?.readyState!==1)return;
    try{const token=await account.token(true,uid);if(ws===socket)command('reauth',{token});}
    catch{if(ws===socket)socket.close();}
  },2400000);
  return{get room(){return room;},get game(){return game;},connect,
    async create(maxPlayers=4){desired={type:'create',maxPlayers};if(send(desired))desired=null;else await connect();},
    async join(code){desired={type:'join',code:code.toUpperCase()};if(send(desired))desired=null;else await connect();},
    ready:ready=>command('ready',{ready}),start:()=>command('start'),leave:()=>command('leave'),
    close(){closed=true;desired=null;clearTimeout(retryTimer);clearInterval(reauth);clearInterval(heartbeat);globalThis.removeEventListener?.('online',wake);globalThis.document?.removeEventListener('visibilitychange',onVisible);ws?.close();ws=null;},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}}
}
