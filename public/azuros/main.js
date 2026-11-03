import {createGame} from './game/simulation.js';
import {createProgression,SAVE_KEY} from './game/progression.js';
import {createSoloExpedition} from './game/expedition.js';
import {createAccount} from './net/account.js';
import {createMultiplayer} from './net/multiplayer.js';
import {createOnlineUI} from './net/online-ui.js';
import {createRenderer} from './render.js';
import {createUI} from './ui.js';
import {createSoundscape} from './audio.js';
import {GAME_SPEED} from './game/timing.js';
import {createDirections} from './ui-directions.js';
import {preloadGameAssets} from './render/asset-library.js';

const loading=document.getElementById('asset-loading');
try{
  const assets=await preloadGameAssets((done,total)=>{if(loading){loading.querySelector('progress').value=done/total;loading.querySelector('small').textContent=`${done} / ${total} modèles préparés`;}});
  if(assets.failed.length)console.warn('Certaines créatures utilisent temporairement un modèle de secours.',assets.failed.length);
}catch(error){console.warn('La bibliothèque 3D n’a pas pu être chargée.',error.message);}
loading?.remove();

let account=null,multiplayer=null,onlineUI=null,currentUID=null,profileReady=false,profileRevision=-1,pendingGuestLogin=false,authGeneration=0;
const guestStorage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>{
  if(currentUID)throw new Error('La carrière de compte est gérée par le serveur.');
  localStorage.setItem(key,value);
}};
const MIX_KEY='azuros-audio-mix-v1';
function initialMix(){
  const defaults={effects:100,music:100};
  try{
    const saved=JSON.parse(localStorage.getItem(MIX_KEY));
    for(const channel of Object.keys(defaults)){
      if(Number.isFinite(saved?.[channel]))defaults[channel]=Math.max(0,Math.min(100,saved[channel]));
    }
    if(!saved&&localStorage.getItem('furie-survivors-music-v1')==='false')defaults.music=0;
  }catch{}
  return defaults;
}
const mix=initialMix();
const career=createProgression({storage:guestStorage}),pressed=new Set();
const soundscape=createSoundscape({effectsVolume:mix.effects/100,musicVolume:mix.music/100});
try {
  for(let i=localStorage.length-1;i>=0;i--){
    const key=localStorage.key(i);
    if(key?.startsWith(SAVE_KEY+':')||key?.startsWith('furie-survivors-save-v2:'))localStorage.removeItem(key);
  }
}catch{}
const COMFORT_KEY='furie-survivors-comfort-v1',SOUND_KEY='furie-survivors-sound-v1';
function initialSound(){try{return localStorage.getItem(SOUND_KEY)!=='false';}catch{return true;}}
function initialComfort(){try{const stored=localStorage.getItem(COMFORT_KEY);if(stored!==null)return stored==='true';}catch{}return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;}
let reducedMotion=initialComfort();
let game,view,ui,directions,queuedDash=false,sound=initialSound(),lastSettled='',settlement=null,resumeAfterModal=false;
const controls={up:['KeyW','KeyZ','ArrowUp'],down:['KeyS','ArrowDown'],left:['KeyA','KeyQ','ArrowLeft'],right:['KeyD','ArrowRight']};
const gameplayKeys=new Set([...Object.values(controls).flat(),'Space','ShiftLeft']);
const has=keys=>keys.some(key=>pressed.has(key));
function unlockAudio(){if(sound){if(soundscape.setEnabled(true))soundscape.primeMusic();else{sound=false;ui?.setSoundEnabled(false);}}}
document.addEventListener('pointerdown',unlockAudio,{once:true});
document.addEventListener('keydown',unlockAudio,{once:true});
function clearInput(resetHeld=false){if(resetHeld)pressed.clear();queuedDash=false;ui?.clearInput();game?.clearInput?.();}
function syncSpawnBounds(forceGameplay=false){if(!view||!game)return;const bounds=view.getSpawnBounds?.(game.state.player,forceGameplay);if(bounds)game.setSpawnBounds?.(bounds);}
function newGame(menu=false){
  const heroId=career.state.selectedHero,seed=menu?4701:Math.floor(Math.random()*0x100000000),runId=menu?`preview-${heroId}-${career.heroLevel(heroId)}`:`expedition-${Date.now().toString(36)}-${crypto.randomUUID?.()||Math.random().toString(36).slice(2)}`;
  return (menu?createGame:createSoloExpedition)({seed,heroId,heroLevel:career.heroLevel(heroId),bonuses:career.heroBonuses(heroId),runId});
}
function updateUI(){ui?.update(game.state,settlement);onlineUI?.update(game.state);}
function settleIfEnded(){if(!game||currentUID||game.online||!['won','lost'].includes(game.state.phase)||lastSettled===game.state.runId)return;const result=career.settleRun(game.state);if(result.ok){lastSettled=game.state.runId;settlement=result;}else ui.showToast(result.error||'Le butin n’a pas pu être récupéré.');updateUI();}
function rebuildCamp(){clearInput();settlement=null;resumeAfterModal=false;game=newGame(true);updateUI();if(pendingGuestLogin){pendingGuestLogin=false;syncAccount(account?.user);}}
function handleMutation(result,message){if(!result?.ok){ui?.showToast(result?.error||'Cette action est indisponible.');return result;}if(result.saved===false)ui?.showToast('Progression en mémoire : exporte une copie dans les paramètres.');else if(message)ui?.showToast(message);return result;}
const isCurrentSession=(uid,generation)=>uid===currentUID&&uid===(account?.user?.uid||null)&&generation===authGeneration;
function applyProfile(result,uid,generation){
  if(!uid||!isCurrentSession(uid,generation)||!result?.profile||!Number.isSafeInteger(result.revision)||result.revision<profileRevision)return false;
  career.loadProfile(result.profile);
  profileRevision=result.revision;
  updateUI();
  return true;
}
async function mutate(type,local,data={}){
  if(game.state.phase!=='menu'||multiplayer?.room)return handleMutation({ok:false,error:'Reviens au camp et quitte le groupe pour modifier ta carrière.'});
  const uid=currentUID,generation=authGeneration;
  try{
    if(!isCurrentSession(uid,generation))throw new Error('Le compte a changé.');
    if(!uid)return handleMutation(local());
    if(!profileReady)throw new Error('La carrière se synchronise encore.');
    const result=await account.request('api/action',{id:crypto.randomUUID(),type,...data},uid);
    if(!isCurrentSession(uid,generation))return{ok:false,error:'Le compte a changé.'};
    applyProfile(result,uid,generation);
    return handleMutation(result);
  }catch(error){return handleMutation({ok:false,error:error.message});}
}
async function syncAccount(user){
  const uid=user?.uid||null;
  if(!currentUID&&uid&&game.state.phase!=='menu'){pendingGuestLogin=true;return;}
  pendingGuestLogin=false;
  onlineUI?.setAccountReady();
  if(uid===currentUID&&profileReady)return;
  const changed=uid!==currentUID,generation=++authGeneration;
  profileReady=false;
  if(changed){
    multiplayer?.close();
    multiplayer=null;
    currentUID=uid;
    profileRevision=-1;
    resumeAfterModal=false;
    ui.resetCareerPanels();
    onlineUI?.setRoom(null);
    if(uid)career.loadProfile();
    else career.reload();
    rebuildCamp();
  }
  if(!user){profileReady=true;onlineUI?.setStatus('Progression sur cet appareil.');updateUI();return;}
  onlineUI?.setStatus('Synchronisation de ta carrière…');
  try{
    const result=await account.request('api/profile',undefined,uid);
    if(!isCurrentSession(uid,generation))return;
    if(!applyProfile(result,uid,generation))throw new Error('La carrière n’a pas pu être synchronisée.');
    profileReady=true;
    rebuildCamp();
    onlineUI?.setStatus('Carrière synchronisée avec ton compte.');
    onlineUI?.setAccountReady();
    onlineUI?.connected();
    multiplayer?.close();
    multiplayer=createMultiplayer({account,
      onLobby:room=>onlineUI?.setRoom(room),
      onGame:next=>{clearInput();game=next;settlement=null;onlineUI?.close();updateUI();soundscape.play('start');},
      onSettled:result=>{if(applyProfile(result,uid,generation)){settlement=result;lastSettled=game.state.runId;updateUI();}},
      onStatus:message=>{onlineUI?.setStatus(message);if(!['Connecté','Reconnexion au groupe…'].includes(message))ui.showToast(message);},
      onLeft:()=>{if(game.online)rebuildCamp();account.request('api/profile',undefined,uid).then(result=>applyProfile(result,uid,generation)).catch(()=>{});}
    });
    multiplayer.connect();
  }catch(error){if(isCurrentSession(uid,generation)){onlineUI?.setStatus(error.message);ui.showToast(error.message);}}
}
async function bootAccounts(){try{account=await createAccount({onChange:user=>{if(account)syncAccount(user);},onStatus:message=>onlineUI?.setStatus(message)});onlineUI?.setAccountReady();if(account.loaded)syncAccount(account.user);}catch(error){onlineUI?.setStatus(error.message);}}
try{
  game=newGame(true);
  ui=createUI({progression:career,isOnlineAccount:()=>Boolean(account?.user),reducedMotion,soundEnabled:sound,audioMix:mix,getSaveStatus:()=>account?.user?(profileReady?'Carrière synchronisée avec ton compte':'Connexion à ta carrière…'):'Progression sur cet appareil · connexion disponible',
    onStart:async()=>{unlockAudio();clearInput();if(!isCurrentSession(currentUID,authGeneration))return;if(currentUID){if(!profileReady||!multiplayer){ui.showToast('Patiente pendant la synchronisation de ta carrière.');return;}if(multiplayer.room){onlineUI.openLobby();return;}await multiplayer.create(1);return;}settlement=null;resumeAfterModal=false;game=newGame();syncSpawnBounds(true);game.start();updateUI();soundscape.play('start');},
    onPause:()=>{clearInput();game.pause();updateUI();},
    onResume:()=>{clearInput();game.resume();updateUI();},
    onExtract:()=>{clearInput();game.extract();settleIfEnded();updateUI();},
    onCamp:()=>{if(game.online)multiplayer?.leave();rebuildCamp();},
    onUpgrade:id=>{clearInput();if(game.chooseUpgrade(id)){soundscape.play('upgrade');updateUI();}},
    onReroll:()=>{if(game.reroll()){soundscape.play('reroll');updateUI();}},
    onSelectHero:async id=>{const result=await mutate('select',()=>career.selectHero(id),{heroId:id});if(result.ok){rebuildCamp();soundscape.play('select');}return result;},
    onTrainHero:async id=>{const result=await mutate('train',()=>career.upgradeHero(id),{heroId:id,stat:'power'});if(result.ok){rebuildCamp();soundscape.play('train');}return result;},
    onTrainStat:async(id,statKey)=>{const result=await mutate('train',()=>career.upgradeStat(id,statKey),{heroId:id,stat:statKey});if(result.ok){rebuildCamp();soundscape.play('train');}return result;},
    onRecruitHero:async id=>{const result=await mutate('recruit',()=>career.recruitHero(id),{heroId:id});if(result.ok)updateUI();return result;},
    onSummon:async count=>{const result=await mutate('summon',()=>career.summon(count),{count});if(result.ok){soundscape.play('summon');updateUI();}return result;},
    onReveal:rarity=>soundscape.play('reveal',rarity),
    onUIClick:()=>soundscape.play('select'),
    onSoundToggle:enabled=>{sound=enabled;try{localStorage.setItem(SOUND_KEY,String(sound));}catch{}if(!soundscape.setEnabled(enabled)&&enabled){sound=false;ui.showToast('Le son est indisponible dans ce navigateur.');}if(sound){soundscape.primeMusic();soundscape.play('enable');}return sound;},
    onVolumeChange:(channel,volume)=>{
      mix[channel]=volume;
      try{localStorage.setItem(MIX_KEY,JSON.stringify(mix));}catch{}
      soundscape.setVolume(channel,volume/100);
      if(channel==='music'&&volume>0)soundscape.primeMusic();
    },
    onComfortToggle:enabled=>{reducedMotion=Boolean(enabled);try{localStorage.setItem(COMFORT_KEY,String(reducedMotion));}catch{}view?.setReducedMotion?.(reducedMotion);},
    onImportSave:json=>{if(currentUID||account?.user)return{ok:false,error:'L’import de sauvegardes est réservé au mode invité.'};if(game.state.phase!=='menu')return{ok:false,error:'Reviens au camp pour importer.'};const result=career.importSave(json);handleMutation(result);if(result.ok)rebuildCamp();return result;},
    onModalOpen:()=>{clearInput();if(!game.online&&game.state.phase==='playing'){resumeAfterModal=true;game.pause();updateUI();}},
    onModalClose:()=>{clearInput();if(resumeAfterModal&&game.state.phase==='paused')game.resume();resumeAfterModal=false;updateUI();}
  });
  onlineUI=createOnlineUI({getAccount:()=>account,getRoom:()=>multiplayer?.room,
    onOpen:clearInput,onClose:clearInput,
    onGoogle:()=>account?.google(),onPassword:(...args)=>account?.password(...args),onReset:email=>account?.reset(email),
    onLogout:async()=>{if(multiplayer?.room)throw new Error('Quitte le groupe avant de te déconnecter.');await account.logout();},
    onCreate:async()=>{if(!profileReady||!multiplayer)throw new Error('La carrière se synchronise encore.');await multiplayer.create(4);},
    onJoin:async code=>{if(!profileReady||!multiplayer)throw new Error('La carrière se synchronise encore.');await multiplayer.join(code);},
    onReady:ready=>multiplayer?.ready(ready),onStart:()=>multiplayer?.start(),onLeave:()=>multiplayer?.leave(),
    onRetry:async()=>{profileReady=false;if(account)await syncAccount(account.user);else await bootAccounts();}
  });
  view=createRenderer(document.getElementById('scene'));
  directions=createDirections();
  view.setReducedMotion?.(reducedMotion);
  document.documentElement.dataset.renderMode=view.mode;
  view.renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();clearInput();game.pause();updateUI();ui.showToast('Affichage interrompu : ton expédition est en pause.');});
  view.renderer.domElement.addEventListener('webglcontextrestored',()=>ui.showToast('Affichage rétabli. Tu peux reprendre.'));
  updateUI();bootAccounts();
}catch(error){console.error(error);if(ui)ui.showError('L’arène n’a pas pu être chargée. Recharge la page pour réessayer.');else{const p=document.createElement('p');p.className='fatal-error';p.textContent='Le jeu n’a pas pu démarrer. Recharge la page.';document.body.append(p);}}
window.addEventListener('keydown',event=>{
  if(!game||!ui||event.target?.matches?.('input,textarea,select'))return;
  if(Object.values(controls).some(keys=>keys.includes(event.code))){pressed.add(event.code);if(game.state.phase!=='menu')event.preventDefault();return;}
  if(ui.isBlocking()||onlineUI?.isBlocking())return;
  if(event.code==='Escape'||event.code==='KeyP'){if(event.repeat)return;event.preventDefault();clearInput();if(game.state.phase==='playing')game.pause();else if(game.state.phase==='paused')game.resume();updateUI();return;}
  if(game.state.phase!=='playing')return;if(gameplayKeys.has(event.code))event.preventDefault();pressed.add(event.code);if((event.code==='Space'||event.code==='ShiftLeft')&&!event.repeat)queuedDash=true;
});
window.addEventListener('keyup',event=>pressed.delete(event.code));
const suspend=()=>{clearInput(true);soundscape.setActive(false);if(!game?.online&&game?.state.phase==='playing'){game.pause();updateUI();}};
window.addEventListener('blur',suspend);window.addEventListener('focus',()=>soundscape.setActive(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else soundscape.setActive(true);});
let previous=performance.now(),accumulator=0,uiTime=0,frames=0,lastPhase='';
function tick(now){
  requestAnimationFrame(tick);if(!game||!ui||!view)return;const dt=Math.max(0,Math.min(.2,(now-previous)/1000));previous=now;
  const touch=ui.getInput();let x=touch.x+(has(controls.right)?1:0)-(has(controls.left)?1:0),z=touch.z+(has(controls.down)?1:0)-(has(controls.up)?1:0);const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}const touchDash=ui.consumeDash();let dash=queuedDash||touchDash;queuedDash=false;
  if(game.state.phase==='playing'&&!ui.isBlocking()&&!onlineUI?.isBlocking()){syncSpawnBounds(lastPhase!=='playing');accumulator+=dt*GAME_SPEED;let steps=0;while(accumulator>=1/60&&steps<12&&game.state.phase==='playing'){game.step(1/60,{x,z,dash});dash=false;accumulator-=1/60;steps++;}if(dash)queuedDash=true;}else{accumulator=0;clearInput();}
  game.advance?.(dt,accumulator*60);
  settleIfEnded();soundscape.update(game.state);
  if(lastPhase!==game.state.phase){if(game.state.phase!=='playing')clearInput();updateUI();lastPhase=game.state.phase;}
  uiTime+=dt;if(uiTime>=.1){uiTime=0;updateUI();}view.render(game.state,now/1000*GAME_SPEED);directions?.update(game.state,view.projectWorld,{blocked:ui.isBlocking()||onlineUI?.isBlocking()});frames++;
}
requestAnimationFrame(tick);
window.survivorDebug={snapshot:()=>({...game.snapshot(),renderMode:view.mode,frames,profile:{hero:career.state.selectedHero,owned:Object.keys(career.state.owned).length,coins:career.state.coins,shards:career.state.shards}}),get game(){return game;},get view(){return view;}};
