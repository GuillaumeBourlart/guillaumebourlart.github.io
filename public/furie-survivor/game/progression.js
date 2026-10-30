import {HEROES,HERO_BY_ID,RARITIES,STARTER_IDS,SUMMON_COST,MAX_HERO_LEVEL,MAX_STAT_POINTS} from './catalog.js';
import {STAT_KEYS,emptyStatPoints,normalizeStatPoints,legacyStatPoints,heroLevelFromStats,getTrainingBonuses,getHeroCombatStats} from './hero-stats.js';

export const SAVE_KEY = 'furie-survivors-save-v2';
export const SAVE_VERSION = 2;
const MAX_CURRENCY = 1_000_000_000;
const MAX_COUNTER = 1_000_000_000;
const MAX_RUN_SECONDS = 86_400;
const KNOWN_RARITIES = Object.keys(RARITIES);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (object,key) => isObject(object) && Object.hasOwn(object,key);
const validHero = id => typeof id === 'string' && Object.hasOwn(HERO_BY_ID,id);
const number = (value,fallback=0,max=MAX_COUNTER) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0,Math.min(max,value)) : fallback;
const integer = (value,fallback=0,max=MAX_COUNTER) => Math.floor(number(value,fallback,max));
const idString = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_:.-]{0,159}$/.test(value);
const metric = (result,primary,alias,max=MAX_COUNTER) => number(result?.[primary] ?? result?.[alias],0,max);

function discoveryCount(value) {
  if (Array.isArray(value)) return Math.min(10_000,value.length);
  return integer(value,0,10_000);
}

function runMetrics(result={}) {
  return {
    seconds:metric(result,'t','seconds',MAX_RUN_SECONDS),
    kills:integer(result?.kills,0,1_000_000),
    bosses:integer(result?.bossesDefeated ?? result?.bosses,0,10_000),
    discoveries:discoveryCount(result?.discovered ?? result?.discoveries),
    chests:integer(result?.chestsOpened ?? result?.chests,0,10_000),
    wave:Math.max(1,integer(result?.wave ?? result?.stage,1,10_000))
  };
}

export function calculateRunRewards(result={}) {
  const {seconds,kills,bosses,discoveries,chests} = runMetrics(result);
  const survivalBonus=18*Math.pow(seconds/60,1.35),coinMultiplier=Math.max(1,Math.min(2,Number(result?.coinMultiplier??result?.stats?.coinMultiplier)||1));
  return {
    coins:Math.floor((kills*1.45 + seconds*.75 + survivalBonus + bosses*180 + discoveries*35 + chests*25)*coinMultiplier),
    shards:Math.floor(seconds/30)*4 + bosses*20 + discoveries*2 + chests
  };
}

const ACHIEVEMENTS = Object.freeze([
  {id:'first_expedition',title:'Premier retour',description:'Terminer une première expédition.',target:1,stat:'runs',reward:{coins:100,shards:50}},
  {id:'hundred_monsters',title:'La horde recule',description:'Éliminer 100 monstres au total.',target:100,stat:'totalKills',reward:{coins:200,shards:50}},
  {id:'three_minutes',title:'Toujours debout',description:'Survivre au moins 3 minutes dans une expédition.',target:180,stat:'bestTime',reward:{coins:200,shards:100}},
  {id:'first_boss',title:'Tombeur de colosse',description:'Vaincre un premier boss.',target:1,stat:'totalBosses',reward:{coins:250,shards:100}},
  {id:'ten_discoveries',title:'Le goût de l’inconnu',description:'Découvrir 10 lieux au total.',target:10,stat:'discoveries',reward:{coins:200,shards:100}},
  {id:'eight_heroes',title:'Une belle compagnie',description:'Posséder 8 héros différents.',target:8,stat:'collection',reward:{coins:300,shards:150}},
  {id:'six_minutes',title:'La route s’allonge',description:'Survivre 6 minutes dans une expédition.',target:360,stat:'bestTime',reward:{coins:500,shards:100}},
  {id:'ten_minutes',title:'Au-delà de l’horizon',description:'Survivre 10 minutes dans une expédition.',target:600,stat:'bestTime',reward:{coins:800,shards:150}},
  {id:'fifteen_minutes',title:'Légende des terres',description:'Survivre 15 minutes dans une expédition.',target:900,stat:'bestTime',reward:{coins:1200,shards:200}},
  {id:'ten_bosses',title:'Briseur de failles',description:'Vaincre 10 gardiens de faille au total.',target:10,stat:'totalBosses',reward:{coins:800,shards:150}},
  {id:'fifty_discoveries',title:'Cartographe d’Azur',description:'Découvrir 50 lieux au total.',target:50,stat:'discoveries',reward:{coins:500,shards:100}},
  {id:'sixteen_heroes',title:'Une grande compagnie',description:'Posséder 16 héros différents.',target:16,stat:'collection',reward:{coins:500,shards:150}},
  {id:'complete_collection',title:'Tous autour du feu',description:`Réunir les ${HEROES.length} héros de la collection.`,target:HEROES.length,stat:'collection',reward:{coins:1000,shards:200}},
  {id:'trained_hero',title:'Un héros confirmé',description:'Améliorer un héros jusqu’au niveau 10.',target:10,stat:'heroLevel',reward:{coins:350,shards:50}},
  {id:'master_hero',title:'Maîtrise accomplie',description:`Améliorer un héros jusqu’au niveau ${MAX_HERO_LEVEL}.`,target:MAX_HERO_LEVEL,stat:'heroLevel',reward:{coins:1000,shards:100}}
]);
const ACHIEVEMENT_IDS = new Set(ACHIEVEMENTS.map(entry=>entry.id));

