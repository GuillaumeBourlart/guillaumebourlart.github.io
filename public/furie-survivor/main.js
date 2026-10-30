import {createGame} from './game/simulation.js';
import {createProgression} from './game/progression.js';
import {createRenderer} from './render.js';
import {createUI} from './ui.js';
import {createSoundscape} from './audio.js';

const career=createProgression(),pressed=new Set(),soundscape=createSoundscape();
const COMFORT_KEY='furie-survivors-comfort-v1',SOUND_KEY='furie-survivors-sound-v1';
function initialSound(){try{return localStorage.getItem(SOUND_KEY)!=='false';}catch{return true;}}
function initialComfort(){try{const stored=localStorage.getItem(COMFORT_KEY);if(stored!==null)return stored==='true';}catch{}return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;}
let reducedMotion=initialComfort();
let game,view,ui,queuedDash=false,sound=initialSound(),lastSettled='',settlement=null,resumeAfterModal=false;
const controls={up:['KeyW','KeyZ','ArrowUp'],down:['KeyS','ArrowDown'],left:['KeyA','KeyQ','ArrowLeft'],right:['KeyD','ArrowRight']};
const gameplayKeys=new Set([...Object.values(controls).flat(),'Space','ShiftLeft']);
const has=keys=>keys.some(key=>pressed.has(key));
function unlockAudio(){if(sound&&!soundscape.setEnabled(true)){sound=false;ui?.setSoundEnabled(false);}}
document.addEventListener('pointerdown',unlockAudio,{once:true});
document.addEventListener('keydown',unlockAudio,{once:true});
function clearInput(){pressed.clear();queuedDash=false;ui?.clearInput();}
function syncSpawnBounds(forceGameplay=false){if(!view||!game)return;const bounds=view.getSpawnBounds?.(game.state.player,forceGameplay);if(bounds)game.setSpawnBounds?.(bounds);}
function newGame(menu=false){
  const heroId=career.state.selectedHero,seed=menu?4701:Math.floor(Math.random()*0x100000000),runId=menu?`preview-${heroId}-${career.heroLevel(heroId)}`:`expedition-${Date.now().toString(36)}-${crypto.randomUUID?.()||Math.random().toString(36).slice(2)}`;
  return createGame({seed,heroId,heroLevel:career.heroLevel(heroId),bonuses:career.heroBonuses(heroId),runId});
}
function updateUI(){ui?.update(game.state,settlement);}
function settleIfEnded(){if(!game||!['won','lost'].includes(game.state.phase)||lastSettled===game.state.runId)return;const result=career.settleRun(game.state);if(result.ok){lastSettled=game.state.runId;settlement=result;}else ui.showToast(result.error||'Le butin n’a pas pu être récupéré.');updateUI();}
function rebuildCamp(){clearInput();settlement=null;resumeAfterModal=false;game=newGame(true);updateUI();}
function handleMutation(result,message){if(!result?.ok){ui?.showToast(result?.error||'Cette action est indisponible.');return result;}if(result.saved===false)ui?.showToast('Progression en mémoire : exporte une copie dans les paramètres.');else if(message)ui?.showToast(message);return result;}
try{
  game=newGame(true);
  ui=createUI({progression:career,reducedMotion,soundEnabled:sound,
    onStart:()=>{unlockAudio();clearInput();settlement=null;resumeAfterModal=false;game=newGame();syncSpawnBounds(true);game.start();updateUI();soundscape.play('start');},
    onPause:()=>{clearInput();game.pause();updateUI();},
    onResume:()=>{clearInput();game.resume();updateUI();},
    onExtract:()=>{clearInput();game.extract();settleIfEnded();updateUI();},
    onCamp:rebuildCamp,
    onUpgrade:id=>{clearInput();if(game.chooseUpgrade(id)){soundscape.play('upgrade');updateUI();}},
    onReroll:()=>{if(game.reroll()){soundscape.play('reroll');updateUI();}},
    onSelectHero:id=>{if(game.state.phase!=='menu')return{ok:false,error:'Reviens au camp pour changer de héros.'};const result=handleMutation(career.selectHero(id));if(result.ok){rebuildCamp();soundscape.play('select');}return result;},
    onTrainHero:id=>{if(game.state.phase!=='menu')return{ok:false,error:'Reviens au camp pour améliorer un héros.'};const result=handleMutation(career.upgradeHero(id));if(result.ok){rebuildCamp();soundscape.play('train');}return result;},
    onTrainStat:(id,statKey)=>{if(game.state.phase!=='menu')return{ok:false,error:'Reviens au camp pour améliorer un héros.'};const result=handleMutation(career.upgradeStat(id,statKey));if(result.ok){rebuildCamp();soundscape.play('train');}return result;},
    onRecruitHero:id=>{if(game.state.phase!=='menu')return{ok:false,error:'Reviens au camp pour recruter.'};const result=handleMutation(career.recruitHero(id));if(result.ok)updateUI();return result;},
    onSummon:count=>{if(game.state.phase!=='menu')return{ok:false,error:'Reviens au camp pour invoquer.'};const result=handleMutation(career.summon(count));if(result.ok){soundscape.play('summon');updateUI();}return result;},
    onReveal:rarity=>soundscape.play('reveal',rarity),
    onUIClick:()=>soundscape.play('select'),
    onSoundToggle:enabled=>{sound=enabled;try{localStorage.setItem(SOUND_KEY,String(sound));}catch{}if(!soundscape.setEnabled(enabled)&&enabled){sound=false;ui.showToast('Le son est indisponible dans ce navigateur.');}if(sound)soundscape.play('enable');return sound;},
    onComfortToggle:enabled=>{reducedMotion=Boolean(enabled);try{localStorage.setItem(COMFORT_KEY,String(reducedMotion));}catch{}view?.setReducedMotion?.(reducedMotion);},
    onImportSave:json=>{if(game.state.phase!=='menu')return{ok:false,error:'Reviens au camp pour importer ta progression.'};const result=handleMutation(career.importSave(json));if(result.ok)rebuildCamp();return result;},
    onModalOpen:()=>{clearInput();if(game.state.phase==='playing'){resumeAfterModal=true;game.pause();updateUI();}},
    onModalClose:()=>{clearInput();if(resumeAfterModal&&game.state.phase==='paused')game.resume();resumeAfterModal=false;updateUI();}
  });
  view=createRenderer(document.getElementById('scene'));
  view.setReducedMotion?.(reducedMotion);
  document.documentElement.dataset.renderMode=view.mode;
  view.renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();clearInput();game.pause();updateUI();ui.showToast('Affichage interrompu : ton expédition est en pause.');});
  view.renderer.domElement.addEventListener('webglcontextrestored',()=>ui.showToast('Affichage rétabli. Tu peux reprendre.'));
  updateUI();
}catch(error){console.error(error);if(ui)ui.showError('L’arène n’a pas pu être chargée. Recharge la page pour réessayer.');else{const p=document.createElement('p');p.className='fatal-error';p.textContent='Le jeu n’a pas pu démarrer. Recharge la page.';document.body.append(p);}}
window.addEventListener('keydown',event=>{
  if(!game||!ui||event.target?.matches?.('input,textarea,select')||ui.isBlocking())return;
  if(event.code==='Escape'||event.code==='KeyP'){if(event.repeat)return;event.preventDefault();clearInput();if(game.state.phase==='playing')game.pause();else if(game.state.phase==='paused')game.resume();updateUI();return;}
  if(game.state.phase!=='playing')return;if(gameplayKeys.has(event.code))event.preventDefault();pressed.add(event.code);if((event.code==='Space'||event.code==='ShiftLeft')&&!event.repeat)queuedDash=true;
});
window.addEventListener('keyup',event=>pressed.delete(event.code));
const suspend=()=>{clearInput();soundscape.setActive(false);if(game?.state.phase==='playing'){game.pause();updateUI();}};
window.addEventListener('blur',suspend);window.addEventListener('focus',()=>soundscape.setActive(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else soundscape.setActive(true);});
let previous=performance.now(),accumulator=0,uiTime=0,frames=0,lastPhase='';
function tick(now){
  requestAnimationFrame(tick);if(!game||!ui||!view)return;const dt=Math.max(0,Math.min(.2,(now-previous)/1000));previous=now;
  const touch=ui.getInput();let x=touch.x+(has(controls.right)?1:0)-(has(controls.left)?1:0),z=touch.z+(has(controls.down)?1:0)-(has(controls.up)?1:0);const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}const touchDash=ui.consumeDash();let dash=queuedDash||touchDash;queuedDash=false;
  if(game.state.phase==='playing'&&!ui.isBlocking()){syncSpawnBounds(lastPhase!=='playing');accumulator+=dt;let steps=0;while(accumulator>=1/60&&steps<12&&game.state.phase==='playing'){game.step(1/60,{x,z,dash});dash=false;accumulator-=1/60;steps++;}if(dash)queuedDash=true;}else{accumulator=0;clearInput();}
  settleIfEnded();soundscape.update(game.state);
  if(lastPhase!==game.state.phase){if(game.state.phase!=='playing')clearInput();updateUI();lastPhase=game.state.phase;}
  uiTime+=dt;if(uiTime>=.1){uiTime=0;updateUI();}view.render(game.state,now/1000);frames++;
}
requestAnimationFrame(tick);
window.survivorDebug={snapshot:()=>({...game.snapshot(),renderMode:view.mode,frames,profile:{hero:career.state.selectedHero,owned:Object.keys(career.state.owned).length,coins:career.state.coins,shards:career.state.shards}}),get game(){return game;},get view(){return view;}};
