import {AUDIO_BANK} from './audio-bank.js';
// Original sound design, unlocked by a user gesture. Recorded replacements
// are optional and load only when configured in audio-bank.js.
// This adapter observes the simulation; it never changes game rules.
export function createSoundscape({bank=AUDIO_BANK}={}) {
  let context=null,master=null,wind=null,windFilter=null,enabled=false,active=true;
  let suspendTimer=null,nodes=0,lastRun='',lastPhase='',lastHP=0,lastKills=0,lastDash=0,lastAttack=0,lastCollected=0,lastOrbit=0;
  let nextAmbient=0,nextStep=0,ambientIndex=0,seen=new Set(),noiseBuffer=null,ambience=null,ambienceKey='';
  const samples=new Map(),sampleIndices=new Map();
  const gates=new Map();
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function init(){
    if(context)return true;
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;
    context=new Audio();master=context.createGain();master.gain.value=0;
    const limiter=context.createDynamicsCompressor?.();
    if(limiter){limiter.threshold.value=-14;limiter.knee.value=18;limiter.ratio.value=5;limiter.attack.value=.004;limiter.release.value=.12;master.connect(limiter);limiter.connect(context.destination);}else master.connect(context.destination);
    const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=buffer.getChannelData(0);
    let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.018)/1.018;data[i]=brown*3.3;}
    wind=context.createBufferSource();wind.buffer=buffer;wind.loop=true;
    windFilter=context.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=450;
    const gain=context.createGain();gain.gain.value=.026;wind.connect(windFilter);windFilter.connect(gain);gain.connect(master);wind.start();
    noiseBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*.6),context.sampleRate);
    const noise=noiseBuffer.getChannelData(0);for(let i=0;i<noise.length;i++)noise[i]=Math.random()*2-1;
    const owner=context,loads=new Map();
    const load=url=>{if(!loads.has(url))loads.set(url,(async()=>{try{const response=await fetch(url);if(!response.ok)return null;const buffer=await owner.decodeAudioData(await response.arrayBuffer());return buffer.duration<=30?buffer:null;}catch{return null;}})());return loads.get(url);};
    for(const [name,urls] of Object.entries(bank)){
      if(!Array.isArray(urls))continue;
      Promise.all(urls.slice(0,6).filter(url=>typeof url==='string'&&url.startsWith('./assets/audio/')).map(load)).then(buffers=>{if(context===owner){const ready=buffers.filter(Boolean);if(ready.length)samples.set(name,ready);}});
    }
    return true;
  }
  function envelope(gain,t,duration,volume){
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.009);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  }
  function note(frequency,duration=.18,{end=frequency,type='sine',volume=.06,delay=0,pan=0}={}){
    if(!enabled||!active||!context||context.state!=='running'||nodes>=28)return;
    const at=context.currentTime+delay,osc=context.createOscillator(),gain=context.createGain();
    const stereo=context.createStereoPanner?.();osc.type=type;osc.frequency.setValueAtTime(frequency,at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30,end),at+duration);envelope(gain,at,duration,volume);
    osc.connect(gain);if(stereo){stereo.pan.value=clamp(pan,-1,1);gain.connect(stereo);stereo.connect(master);}else gain.connect(master);
    nodes++;osc.start(at);osc.stop(at+duration+.01);osc.onended=()=>{nodes--;osc.disconnect();gain.disconnect();stereo?.disconnect();};
  }
  function sample(name,{volume=.2,pan=0,rate=1}={}){
    const choices=samples.get(name);if(!choices?.length||!enabled||!active||context?.state!=='running')return false;
    if(nodes>=28)return true;
    const index=(sampleIndices.get(name)||0)%choices.length;sampleIndices.set(name,index+1);
    const source=context.createBufferSource(),gain=context.createGain(),stereo=context.createStereoPanner?.();
    source.buffer=choices[index];source.playbackRate.value=rate;gain.gain.value=volume;source.connect(gain);
    if(stereo){stereo.pan.value=clamp(pan,-1,1);gain.connect(stereo);stereo.connect(master);}else gain.connect(master);
    nodes++;source.onended=()=>{nodes--;source.disconnect();gain.disconnect();stereo?.disconnect();};source.start();return true;
  }
  function updateAmbience(biome){
    const key='amb_'+biome,buffer=samples.get(key)?.[0];
    if(key===ambienceKey)return;
    if(ambience){ambience.gain.gain.setTargetAtTime(.0001,context.currentTime,.18);ambience.source.stop(context.currentTime+.8);ambience=null;ambienceKey='';}
    if(!buffer||nodes>=28)return;
    const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=.0001;source.connect(gain);gain.connect(master);gain.gain.setTargetAtTime(.09,context.currentTime,.35);nodes++;source.onended=()=>{nodes--;source.disconnect();gain.disconnect();};source.start();ambience={source,gain};ambienceKey=key;
  }
  function noise(duration=.12,{frequency=900,end=frequency,volume=.065,pan=0,type='bandpass'}={}){
    if(!enabled||!active||context?.state!=='running'||nodes>=28||!noiseBuffer)return;
    const at=context.currentTime,source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),stereo=context.createStereoPanner?.();
    source.buffer=noiseBuffer;filter.type=type;filter.frequency.setValueAtTime(frequency,at);filter.frequency.exponentialRampToValueAtTime(Math.max(40,end),at+duration);if(filter.Q)filter.Q.value=.7;
    envelope(gain,at,duration,volume);source.connect(filter);filter.connect(gain);
    if(stereo){stereo.pan.value=clamp(pan,-1,1);gain.connect(stereo);stereo.connect(master);}else gain.connect(master);
    nodes++;source.onended=()=>{nodes--;source.disconnect();filter.disconnect();gain.disconnect();stereo?.disconnect();};source.start(at);source.stop(at+duration+.01);
  }
  function gate(id,seconds){const now=context?.currentTime||0;if(now<(gates.get(id)||0))return false;gates.set(id,now+seconds);return true;}
  function chord(notes,volume=.065,spacing=.065){notes.forEach((f,i)=>note(f,.42,{volume:volume/(1+i*.13),type:'triangle',delay:i*spacing}));}
  function play(event,detail){
    if(!enabled||!active)return;
    const pan=typeof detail==='object'?detail?.pan||0:0;
    const recorded=event==='attack'?'attack_'+detail?.family:event==='break'?'break_'+(detail?.propType||'crate'):event;
    if(sample(recorded,{volume:event==='orbit'?.09:event==='xp'?.1:.24,pan}))return;
    switch(event){
      case 'enable':chord([293.66,440],.045,.09);break;
      case 'start':note(180,.23,{end:390,type:'triangle',volume:.085});note(587.33,.35,{delay:.12,volume:.04});break;
      case 'select':note(440,.13,{end:554.37,volume:.045});break;
      case 'upgrade':chord([440,554.37,659.25]);break;
      case 'reroll':note(370,.12,{end:740,type:'triangle',volume:.04});break;
      case 'train':chord([293.66,440,587.33,739.99],.06);break;
      case 'summon':note(110,1,{end:440,type:'triangle',volume:.055});note(220,.8,{end:554.37,delay:.1,volume:.035});break;
      case 'reveal':chord(detail==='legendary'?[293.66,369.99,440,587.33,739.99,880]:detail==='epic'?[293.66,440,587.33,739.99]:[440,554.37,659.25],.08,.08);break;
      case 'extract':chord([369.99,440,587.33],.06,.1);break;
      case 'death':note(175,.6,{end:65,type:'triangle',volume:.075});break;
      case 'level':chord([587.33,739.99,880],.05,.06);break;
      case 'reward':chord([659.25,880],.04,.07);break;
      case 'rift-open':if(gate('rift-open',1)){note(146.83,.85,{end:293.66,type:'sine',volume:.045});chord([440,587.33,739.99],.035,.18);}break;
      case 'rift-start':if(gate('rift-start',1)){note(110,.7,{end:55,type:'triangle',volume:.065});note(220,.5,{end:146.83,delay:.15,volume:.035});}break;
      case 'rift-victory':if(gate('rift-victory',1))chord([293.66,440,587.33,739.99,880],.065,.095);break;
      case 'dash':if(gate('dash',.3)){noise(.18,{frequency:1800,end:240,volume:.11});note(420,.16,{end:80,type:'triangle',volume:.05});}break;
      case 'hurt':if(gate('hurt',.22)){noise(.11,{frequency:360,volume:.12});note(95,.19,{end:42,type:'triangle',volume:.12});}break;
      case 'hit':noise(.055,{frequency:730,end:320,volume:.075,pan});note(350,.055,{end:150,volume:.025,pan});break;
      case 'critical':noise(.075,{frequency:1900,end:450,volume:.09,pan});note(620,.12,{end:300,type:'triangle',volume:.045,pan});break;
      case 'defeat':noise(.1,{frequency:530,end:130,volume:.055,pan});note(240,.075,{end:130,type:'triangle',volume:.038,pan});break;
      case 'xp':note(880+(lastCollected%4)*110,.075,{end:1320,volume:.027,pan});break;
      case 'orbit':noise(.11,{frequency:1250,end:500,volume:.026,pan});note(630,.12,{end:470,volume:.009,pan});break;
      case 'attack':{
        const family=detail?.family||'bow';
        if(['hammer','fists','scythe','spear','boomerang','daggers'].includes(family)){noise(.1,{frequency:1400,end:450,volume:.065,pan});if(family==='hammer')note(135,.12,{end:75,type:'triangle',volume:.04});}
        else if(['lightning','laser','frost'].includes(family)){noise(.065,{frequency:2600,end:800,volume:.035,pan});note(family==='frost'?1000:700,.11,{end:280,type:'triangle',volume:.026,pan});}
        else if(['fireball','dragon','grenade','mines'].includes(family)){noise(.18,{frequency:820,end:190,volume:.07,pan});note(145,.12,{end:80,volume:.025,pan});}
        else if(family==='bees'){note(150,.12,{end:190,type:'sawtooth',volume:.012,pan});}
        else{noise(.075,{frequency:1800,end:600,volume:.045,pan});note(520,.065,{end:350,volume:.018,pan});}
        break;
      }
      case 'break':{
        const crystal=detail?.propType==='crystal',vase=detail?.propType==='vase';
        noise(.2,{frequency:crystal?2700:vase?1700:620,end:crystal?1200:220,volume:.12,pan});note(crystal?1320:vase?520:95,.18,{end:crystal?880:70,type:'triangle',volume:.055,pan});break;
      }
      case 'trap-warning':note(520,.11,{end:570,type:'triangle',volume:.045,pan});note(520,.1,{delay:.16,type:'triangle',volume:.03,pan});break;
      case 'trap-hit':noise(.18,{frequency:1600,end:360,volume:.13,pan});note(145,.13,{end:60,type:'triangle',volume:.07,pan});break;
      case 'pickup-heal':chord([523.25,659.25,783.99],.045,.07);break;
      case 'terrain-entry':noise(.18,{frequency:detail?.terrain==='ice'?2100:240,end:detail?.terrain==='ice'?1200:100,volume:.05,pan});break;
      case 'heavy-impact':noise(.14,{frequency:530,end:120,volume:.12,pan});note(95,.14,{end:38,type:'triangle',volume:.065,pan});break;
      case 'explosion':noise(.25,{frequency:420,end:80,volume:.14,pan,type:'lowpass'});note(85,.2,{end:36,type:'triangle',volume:.07,pan});break;
      case 'electric':noise(.09,{frequency:2800,end:700,volume:.045,pan});note(620,.09,{end:210,type:'triangle',volume:.029,pan});break;
    }
  }
  function setEnabled(value){
    enabled=Boolean(value);clearTimeout(suspendTimer);
    try{
      if(enabled&&!init()){enabled=false;return false;}
      if(!context)return true;
      if(enabled&&active){context.resume().catch(()=>{});master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(.42,context.currentTime,.06);nextAmbient=context.currentTime+1.5;}
      else{master.gain.setTargetAtTime(.0001,context.currentTime,.045);suspendTimer=setTimeout(()=>{if(!enabled||!active)context.suspend().catch(()=>{});},250);}
      return true;
    }catch{enabled=false;return false;}
  }
  function setActive(value){active=Boolean(value);setEnabled(enabled);}
  function update(state){
    if(!state)return;
    if(state.runId!==lastRun){lastRun=state.runId;lastHP=state.player.hp;lastKills=state.kills;lastDash=0;lastAttack=state.attackCount||0;lastCollected=state.collected||0;lastOrbit=state.t||0;seen.clear();lastPhase=state.phase;}
    if(!enabled||!active||!context){lastHP=state.player.hp;lastKills=state.kills;lastAttack=state.attackCount||0;lastCollected=state.collected||0;return;}
    const now=context.currentTime,p=state.player,playing=state.phase==='playing';
    if(lastPhase!==state.phase){if(state.phase==='upgrade')play('level');if(state.phase==='lost')play('death');if(state.phase==='won')play('extract');lastPhase=state.phase;}
    // A victory opens the reward screen in the same simulation step. Its cue
    // belongs to that transition, even though combat has already paused.
    const nextSeen=new Set();
    for(const fx of state.effects||[]){nextSeen.add(fx.id);if(!seen.has(fx.id)&&['rift-open','rift-start','rift-victory'].includes(fx.type))play(fx.type);}
    if(playing){
      if(p.hp<lastHP)play('hurt');
      if(p.dashTime>0&&lastDash<=0)play('dash');
      if(Math.hypot(p.vx,p.vz)>2&&now>nextStep&&p.dashTime<=0){nextStep=now+(p.terrain==='mud'?.3:.22);if(!sample('step_'+(p.terrain||'normal'),{volume:.08})){noise(.045,{frequency:p.terrain==='ice'?2000:p.terrain==='mud'?220:550,volume:.027});note(75,.045,{end:40,type:'triangle',volume:.02});}}
      if(state.kills>lastKills&&gate('defeat',.13))play('defeat',{pan:Math.sin(state.kills)*.25});
      if((state.attackCount||0)>lastAttack&&gate('attack',.09))play('attack',{family:state.attackFamily});
      if(state.attackFamily==='orbit'&&state.t-lastOrbit>Math.max(.23,1.1/(state.stats?.cadence||1))){lastOrbit=state.t;play('orbit',{pan:Math.sin(state.t*3)*.3});}
      if((state.collected||0)>lastCollected&&gate('xp',.075))play('xp');
      for(const fx of state.effects||[]){
        if(seen.has(fx.id)||['rift-open','rift-start','rift-victory'].includes(fx.type))continue;
        if(Math.hypot(fx.x-p.x,fx.z-p.z)>14)continue;
        const pan=clamp((fx.x-p.x)/12,-.65,.65);
        if(['break','trap-warning','trap-hit','pickup-heal','terrain-entry'].includes(fx.type)&&gate(fx.type,fx.type==='break'?.08:.18))play(fx.type,{...fx,pan});
        else if(fx.type==='chest')play('reward');
        else if(fx.type==='heal'&&gate('heal',1))chord([493.88,659.25],.03,.1);
        else if(['explosion','burst','bonk'].includes(fx.type)&&gate('heavy',.25))play(fx.type==='bonk'?'heavy-impact':'explosion',{pan});
        else if(['lightning','beam'].includes(fx.type)&&gate('electric',.28))play('electric',{pan});
        else if((fx.type==='damage'||fx.type==='hit')&&!fx.hostile&&(fx.amount||fx.damage)&&gate('impact',.09))play((fx.crit||fx.critical)?'critical':'hit',{pan});
      }
    }
    seen=nextSeen;
    if(playing||state.phase==='menu')updateAmbience(state.biome||'forest');
    if((playing||state.phase==='menu')&&now>nextAmbient){
      nextAmbient=now+4.5+(ambientIndex%3)*1.1;ambientIndex++;
      const biome=state.biome||'forest';
      windFilter.frequency.setTargetAtTime(biome==='desert'?720:biome==='swamp'?280:450,now,1);
      if(biome==='forest'){
        const f=[1320,1568,1760,1480][ambientIndex%4];note(f,.12,{end:f*1.14,volume:.017,pan:.45});note(f*1.18,.15,{end:f,delay:.15,volume:.012,pan:.45});
      }else if(biome==='crystal'){note([587.33,739.99,880][ambientIndex%3],.95,{volume:.025,pan:-.4});}
      else if(biome==='swamp'){note(196,.5,{end:174,volume:.019,pan:.35});note(392,.22,{delay:.18,volume:.01});}
      if(state.phase==='menu'&&ambientIndex%2===0)chord([293.66,440,554.37],.015,.24);
    }
    lastHP=p.hp;lastKills=state.kills;lastDash=p.dashTime;lastAttack=state.attackCount||0;lastCollected=state.collected||0;
  }
  return{setEnabled,setActive,play,update,dispose(){clearTimeout(suspendTimer);wind?.stop();ambience?.source.stop();ambience=null;ambienceKey='';context?.close().catch(()=>{});context=null;samples.clear();noiseBuffer=null;}};
}