function freshState() {
  return {
    version:SAVE_VERSION,coins:500,shards:300,essence:0,selectedHero:'lyra',
    owned:Object.fromEntries(STARTER_IDS.map(id=>[id,{level:1,copies:1,statPoints:emptyStatPoints()}])),
    pity:0,summonCount:0,
    stats:{runs:0,totalKills:0,totalBosses:0,bestTime:0,bestWave:0,discoveries:0,coinsEarned:0},
    achievements:[],settledRuns:[]
  };
}

function sanitizedState(source) {
  if (!isObject(source) || source.version !== SAVE_VERSION) throw new Error('Cette sauvegarde utilise un format incompatible.');
  const state = freshState();
  for (const key of ['coins','shards','essence']) state[key]=integer(source[key],state[key],MAX_CURRENCY);
  state.owned={};
  for (const hero of HEROES) {
    if (!own(source.owned,hero.id) || !isObject(source.owned[hero.id])) {
      if(STARTER_IDS.includes(hero.id)) state.owned[hero.id]={level:1,copies:1,statPoints:emptyStatPoints()};
      continue;
    }
    const entry=source.owned[hero.id];
    const statPoints=own(entry,'statPoints')?normalizeStatPoints(entry.statPoints):legacyStatPoints(integer(entry.level,1,20));
    state.owned[hero.id]={level:heroLevelFromStats(statPoints),copies:Math.max(1,integer(entry.copies,1,MAX_COUNTER)),statPoints};
  }
  state.selectedHero=validHero(source.selectedHero) && own(state.owned,source.selectedHero) ? source.selectedHero : 'lyra';
  state.pity=integer(source.pity,0,9);
  state.summonCount=integer(source.summonCount);
  const stats=isObject(source.stats)?source.stats:{};
  for (const key of Object.keys(state.stats)) state.stats[key]=number(stats[key],0,key==='bestTime'?MAX_RUN_SECONDS:MAX_COUNTER);
  for (const key of Object.keys(state.stats)) if(key!=='bestTime') state.stats[key]=Math.floor(state.stats[key]);
  state.achievements=Array.isArray(source.achievements)?[...new Set(source.achievements.filter(id=>ACHIEVEMENT_IDS.has(id)))]:[];
  state.settledRuns=Array.isArray(source.settledRuns)?[...new Set(source.settledRuns.filter(idString))]:[];
  return state;
}

function safeStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

export function createProgression({storage=undefined,rng=Math.random}={}) {
  const store=storage===undefined?safeStorage():storage;
  const random=typeof rng==='function'?rng:Math.random;
  let state=freshState();
  let storageAvailable=Boolean(store && typeof store.getItem==='function' && typeof store.setItem==='function');
  let lastError='';
  let hadSavedData=false;
  if (storageAvailable) {
    try {
      const raw=store.getItem(SAVE_KEY);
      hadSavedData=Boolean(raw);
      if(raw) state=sanitizedState(JSON.parse(raw));
    } catch {
      lastError='La sauvegarde existante n’a pas pu être lue. Une nouvelle carrière est disponible.';
    }
  }

  function save() {
    if (!store || typeof store.setItem!=='function') {
      storageAvailable=false;
      lastError='Le stockage local est indisponible. Exporte ta sauvegarde pour la conserver.';
      return false;
    }
    try {
      store.setItem(SAVE_KEY,JSON.stringify(state));
      storageAvailable=true;
      lastError='';
      return true;
    } catch {
      storageAvailable=false;
      lastError='La sauvegarde locale a échoué. Exporte ta carrière pour la conserver.';
      return false;
    }
  }

  function randomUnit() {
    const value=random();
    return typeof value==='number' && Number.isFinite(value)?Math.max(0,Math.min(1-Number.EPSILON,value)):.5;
  }

  function addCurrency(key,value) {
    state[key]=Math.min(MAX_CURRENCY,state[key]+integer(value,0,MAX_CURRENCY));
  }

  function milestoneProgress(entry) {
    if(entry.stat==='collection')return Object.keys(state.owned).length;
    if(entry.stat==='heroLevel')return Math.max(1,...Object.values(state.owned).map(hero=>heroLevelFromStats(hero.statPoints)));
    return state.stats[entry.stat]||0;
  }

  function getAchievements() {
    return ACHIEVEMENTS.map(entry=>({
      id:entry.id,title:entry.title,description:entry.description,
      progress:Math.min(entry.target,milestoneProgress(entry)),target:entry.target,
      claimed:state.achievements.includes(entry.id),reward:{...entry.reward}
    }));
  }

  function grantMilestones() {
    const granted=[];
    for (const entry of ACHIEVEMENTS) {
      if(state.achievements.includes(entry.id) || milestoneProgress(entry)<entry.target) continue;
      state.achievements.push(entry.id);
      addCurrency('coins',entry.reward.coins);
      addCurrency('shards',entry.reward.shards);
      granted.push({id:entry.id,title:entry.title,description:entry.description,reward:{...entry.reward}});
    }
    return granted;
  }

  function heroStatPoints(id){return validHero(id)&&own(state.owned,id)?normalizeStatPoints(state.owned[id].statPoints):emptyStatPoints();}
  function heroLevel(id) { return validHero(id)&&own(state.owned,id)?heroLevelFromStats(state.owned[id].statPoints):0; }
  function heroBonuses(id) {
    return getTrainingBonuses(heroStatPoints(id));
  }
  function heroStats(id){return getHeroCombatStats(id,heroStatPoints(id));}
  function upgradeCost(id,statKey) {
    const level=heroLevel(id);
    if(level===0 || level>=MAX_HERO_LEVEL || statKey&&(!STAT_KEYS.includes(statKey)||heroStatPoints(id)[statKey]>=MAX_STAT_POINTS)) return 0;
    const extra=level-1;
    return 70+24*extra+4*extra*extra;
  }
  function recruitCost(id) { return validHero(id)?RARITIES[HERO_BY_ID[id].rarity].recruitCost:0; }

  function selectHero(id) {
    if(!validHero(id) || !own(state.owned,id)) return {ok:false,error:'Ce héros n’est pas encore dans ta collection.'};
    state.selectedHero=id;
    const saved=save();
    return {ok:true,heroId:id,saved};
  }

  function upgradeStat(id,statKey) {
    const level=heroLevel(id);
    if(!level) return {ok:false,error:'Invoque ce héros avant de l’améliorer.'};
    if(level>=MAX_HERO_LEVEL) return {ok:false,error:'Ce héros a atteint le niveau maximum.'};
    if(!STAT_KEYS.includes(statKey)) return {ok:false,error:'Cette caractéristique est inconnue.'};
    const points=state.owned[id].statPoints=normalizeStatPoints(state.owned[id].statPoints);
    if(points[statKey]>=MAX_STAT_POINTS)return{ok:false,error:'Cette caractéristique a atteint son maximum.'};
    const cost=upgradeCost(id,statKey);
    if(state.coins<cost) return {ok:false,error:'Il te manque des pièces pour cette amélioration.',cost};
    state.coins-=cost;
    points[statKey]++;
    state.owned[id].level=heroLevelFromStats(points);
    const milestones=grantMilestones();
    const saved=save();
    return {ok:true,heroId:id,statKey,points:points[statKey],level:state.owned[id].level,cost,bonuses:heroBonuses(id),milestones,saved};
  }
  // Compatibility for older callers: improve the least-trained characteristic.
  function upgradeHero(id){const points=heroStatPoints(id),statKey=STAT_KEYS.reduce((best,key)=>points[key]<points[best]?key:best,STAT_KEYS[0]);return upgradeStat(id,statKey);}

  function chooseHero(guaranteed) {
    const pool=guaranteed?HEROES.filter(hero=>!own(state.owned,hero.id)):HEROES;
    const active=KNOWN_RARITIES.filter(rarity=>pool.some(hero=>hero.rarity===rarity));
    const total=active.reduce((sum,rarity)=>sum+RARITIES[rarity].weight,0);
    let ticket=randomUnit()*total;
    let selectedRarity=active[active.length-1];
    for(const rarity of active) {
      ticket-=RARITIES[rarity].weight;
      if(ticket<0) {selectedRarity=rarity;break;}
    }
    const choices=pool.filter(hero=>hero.rarity===selectedRarity);
    return choices[Math.floor(randomUnit()*choices.length)];
  }

  function summon(count=1) {
    if(![1,5,10].includes(count)) return {ok:false,error:'Choisis une invocation, cinq ou dix.'};
    const cost=SUMMON_COST*count;
    if(state.shards<cost) return {ok:false,error:'Il te manque des éclats d’invocation.',cost};
    state.shards-=cost;
    const results=[];
    for(let index=0;index<count;index++) {
      const missing=Object.keys(state.owned).length<HEROES.length;
      const guaranteed=missing&&(state.summonCount===0||state.pity>=9);
      const hero=chooseHero(guaranteed);
      const isNew=!own(state.owned,hero.id);
      let essence=0;
      if(isNew) {
        state.owned[hero.id]={level:1,copies:1,statPoints:emptyStatPoints()};
        state.pity=0;
      } else {
        state.owned[hero.id].copies=Math.min(MAX_COUNTER,state.owned[hero.id].copies+1);
        essence=RARITIES[hero.rarity].essence;
        addCurrency('essence',essence);
        state.pity=Math.min(9,state.pity+1);
      }
      state.summonCount=Math.min(MAX_COUNTER,state.summonCount+1);
      results.push({heroId:hero.id,isNew,essence,guaranteed});
    }
    const milestones=grantMilestones();
    const saved=save();
    return {ok:true,results,cost,milestones,saved};
  }

  function recruitHero(id) {
    if(!validHero(id)) return {ok:false,error:'Ce héros est introuvable.'};
    if(own(state.owned,id)) return {ok:false,error:'Ce héros est déjà dans ta collection.'};
    const cost=recruitCost(id);
    if(state.essence<cost) return {ok:false,error:'Il te manque des essences pour ce recrutement.',cost};
    state.essence-=cost;
    state.owned[id]={level:1,copies:1,statPoints:emptyStatPoints()};
    const milestones=grantMilestones();
    const saved=save();
    return {ok:true,heroId:id,cost,milestones,saved};
  }

  function settleRun(result) {
    if(!isObject(result)||!idString(result.runId)) return {ok:false,error:'Cette expédition ne possède pas d’identifiant valide.'};
    if(state.settledRuns.includes(result.runId)) return {ok:true,alreadySettled:true,rewards:{coins:0,shards:0},milestones:[]};
    if(!['death','extracted'].includes(result.outcome)) return {ok:false,error:'Termine l’expédition avant de récupérer ses récompenses.'};
    if(!validHero(result.heroId)||!own(state.owned,result.heroId)) return {ok:false,error:'Le héros de cette expédition est introuvable.'};
    const metrics=runMetrics(result);
    const rewards=calculateRunRewards(result);
    state.settledRuns.push(result.runId);
    addCurrency('coins',rewards.coins);
    addCurrency('shards',rewards.shards);
    // A start/return click without playing must not unlock the first-run milestone.
    // Real loot is still kept, and the run ID is settled even for a short outing.
    if(metrics.seconds>=10||metrics.kills>=1) state.stats.runs=Math.min(MAX_COUNTER,state.stats.runs+1);
    state.stats.totalKills=Math.min(MAX_COUNTER,state.stats.totalKills+metrics.kills);
    state.stats.totalBosses=Math.min(MAX_COUNTER,state.stats.totalBosses+metrics.bosses);
    state.stats.bestTime=Math.max(state.stats.bestTime,metrics.seconds);
    state.stats.bestWave=Math.max(state.stats.bestWave,metrics.wave);
    state.stats.discoveries=Math.min(MAX_COUNTER,state.stats.discoveries+metrics.discoveries);
    state.stats.coinsEarned=Math.min(MAX_COUNTER,state.stats.coinsEarned+rewards.coins);
    const milestones=grantMilestones();
    const saved=save();
    return {ok:true,rewards,milestones,saved};
  }

  function exportSave() { return JSON.stringify(state,null,2); }
  function importSave(json) {
    if(typeof json!=='string'||json.length>2_000_000) return {ok:false,error:'Choisis un fichier de sauvegarde Furie Survivors valide.'};
    let imported;
    try { imported=sanitizedState(JSON.parse(json)); }
    catch(error) { return {ok:false,error:error instanceof SyntaxError?'Le fichier de sauvegarde n’est pas lisible.':error.message}; }
    state=imported;
    const milestones=grantMilestones();
    const saved=save();
    return {ok:true,milestones,saved};
  }

  // New players receive a durable career immediately when the browser permits it.
  if(!hadSavedData) save();

  return {
    get state(){return state;},get storageAvailable(){return storageAvailable;},get lastError(){return lastError;},
    selectHero,upgradeHero,upgradeStat,summon,recruitHero,settleRun,upgradeCost,recruitCost,heroBonuses,heroLevel,heroStatPoints,heroStats,
    exportSave,importSave,save,getAchievements
  };
}
