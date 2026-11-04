// Deterministic, renderer-independent expedition. Ground angle = atan2(dx,dz).
import { getHero, MAX_HERO_LEVEL } from './catalog.js';
import { getHeroBaseStats, getHeroCombatStats } from './hero-stats.js';
import {enemyCreature} from './creatures.js';
import {shooterShot,guardianShot,rangedPacing,SHOT_RANGE} from './enemy-shots.js';
import {XP_ACTIVATION_DELAY,CORPSE_LIFETIME,experienceReady} from './feedback-timing.js';
import {attackTiming} from './attack-timing.js';
import {cooperativePacing,openingDamageFactor,siegePerSide} from './coop-pacing.js';
import {stepMovement} from './movement.js';
import { WORLD_RADIUS,CHUNK_SIZE,ACTIVE_CHUNK_RADIUS,biomeAt,worldChunkAt,createWorldData } from './world.js';
export {biomeAt} from './world.js';
const TAU=Math.PI*2, STEP=1/60, ARENA=WORLD_RADIUS, RIFT_ARENA_RADIUS=22, BASE_SPEED=7.2;
const MAX_ENEMIES=120,MAX_GEMS=260,MAX_PROJECTILES=230,MAX_EFFECTS=78;
const ORBIT_HIT_RADIUS=.58;
const EMPTY_LIST=Object.freeze([]);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const finite=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
const hypot=Math.hypot, distance2=(a,b)=>(a.x-b.x)**2+(a.z-b.z)**2;
export const PACING=Object.freeze({openingSlimes:9,firstXP:36,firstRift:135,riftOffer:75,riftCooldown:195,riftActivation:2,riftDuration:120,riftRadius:4.5,eliteAt:180,enemyGates:Object.freeze({slime:0,runner:25,wisp:65,spitter:105,brute:165})});
export const ATTACK_PROFILES=Object.freeze({
  hammer:{damage:34,cooldown:.82,range:3.6,count:1,speed:0},
  orbit:{damage:33,cooldown:.46,range:2.5,count:2,speed:4.3},
  bow:{damage:27,cooldown:.62,range:16,count:1,speed:19},
  daggers:{damage:13,cooldown:.62,range:11,count:3,speed:19},
  fireball:{damage:31,cooldown:1.05,range:13,count:1,speed:12},
  lightning:{damage:23,cooldown:.95,range:11,count:3,speed:0},
  boomerang:{damage:22,cooldown:1.05,range:9,count:1,speed:12},
  fists:{damage:16,cooldown:.31,range:2.6,count:1,speed:0},
  wave:{damage:29,cooldown:1.55,range:5.7,count:1,speed:7.4},
  grenade:{damage:48,cooldown:1.5,range:12,count:1,speed:0},
  thorns:{damage:19,cooldown:.72,range:13,count:1,speed:16},
  stars:{damage:19,cooldown:1,range:13,count:6,speed:13},
  scythe:{damage:34,cooldown:.95,range:4.2,count:1,speed:0},
  bees:{damage:19,cooldown:1.1,range:13,count:2,speed:10},
  laser:{damage:24,cooldown:.72,range:15,count:1,speed:0},
  frost:{damage:14,cooldown:.85,range:9,count:4,speed:13},
  mines:{damage:49,cooldown:1.5,range:3.1,count:2,speed:0},
  spear:{damage:38,cooldown:.9,range:6.1,count:1,speed:0},
  vortex:{damage:9,cooldown:2.65,range:11,count:1,speed:0},
  dragon:{damage:6,cooldown:.22,range:6.8,count:3,speed:13}
});
export function attackProfile(hero){
  return {...(ATTACK_PROFILES[hero.family]||ATTACK_PROFILES.orbit),...hero.spell?.profile};
}
export const POI_GUIDE=Object.freeze({
  chest:Object.freeze({title:'Coffre',action:'Approche pour ouvrir',detail:'Marche jusqu’au coffre. Il s’ouvre automatiquement, sans bouton.',reward:'1 pouvoir · +12 PV · trésor',danger:false,radius:1.7,duration:0}),
  shrine:Object.freeze({title:'Sanctuaire',action:'Reste 6 secondes dans le cercle',detail:'Bouge librement dans la zone. En sortir fait redescendre la jauge.',reward:'1 pouvoir · +10 PV',danger:true,radius:3.3,duration:6}),
  well:Object.freeze({title:'Source de vie',action:'Approche pour te soigner',detail:'La source restaure 40 % de ta vie maximum, une seule fois. Elle attend si ta vie est pleine.',reward:'Restaure 40 % des PV maximum',danger:false,radius:1.8,duration:0}),
  camp:Object.freeze({title:'Camp ennemi',action:'Approche, puis bats les 4 sentinelles',detail:'Les sentinelles viennent défendre leur camp. Bats-les toutes ; tu peux te déplacer librement.',reward:'1 pouvoir · +15 PV · trésor',danger:true,radius:9,duration:0}),
  portal:Object.freeze({title:'Faille facultative',action:'Reste 2 secondes pour appeler le gardien',detail:'Un défi au choix : reste dans le cercle pour accepter, ou continue ton exploration. Chaque victoire débloque un gardien plus puissant.',reward:'Relique universelle · pouvoir rare ou mieux · +25 PV · trésor',danger:true,radius:4.5,duration:2})
});
const RIFT_RELICS=Object.freeze([
  Object.freeze({id:'rift-force',title:'Éclat de puissance',description:'+8 % de dégâts de base pour cette expédition.',stat:'damage',value:.08}),
  Object.freeze({id:'rift-tempo',title:'Éclat de tempo',description:'+6 % de cadence pour cette expédition.',stat:'cadence',value:.06}),
  Object.freeze({id:'rift-area',title:'Éclat d’amplitude',description:'+6 % de portée et de taille pour cette expédition.',stat:'area',value:.06})
]);
const ENEMIES={
  slime:{radius:.53,hp:30,speed:6.3,damage:16,xp:4},
  runner:{radius:.43,hp:25,speed:6.8,damage:18,xp:4},
  brute:{radius:.85,hp:104,speed:4.6,damage:30,xp:12},
  wisp:{radius:.47,hp:31,speed:6.1,damage:20,xp:5},
  spitter:{radius:.63,hp:48,speed:5.3,damage:22,xp:7},
  boss:{radius:1.65,hp:820,speed:3.25,damage:30,xp:80}
};
function seedNumber(seed){if(Number.isFinite(seed))return Math.trunc(seed)>>>0;if(typeof seed!=='string')return 12345;let h=2166136261;for(let i=0;i<seed.length;i++)h=Math.imul(h^seed.charCodeAt(i),16777619);return h>>>0;}
function randomFrom(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
function segmentDistanceSq(px,pz,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,d=dx*dx+dz*dz,u=d>1e-6?clamp(((px-ax)*dx+(pz-az)*dz)/d,0,1):0;return(px-ax-dx*u)**2+(pz-az-dz*u)**2;}
export const UPGRADES=Object.freeze({
  damage:{title:'Force sauvage',icon:'damage',max:12},cadence:{title:'Tempo furieux',icon:'cooldown',max:10},
  area:{title:'Grandeur d’Azur',icon:'area',max:8},amount:{title:'Écho multiple',icon:'amount',max:5},
  crit:{title:'Instinct précis',icon:'crit',max:7},speed:{title:'Pas léger',icon:'speed',max:5},
  magnet:{title:'Aimant à éclats',icon:'magnet',max:5},vitality:{title:'Cœur robuste',icon:'vitality',max:8},
  regen:{title:'Sève vivante',icon:'regen',max:5},chain:{title:'Lien électrique',icon:'bolt',max:4},
  burst:{title:'Impact explosif',icon:'burst',max:4},heal:{title:'Second souffle',icon:'heal',max:Infinity},
  armor:{title:'Carapace d’Azur',icon:'shield',max:6},dash:{title:'Pas de faille',icon:'dash',max:5},
  wisdom:{title:'Mémoire des éclats',icon:'shard',max:5},velocity:{title:'Projectiles véloces',icon:'speed',max:5},
  knockback:{title:'Onde de recul',icon:'wave',max:5},siphon:{title:'Soif vitale',icon:'regen',max:5},
  execute:{title:'Coup de grâce',icon:'crit',max:5},fortune:{title:'Bonne étoile',icon:'essence',max:5},
  barrier:{title:'Égide renouvelée',icon:'shield',max:4},greed:{title:'Fièvre du trésor',icon:'coin',max:4},
  awakening:{title:'ÉVEIL · Résonance d’Azur',icon:'evolution',max:1}
});
const WEAPON_CARDS=['damage','cadence','area','amount','crit','velocity','chain','burst','execute'];
const DEFENSE_CARDS=['vitality','regen','armor','siphon','barrier','heal'];
const UTILITY_CARDS=['speed','dash','knockback','wisdom','magnet','fortune','greed'];
const ACTIVE_STAT_CAPS={crit:['crit',.9],armor:['defense',.55],execute:['execute',.45],fortune:['luck',.3],greed:['coinMultiplier',2]};
export function createGame({seed=12345,heroId='lyra',heroLevel=1,bonuses={},runId,cooperative=null}={}){
  const runSeed=seedNumber(seed),hero=getHero(heroId),baseStats=getHeroBaseStats(hero.id),combatStats=getHeroCombatStats(hero.id,bonuses.points??heroLevel),family=ATTACK_PROFILES[hero.family]?hero.family:'orbit',spell=hero.spell||{},profile=attackProfile(hero);
  const levelPermanent=clamp(Math.floor(finite(heroLevel,1)),1,MAX_HERO_LEVEL);
  const expeditionId=typeof runId==='string'&&runId.length?runId.slice(0,160):`run-${runSeed}-${hero.id}`;
  let xpFeedback=0,xpFeedbackAt=0,pendingAttack=null;
  let cardRandom,recentOffers;
  let random,nextID,ticks,accumulator,pendingDash,spawnClock,spawnNumber,nextSiegeAt,siegeWarned,nextEliteAt,attackClock,novaClock,pendingUpgrades,pausedFrom,dashX,dashZ,orbitAngle,orbitRadius,chainReady,burstReady,riftOfferRetryAt,riftReturn;
  let spawnBounds=null,worldData,currentChunkKey='',indexedObstacles,indexedZones,indexedProps,propsDirty=false,gemsOverflow=false;
  const enemyData=new Map(),shotData=new Map(),volleyAt=new Map(),upgradeCounts=new Map(),obstacleBins=new Map(),zoneBins=new Map(),propBins=new Map(),knownPOIs=new Set(),obstacleNeighborhoods=new Map(),zoneNeighborhoods=new Map();
  const id=()=>cooperative?.nextId?cooperative.nextId():nextID++;
  const party=()=>cooperative?.players?.().filter(p=>p.hp>0)||[state.player];
  const pacing=()=>cooperativePacing(state.t,cooperative?.population?.()||1);
  const openingCount=()=>cooperative?cooperativePacing(0,cooperative.population?.()||1).openingSlimes:PACING.openingSlimes;
  function limitActiveGems(gems,x,z){
    if(gems.length<=MAX_GEMS)return gems;
    const living=cooperative?.players?.().filter(p=>p.hp>0)||[],centers=living.length?living:[{x,z}];
    const ranked=gems.map(gem=>{
      let nearest=Infinity;
      for(const p of centers)nearest=Math.min(nearest,distance2(p,gem));
      return{gem,nearest};
    }).sort((a,b)=>a.nearest-b.nearest);
    for(let i=0;i<MAX_GEMS;i++)gems[i]=ranked[i].gem;
    gems.length=MAX_GEMS;
    return gems;
  }
  function activeGems(chunks,x,z){
    const gems=chunks.flatMap(c=>c.gems).filter(g=>!g.collected);
    gemsOverflow=gems.length>MAX_GEMS;
    return limitActiveGems(gems,x,z);
  }
  function refreshOverflowGems(){
    // Reconsider cached drops as the team moves or collects XP within the same chunk.
    if(!gemsOverflow||state.rift.arenaActive||ticks%6!==0)return;
    const chunks=state.world.activeChunks.map(c=>worldData.getChunk(c.x,c.z));
    state.gems=activeGems(chunks,state.player.x,state.player.z);
  }
  function worldSlice(x,z){
    const c=worldChunkAt(x,z),chunks=[],seen=new Set(),centers=cooperative?[{x,z},...(cooperative.players?.()||[])]:[{x,z}];for(const center of centers){const pc=worldChunkAt(center.x,center.z);for(let ring=0;ring<=ACTIVE_CHUNK_RADIUS;ring++)for(let dz=-ring;dz<=ring;dz++)for(let dx=-ring;dx<=ring;dx++)if(Math.max(Math.abs(dx),Math.abs(dz))===ring){const key=(pc.x+dx)+':'+(pc.z+dz);if(!seen.has(key)){seen.add(key);chunks.push(worldData.getChunk(pc.x+dx,pc.z+dz));}}}
    return{obstacles:chunks.flatMap(c=>c.obstacles),pois:chunks.flatMap(c=>c.pois),zones:chunks.flatMap(c=>c.zones),traps:chunks.flatMap(c=>c.traps),breakables:chunks.flatMap(c=>c.breakables).filter(p=>!p.broken),pickups:chunks.flatMap(c=>c.pickups).filter(p=>!p.collected),gems:activeGems(chunks,x,z),world:{chunkX:c.x,chunkZ:c.z,chunkSize:CHUNK_SIZE,activeRadius:ACTIVE_CHUNK_RADIUS,activeChunks:chunks.map(c=>({id:c.id,x:c.x,z:c.z})),visitedChunks:worldData.visitedChunks,visitedCount:worldData.visitedCount}};
  }
  function resetInternals(){pendingAttack=null;xpFeedback=0;xpFeedbackAt=0;random=randomFrom(runSeed);cardRandom=randomFrom(seedNumber(runSeed+':'+hero.id+':'+(cooperative?.actorId||'solo')));recentOffers=[];nextID=1;ticks=0;accumulator=0;pendingDash=false;spawnClock=1.2;spawnNumber=0;nextSiegeAt=90;siegeWarned=false;nextEliteAt=cooperative?cooperativePacing(0).eliteAt:PACING.eliteAt;attackClock=.1;novaClock=4;pendingUpgrades=[];pausedFrom='playing';dashX=0;dashZ=-1;orbitAngle=0;orbitRadius=profile.range;chainReady=0;burstReady=0;riftOfferRetryAt=0;riftReturn=null;worldData=createWorldData(runSeed);currentChunkKey='0:0';propsDirty=false;enemyData.clear();shotData.clear();volleyAt.clear();upgradeCounts.clear();obstacleBins.clear();zoneBins.clear();propBins.clear();knownPOIs.clear();}
  function makeState(){const world=worldSlice(0,0),maxHp=combatStats.maxHp,mapPOIs=world.pois.filter(p=>p.discovered);for(const poi of mapPOIs)knownPOIs.add(poi.id);return{
    phase:'menu',runId:expeditionId,seed:runSeed,t:0,heroId:hero.id,heroLevel:levelPermanent,baseStats:{...baseStats,trait:{...baseStats.trait}},attackFamily:family,wave:1,bossesDefeated:0,biome:'forest',nextBossAt:PACING.firstRift,nextRiftAt:PACING.firstRift,
    rift:{phase:'waiting',poiId:null,tier:1,offerAt:0,expiresAt:0,activation:0,activationDuration:PACING.riftActivation,bossId:null,completedAt:0,arenaActive:false,offeredReward:{...RIFT_RELICS[0],tier:1},reward:null},riftsCleared:0,relics:[],upgradeSource:null,
    player:{x:0,z:0,vx:0,vz:0,angle:Math.PI,radius:combatStats.bodyRadius,hp:maxHp,maxHp,speed:combatStats.speed,defense:combatStats.defense,dashTime:0,dashCD:0,invuln:0,terrain:'normal',terrainMultiplier:1,hitFlash:0,hitDirection:{x:0,z:0},hitStun:0},
    stats:{damage:combatStats.damage,cadence:combatStats.cadence,area:combatStats.area,amount:combatStats.amount,crit:combatStats.crit,moveSpeed:combatStats.moveSpeed,pickupRadius:combatStats.pickupRadius,regen:combatStats.regen,defense:combatStats.defense,luck:combatStats.luck,chain:0,burst:0,dashRecharge:1,xpGain:1,velocity:1,knockback:1,siphon:0,execute:0,barrier:0,barrierReady:0,coinMultiplier:1},
    corpses:[],level:1,xp:0,nextXP:PACING.firstXP,kills:0,collected:0,rerolls:2,upgrades:[],offers:[],arenaRadius:ARENA,...world,worldRevision:1,mapPOIs,propsBroken:0,trapsTriggered:0,healingCollected:0,
    biomes:[{id:'forest',name:'Forêt vive',x:0,z:35},{id:'crystal',name:'Flèches de cristal',x:0,z:-58},{id:'desert',name:'Dunes dorées',x:58,z:18},{id:'swamp',name:'Marais des échos',x:-58,z:18}],
    enemies:[],gems:[],projectiles:[],effects:[],interaction:null,bossIncoming:false,discovered:0,chestsOpened:0,outcome:null,evolved:false,damageDealt:0,attackCount:0,criticalHits:0,
    message:'Ton arme attaque automatiquement. Touche un pouvoir pour voir son effet.',messageTime:4.5
  };}
  resetInternals();const state=makeState();
  function indexStatic(bins,list,size){bins.clear();for(const o of list){const key=`${Math.floor(o.x/size)},${Math.floor(o.z/size)}`;let bucket=bins.get(key);if(!bucket){bucket=[];bins.set(key,bucket);}bucket.push(o);}}
  function rebuildObstacles(){
    // Streaming replaces these arrays. HP/flash changes do not alter their cells.
    if(indexedObstacles!==state.obstacles){indexStatic(obstacleBins,state.obstacles,8);obstacleNeighborhoods.clear();indexedObstacles=state.obstacles;}
    if(indexedZones!==state.zones){indexStatic(zoneBins,state.zones,16);zoneNeighborhoods.clear();indexedZones=state.zones;}
    if(indexedProps!==state.breakables){indexStatic(propBins,state.breakables,8);indexedProps=state.breakables;}
  }
  rebuildObstacles();
  function rememberPoi(poi){if(!knownPOIs.has(poi.id)){knownPOIs.add(poi.id);state.mapPOIs.push(poi);}}
  function streamWorld(){if(state.rift.arenaActive)return false;const c=worldChunkAt(state.player.x,state.player.z),key=cooperative?[`${c.x}:${c.z}`,...party().map(p=>{const q=worldChunkAt(p.x,p.z);return `${q.x}:${q.z}`;})].sort().join('|'):`${c.x}:${c.z}`;if(key===currentChunkKey)return false;currentChunkKey=key;const next=worldSlice(state.player.x,state.player.z),ids=new Set(next.pois.map(p=>p.id)),oldTraps=new Set(state.traps.map(t=>t.id));for(const poi of state.pois)if((poi.dynamic||poi.type==='camp'&&poi.active&&!poi.completed)&&!ids.has(poi.id))next.pois.push(poi);for(const trap of next.traps)if(!oldTraps.has(trap.id)){trap.phase='idle';trap.phaseTime=trap.phaseDuration=trap.phaseProgress=0;trap.hitIds=[];}Object.assign(state,next);state.worldRevision++;for(const poi of state.pois)if(poi.discovered)rememberPoi(poi);rebuildObstacles();return true;}
  function nearbyObstacles(x,z){const cx=Math.floor(x/8),cz=Math.floor(z/8),key=`${cx},${cz}`;let list=obstacleNeighborhoods.get(key);if(!list){list=[];for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const bin=obstacleBins.get(`${cx+dx},${cz+dz}`);if(bin)list.push(...bin);}obstacleNeighborhoods.set(key,list);}return list;}
  function nearbyProps(x,z,range=2){const list=[],cx=Math.floor(x/8),cz=Math.floor(z/8),r=Math.max(1,Math.ceil((range+1)/8));for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)for(const p of propBins.get(`${cx+dx},${cz+dz}`)||EMPTY_LIST)if(!p.broken&&p.hp>0)list.push(p);return list;}
  function terrainAt(x,z){if(state.rift.arenaActive)return'normal';const cx=Math.floor(x/16),cz=Math.floor(z/16),key=`${cx},${cz}`;let zones=zoneNeighborhoods.get(key);if(!zones){zones=[];for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const bin=zoneBins.get(`${cx+dx},${cz+dz}`);if(bin)zones.push(...bin);}zoneNeighborhoods.set(key,zones);}let result='normal';for(const zone of zones)if((x-zone.x)**2+(z-zone.z)**2<zone.radius**2){if(zone.type==='mud')return'mud';result='ice';}return result;}
  function targetsNear(x,z,range){return[...state.enemies,...nearbyProps(x,z,range)];}
  function say(message,seconds=3.5){state.message=message;state.messageTime=seconds;}
  function effect(type,x,z,radius=1,life=.3,extra={}){state.effects.push({id:id(),type,x,z,angle:0,radius,life,maxLife:life,color:hero.color,...(cooperative?{ownerId:cooperative.actorId}:{}),...extra});if(state.effects.length>MAX_EFFECTS)state.effects.splice(0,state.effects.length-MAX_EFFECTS);}
  function resolveCircle(body){let collided=false;for(let pass=0;pass<2;pass++){for(const o of nearbyObstacles(body.x,body.z)){const dx=body.x-o.x,dz=body.z-o.z,min=body.radius+o.radius;if(dx*dx+dz*dz>=min*min)continue;const d=hypot(dx,dz);if(d<min){const nx=d>1e-5?dx/d:1,nz=d>1e-5?dz/d:0;body.x=o.x+nx*min;body.z=o.z+nz*min;collided=true;}}const edge=(state.rift.arenaActive?RIFT_ARENA_RADIUS:ARENA)-body.radius-.4;if(body.x*body.x+body.z*body.z>edge*edge){const d=hypot(body.x,body.z);body.x*=edge/d;body.z*=edge/d;collided=true;}}return collided;}
  // The renderer supplies a ground-plane footprint. Never fall back to an
  // on-screen point when an edge is blocked by the island or an obstacle.
  function setSpawnBounds(bounds){
    if(bounds===null){spawnBounds=null;return true;}
    if(!bounds||!['minX','maxX','minZ','maxZ'].every(k=>Number.isFinite(bounds[k]))||bounds.minX>=bounds.maxX||bounds.minZ>=bounds.maxZ)return false;
    spawnBounds={minX:bounds.minX,maxX:bounds.maxX,minZ:bounds.minZ,maxZ:bounds.maxZ};return true;
  }
  function currentSpawnBounds(){const p=state.player;return spawnBounds||{minX:p.x-18,maxX:p.x+18,minZ:p.z-18,maxZ:p.z+18};}
  function outsideView(x,z,radius=0,views=cooperative?.views?.()||[currentSpawnBounds()]){const margin=5+radius;return views.every(b=>x<b.minX-margin||x>b.maxX+margin||z<b.minZ-margin||z>b.maxZ+margin);}
  function outsideProjectileView(x,z,radius=0,views=cooperative?.views?.()||[currentSpawnBounds()]){return views.length>0&&views.every(b=>x+radius<b.minX||x-radius>b.maxX||z+radius<b.minZ||z-radius>b.maxZ);}
  function validSpawn(pos,radius){
    const d=cooperative?Math.min(...party().map(p=>hypot(pos.x-p.x,pos.z-p.z))):hypot(pos.x-state.player.x,pos.z-state.player.z),edge=state.rift.arenaActive?RIFT_ARENA_RADIUS:ARENA,entryClear=state.rift.arenaActive?d>=13:outsideView(pos.x,pos.z,radius);return Number.isFinite(pos.x)&&Number.isFinite(pos.z)&&entryClear&&hypot(pos.x,pos.z)<=edge-radius-.45&&d<=120&&nearbyObstacles(pos.x,pos.z).every(o=>hypot(pos.x-o.x,pos.z-o.z)>=o.radius+radius+.15)&&state.traps.every(t=>hypot(pos.x-t.x,pos.z-t.z)>t.radius+radius+.5);
  }
  function validInitial(pos,radius){const d=hypot(pos.x,pos.z);return d>=9&&d<=14&&nearbyObstacles(pos.x,pos.z).every(o=>hypot(pos.x-o.x,pos.z-o.z)>=o.radius+radius+.15)&&state.traps.every(t=>hypot(pos.x-t.x,pos.z-t.z)>t.radius+2);}
  function initialPosition(radius,index){for(let attempt=0;attempt<120;attempt++){const a=attempt<50?index*TAU/openingCount()+(random()-.5)*.5:random()*TAU,d=9+random()*5,pos={x:Math.sin(a)*d,z:Math.cos(a)*d,radius};resolveCircle(pos);if(validInitial(pos,radius)&&state.enemies.every(e=>hypot(e.x-pos.x,e.z-pos.z)>e.radius+radius+1.5))return pos;}return null;}
  function safeSpawn(radius=.6,preferredSide,focus){
    if(state.rift.arenaActive){for(let attempt=0;attempt<24;attempt++){const a=random()*TAU,d=RIFT_ARENA_RADIUS-radius-1,pos={x:Math.sin(a)*d,z:Math.cos(a)*d,radius};if(validSpawn(pos,radius))return pos;}return null;}
    const views=cooperative?.views?.(),b=views?.find(view=>view.playerId===focus?.playerId)||views?.[0]||currentSpawnBounds(),margin=5+radius,edge=preferredSide??Math.floor(random()*4);
    // Sample the edge, not the diagonal of a circle: enemies enter promptly
    // even on a wide display. Impossible edges are skipped without projection.
    for(let i=0;i<64;i++){
      const side=(edge+Math.floor(i/16))%4,u=random(),padding=margin+.3+random()*2.4;
      const pos=side===0?{x:b.minX-padding,z:b.minZ+(b.maxZ-b.minZ)*u}:side===1?{x:b.maxX+padding,z:b.minZ+(b.maxZ-b.minZ)*u}:side===2?{x:b.minX+(b.maxX-b.minX)*u,z:b.minZ-padding}:{x:b.minX+(b.maxX-b.minX)*u,z:b.maxZ+padding};
      pos.radius=radius;if(hypot(pos.x,pos.z)>ARENA-radius-.45)continue;
      resolveCircle(pos);if(validSpawn(pos,radius))return pos;
    }
    // On an island edge, there may be a valid sliver away from the rectangle.
    // These checks remain strict after collision resolution. No valid point -> defer.
    for(let i=0;i<40;i++){
      const origin=focus||state.player,a=random()*TAU,r=25+random()*70,pos={x:origin.x+Math.sin(a)*r,z:origin.z+Math.cos(a)*r,radius};
      resolveCircle(pos);if(validSpawn(pos,radius))return pos;
    }
    return null;
  }
  function metadata(e){const shared=cooperative?.enemyData||enemyData;let data=shared.get(e.id);if(!data){const b=ENEMIES[e.type]||ENEMIES.slime;data={speed:b.speed,damage:b.damage,xp:b.xp,dead:false,orbitNextHit:0,chargeCD:3+random()*2,chargeTime:0,chargeX:0,chargeZ:1,shootCD:1.8+random(),action:'',recover:0,numberAt:0,turn:e.id%2?1:-1,knockX:0,knockZ:0,poison:0,poisonPower:0,slow:0};shared.set(e.id,data);}return data;}
  function rangedRules(){return rangedPacing(state.t,(cooperative?pacing().enemyGates:PACING.enemyGates).spitter,cooperative?pacing().players:1);}
  function heroView(p,views){return views?.find(view=>view.playerId===p.playerId)||currentSpawnBounds();}
  // View bounds enclose a 7 m tall slab: their near edge lies 6.5 m beyond the visible floor.
  function onScreen(e,view){return e.x>=view.minX+1.6&&e.x<=view.maxX-1.6&&e.z>=view.minZ+1.5&&e.z<=view.maxZ-6.5;}
  // A shooter fires only from where its target sees it, and waits its turn behind the others.
  function canVolley(e,p,views,rules,windups){const target=p.playerId??'solo';return onScreen(e,heroView(p,views))&&(windups.get(target)||0)<rules.windups&&state.t-(volleyAt.get(target)??-Infinity)>=rules.gap;}
  function gatedEnemyType(type){return type==='boss'||state.t+1e-9>=((cooperative?pacing().enemyGates:PACING.enemyGates)[type]??0)?type:state.t+1e-9>=(cooperative?pacing().enemyGates.runner:PACING.enemyGates.runner)?'runner':'slime';}
  function reinforcementSlot(){
    const living=party(),views=cooperative?.views?.()||[currentSpawnBounds()];
    let farthest=24**2,index=-1;
    for(let i=0;i<state.enemies.length;i++){
      const enemy=state.enemies[i],data=metadata(enemy);
      if(enemy.hp<=0||enemy.type==='boss'||enemy.elite||data.poiId||enemy.telegraph>0||state.t-enemy.spawnAt<10)continue;
      let distance=Infinity;
      for(const player of living)distance=Math.min(distance,distance2(enemy,player));
      if(distance>farthest&&outsideView(enemy.x,enemy.z,enemy.radius,views)){farthest=distance;index=i;}
    }
    return index;
  }
  function spawnEnemy(type='slime',{elite=false,poiId,bossKind,bossTier=1,initial=false,initialIndex=0,side,focus,siege=false}={}){
    type=gatedEnemyType(type);elite=elite&&state.t+1e-9>=(cooperative?pacing().eliteAt:PACING.eliteAt);
    if(type==='spitter'&&state.enemies.reduce((n,e)=>n+(e.type==='spitter'&&e.hp>0),0)>=rangedRules().cap)type='runner';
    const b=ENEMIES[type]||ENEMIES.slime,radius=elite&&type!=='boss'?b.radius*1.25:b.radius;
    const director=pacing(),cap=cooperative?director.maxEnemies:MAX_ENEMIES;
    const reserved=initial||siege||poiId||elite||state.t<60?0:4*siegePerSide(nextSiegeAt,director.players);
    const replacement=state.enemies.length>=cap-reserved?reinforcementSlot():-1;
    if(state.enemies.length>=cap-reserved&&replacement<0)return null;
    const pos=initial?initialPosition(radius,initialIndex):safeSpawn(radius,side,focus);
    if(!pos)return null;
    const minutes=state.t/60,scale=1+minutes*.18+Math.pow(minutes,1.55)*.065,tier=clamp(Math.floor(finite(bossTier,1)),1,10000),bossGrowth=Math.min(9,tier-1);
    const hp=type==='boss'?Math.min(1e8,Math.round(900*(1+(tier-1)*.65))):Math.round(b.hp*(cooperative?pacing().hpGrowth:scale)*(cooperative?pacing().hpMultiplier:1)*(elite?2.5:1));
    const e={id:id(),type,initial,x:pos.x,z:pos.z,spawnX:pos.x,spawnZ:pos.z,spawnAt:state.t,angle:Math.atan2(state.player.x-pos.x,state.player.z-pos.z),radius,hp,maxHp:hp,telegraph:0,telegraphDuration:0,elite,biome:biomeAt(pos.x,pos.z),bossKind:bossKind||`${state.biome}-guardian`,bossTier:type==='boss'?tier:0,action:'move',attackKind:'',attackAngle:0,gaitPhase:0,hop:0,moveSpeed:0,vx:0,vz:0,hitFlash:0,hitDirection:{x:0,z:0},terrain:'normal'};
    e.speciesId=enemyCreature(e).id;
    // Last validation is deliberately after every placement/collision operation.
    if(cooperative&&type==='boss'){e.hp=Math.round(e.hp*pacing().bossHpMultiplier);e.maxHp=e.hp;}resolveCircle(e);if(!(initial?validInitial(e,radius):validSpawn(e,radius)))return null;
    if(replacement>=0){enemyData.delete(state.enemies[replacement].id);state.enemies.splice(replacement,1);}
    e.spawnX=e.x;e.spawnZ=e.z;state.enemies.push(e);const data=metadata(e);data.speed=type==='boss'?3.25+Math.min(.75,bossGrowth*.085):b.speed+Math.min(1.2,minutes*.085);data.damage=type==='boss'?Math.round(30*(1+bossGrowth*.13)):Math.round(b.damage*(1+minutes*.10+Math.pow(minutes,1.35)*.015)*(elite?1.22:1));data.xp=Math.round(b.xp*(elite&&type!=='boss'?2:1));if(cooperative){const d=director;data.speed=type==='boss'?data.speed:d.speeds[type]+d.speedGrowth;data.damage=type==='boss'?data.damage:Math.round(b.damage*d.damageGrowth*(elite?1.15:1));data.xp=b.xp/d.xpDivisor;}if(type!=='boss'){
      const species=getHeroBaseStats(e.speciesId),hpFactor=clamp(species.maxHp/110,.88,1.18);
      e.hp=Math.max(1,Math.round(e.hp*hpFactor));e.maxHp=e.hp;
      data.damage=Math.max(1,Math.round(data.damage*clamp(species.damage,.9,1.25)*openingDamageFactor(state.t,director.players)));
      data.speed*=clamp(species.moveSpeed,.95,1.03);
    }
    data.poiId=poiId;return e;
  }
  function addGem(x,z,value){
    if(cooperative?.addGem)return cooperative.addGem(x,z,value);
    const c=worldChunkAt(x,z),chunk=worldData.getChunk(c.x,c.z);chunk.gems=chunk.gems.filter(g=>!g.collected);let nearest=null,best=.64;
    for(const gem of chunk.gems){const d=(gem.x-x)**2+(gem.z-z)**2;if(!experienceReady(gem,state.t)&&Math.abs(state.t-gem.bornAt)<.12&&d<best){best=d;nearest=gem;}}
    if(nearest){nearest.value=Math.min(100000,nearest.value+value);nearest.activeAt=Math.max(nearest.activeAt,state.t+XP_ACTIVATION_DELAY);if(!state.gems.includes(nearest))state.gems.push(nearest);}
    else{
      // Streaming retains loot off screen, so the visible limit alone is insufficient.
      if(chunk.gems.length>=MAX_GEMS){
        const oldest=chunk.gems.shift();
        const visible=state.gems.indexOf(oldest);
        if(visible!==-1)state.gems.splice(visible,1);
      }
      const gem={id:id(),x,z,value,collected:false,bornAt:state.t,activeAt:state.t+XP_ACTIVATION_DELAY};
      chunk.gems.push(gem);
      state.gems.push(gem);
    }
    if(state.gems.length>MAX_GEMS){
      if(!state.rift.arenaActive)gemsOverflow=true;
      limitActiveGems(state.gems,state.player.x,state.player.z);
    }
  }
  function finish(outcome){if(['won','lost','menu'].includes(state.phase))return false;state.outcome=outcome;state.phase=outcome==='death'?'lost':'won';state.offers=[];state.upgradeSource=null;pendingUpgrades=[];state.player.vx=state.player.vz=0;state.player.attack=null;pendingAttack=null;accumulator=0;pendingDash=false;say(outcome==='death'?'Expédition terminée. Tous tes gains sont conservés.':'Retour au camp. Tous tes gains sont conservés.',999);return true;}
  function heal(amount){const p=state.player,before=p.hp;if(cooperative&&p.hp<=0)return;p.hp=Math.min(p.maxHp,p.hp+Math.max(0,amount));if(p.hp>before&&amount>=2)effect('heal',p.x,p.z,1.1,.5,{color:'#83efac'});}
  function nearestEnemy(x,z,range,exclude){let best=range*range,found=null;for(const e of state.enemies){if(e.hp<=0||exclude?.has(e.id))continue;const d=(e.x-x)**2+(e.z-z)**2;if(d<best){best=d;found=e;}}return found;}
  function nearestTarget(x,z,range,exclude){const enemy=nearestEnemy(x,z,range,exclude);let best=enemy?(enemy.x-x)**2+(enemy.z-z)**2:range*range,found=enemy;for(const prop of nearbyProps(x,z,range)){if(prop.hp<=0||prop.broken||exclude?.has(prop.id))continue;const d=(prop.x-x)**2+(prop.z-z)**2;if(d<best){best=d;found=prop;}}return found;}
  function hurtProp(prop,raw){
    if(prop.broken||prop.hp<=0||!Number.isFinite(raw)||raw<=0)return;const lost=Math.min(prop.hp,raw);prop.hp=Math.max(0,prop.hp-raw);prop.hitFlash=.16;effect('hit',prop.x,prop.z,prop.radius,.15,{color:'#f4d49a',damage:lost,critical:false,targetId:prop.id,propType:prop.type});
    if(prop.hp>0)return;prop.broken=true;propsDirty=true;state.propsBroken++;if(prop.loot.xp>0)addGem(prop.x,prop.z,prop.loot.xp);
    if(prop.loot.heal>0){const pickup={id:id(),type:'heal',x:prop.x,z:prop.z,value:prop.loot.heal,collected:false},c=worldChunkAt(prop.x,prop.z);worldData.getChunk(c.x,c.z).pickups.push(pickup);state.pickups.push(pickup);}
    effect('break',prop.x,prop.z,prop.radius,.65,{propType:prop.type,loot:{...prop.loot},color:prop.type==='crystal'?'#9cddff':prop.type==='vase'?'#a8e6b1':'#dcac73'});
  }
  function hurtEnemy(e,raw,{knock=0,from=state.player,proc=true,critical=true,poison=0,slow=0,silent=false}={}){
    if(e.breakable){hurtProp(e,raw);return;}
    const data=metadata(e);if(data.dead||e.hp<=0||!Number.isFinite(raw))return;
    const crit=critical&&random()<state.stats.crit,execute=e.type!=='boss'&&state.stats.execute>0&&e.hp/e.maxHp<=state.stats.execute,damage=Math.max(0,raw)*(crit?1.85:1)*(execute?2:1),removed=Math.min(e.hp,damage);state.damageDealt+=removed;if(crit)state.criticalHits++;e.hp=Math.max(0,e.hp-damage);
    if(poison){data.poison=3.2;data.poisonPower=Math.max(data.poisonPower,poison);}if(slow)data.slow=Math.max(data.slow,slow);
    if(knock){const dx=e.x-from.x,dz=e.z-from.z,d=hypot(dx,dz)||1,force=knock*state.stats.knockback*(e.type==='boss'?.12:e.type==='brute'?.4:1);data.knockX+=dx/d*force;data.knockZ+=dz/d*force;}
    if(!silent){const dx=e.x-from.x,dz=e.z-from.z,d=hypot(dx,dz)||1;e.hitDirection={x:dx/d,z:dz/d};e.hitFlash=crit?.2:.12;e.hitAt=state.t;effect('hit',e.x,e.z,e.radius*(crit?1.25:.7),crit?.24:.13,{color:crit?'#fff2a0':hero.color,damage:removed,critical:!!crit,targetId:e.id,enemyType:e.type});if(state.t>=data.numberAt||crit){data.numberAt=state.t+.12;effect('damage',e.x,e.z,e.radius,.64,{amount:Math.round(removed),crit:!!crit,targetId:e.id,enemyType:e.type,color:crit?'#ffe282':'#fff6df'});}}
    if(e.hp<=0){data.dead=true;state.corpses.push({id:e.id,speciesId:e.speciesId,type:e.type,biome:e.biome,bossKind:e.bossKind,bossTier:e.bossTier,x:e.x,z:e.z,angle:e.angle,radius:e.radius,diedAt:state.t});if(state.corpses.length>512)state.corpses.splice(0,state.corpses.length-512);effect('death',e.x,e.z,e.radius,.45,{targetId:e.id,enemyType:e.type,angle:e.angle,color:e.type==='slime'?'#b4d96b':e.type==='wisp'?'#baa8ef':e.type==='spitter'?'#eea9a1':'#e8c896'});state.kills++;addGem(e.x,e.z,data.xp);if(state.stats.siphon>0)heal(state.stats.siphon);if(e.type==='boss'){state.bossesDefeated++;if(!completeRift(e)){queueUpgrade({kind:'rift',title:'Gardien vaincu',tier:e.bossTier||1,minimumRarity:'rare'});heal(25);effect('nova',e.x,e.z,7,.65,{color:'#fff0a4'});say('Gardien vaincu ! Un pouvoir rare et 25 PV. L’expédition continue.',4.5);}}}
    if(!proc)return;
    if(state.stats.chain>0&&state.t>=chainReady&&random()<.22+state.stats.chain*.04){chainReady=state.t+.16;const hit=new Set([e.id]),points=[{x:e.x,z:e.z}];let last=e;for(let i=0;i<1+state.stats.chain;i++){const next=nearestEnemy(last.x,last.z,4.2*state.stats.area,hit);if(!next)break;hit.add(next.id);points.push({x:next.x,z:next.z});hurtEnemy(next,damage*.42,{proc:false,critical:false,from:last,knock:.5});last=next;}if(points.length>1)effect('lightning',e.x,e.z,1,.22,{points,color:'#a5dcff'});}
    if(state.stats.burst>0&&state.t>=burstReady&&random()<.18+state.stats.burst*.035){burstReady=state.t+.2;const radius=(1.5+state.stats.burst*.2)*state.stats.area;effect('explosion',e.x,e.z,radius,.35,{color:'#ffbc6b'});for(const other of state.enemies)if(other.id!==e.id&&other.hp>0&&distance2(other,e)<(radius+other.radius)**2)hurtEnemy(other,damage*(.42+state.stats.burst*.06),{proc:false,critical:false,from:e,knock:2.5});}
  }
  function hurtPlayer(damage,x,z){const p=state.player;if(p.invuln>0||state.phase!=='playing')return 0;if(state.stats.barrier>0&&state.t>=state.stats.barrierReady){state.stats.barrierReady=state.t+Math.max(9,28-state.stats.barrier*4);p.invuln=.35;effect('nova',p.x,p.z,1.8,.45,{color:'#b9e8ff'});say('L’Égide absorbe le coup !',1.6);return 0;}const reduced=Math.max(0,finite(damage))*(1-clamp(finite(state.stats.defense),0,.55));if(reduced<=0)return 0;const lost=Math.min(p.hp,reduced);p.hp=Math.max(0,p.hp-reduced);p.invuln=.66;p.hitFlash=.24;p.hitStun=.08;effect('damage',p.x,p.z,1,.6,{amount:Math.round(lost),crit:false,targetId:'player',hostile:true,color:'#ff8193'});effect('hit',p.x,p.z,1.1,.25,{color:'#ff677e'});const dx=p.x-x,dz=p.z-z,d=hypot(dx,dz)||1;p.hitDirection={x:dx/d,z:dz/d};p.x+=dx/d*.3;p.z+=dz/d*.3;resolveCircle(p);if(p.hp<=0){pendingAttack=null;p.attack=null;if(cooperative){p.downedAt=state.t;p.vx=p.vz=0;}else if(state.rift.arenaActive)failRift();else finish('death');}return lost;}
  const count=key=>upgradeCounts.get(key)||0;
  function cadenceDescription(percent){if(family==='orbit')return`+${percent} % de cadence : satellites plus rapides ET impacts plus fréquents.`;if(spell.delivery==='zone')return`+${percent} % de cadence : zones invoquées plus souvent et dégâts plus fréquents.`;if(family==='mines')return`+${percent} % de cadence : pose tes mines plus rapidement.`;if(spell.delivery==='melee')return`+${percent} % de cadence : tes frappes se déclenchent plus rapidement.`;return`+${percent} % de cadence : tes ${spell.delivery==='wave'?'ondes':family==='lightning'?'éclairs':'tirs'} se déclenchent plus rapidement.`;}
  function queueUpgrade(source){pendingUpgrades.push({minimumRarity:'common',...source});if(cooperative&&source.kind!=='level')cooperative.reward?.(source);}
  function offer(key){
    const def=UPGRADES[key],roll=cardRandom(),luck=clamp(state.stats.luck,0,ACTIVE_STAT_CAPS.fortune[1]);let rarity=roll<.07+luck*.42?'epic':roll<.31+luck?'rare':'common';if(['chain','burst','awakening'].includes(key))rarity='epic';if((key==='amount'||state.upgradeSource?.minimumRarity==='rare')&&rarity==='common')rarity='rare';const m=rarity==='epic'?1.7:rarity==='rare'?1.3:1;let value=0,description='';
    if(key==='damage'){value=Math.round(18*m)/100;description=`+${Math.round(value*100)} % de dégâts de base pour toutes tes attaques.`;}
    if(key==='cadence'){value=Math.round(16*m)/100;description=cadenceDescription(Math.round(value*100));}
    if(key==='area'){value=Math.round(13*m)/100;description=`+${Math.round(value*100)} % de portée et de taille : ${family==='orbit'?'satellites plus volumineux et couverture élargie.':'tes attaques couvrent davantage de terrain.'}`;}
    if(key==='amount'){value=rarity==='epic'?2:1;const extra=family==='stars'?value*2:value,noun=({orbit:'satellite',melee:'frappe',beam:'faisceau',chain:'cible',zone:'zone',wave:'onde',trap:'mine'})[spell.delivery]||'projectile';description=`+${extra} ${noun}${extra>1?'s':''} ${family==='orbit'?'en rotation.':'à chaque attaque.'}`;}
    if(key==='crit'){value=Math.round(8*m)/100;description=`+${Math.round(value*100)} points de chance critique. Un critique inflige 85 % de dégâts en plus.`;}
    if(key==='speed'){value=Math.round(9*m)/100;description=`+${Math.round(value*100)} % de vitesse de déplacement de base.`;}
    if(key==='magnet'){value=Math.round(13*m)/10;description=`Rayon de collecte locale : ${(state.stats.pickupRadius+value).toLocaleString('fr-FR',{maximumFractionDigits:1})} m. Les cristaux plus éloignés restent au sol.`;}
    if(key==='vitality'){value=Math.round(20*m);description=`+${value} PV maximum et récupère immédiatement ${value} PV.`;}
    if(key==='regen'){value=Math.round(7*m)/10;description=`Récupère ${value.toLocaleString('fr-FR')} PV par seconde pendant l’expédition.`;}
    if(key==='chain'){value=1;description=`Tes impacts ont ${Math.round((.22+(state.stats.chain+1)*.04)*100)} % de chance de créer une chaîne vers ${2+state.stats.chain} ennemis proches.`;}
    if(key==='burst'){value=1;description=`Tes impacts ont ${Math.round((.18+(state.stats.burst+1)*.035)*100)} % de chance d’exploser. Zone et dégâts augmentent à chaque niveau.`;}
    if(key==='armor'){value=Math.round(25*m)/1000;description=`+${(value*100).toFixed(1).replace('.',',')} points de défense contre toutes les sources de dégâts.`;}
    if(key==='dash'){value=Math.round(12*m)/100;description=`L’esquive se recharge ${Math.round(value*100)} % plus vite.`;}
    if(key==='wisdom'){value=Math.round(15*m)/100;description=`+${Math.round(value*100)} % d’expérience ramassée : davantage de choix pendant la partie.`;}
    if(key==='velocity'){value=Math.round(16*m)/100;description=`+${Math.round(value*100)} % de vitesse et de portée pratique pour les projectiles.`;}
    if(key==='knockback'){value=Math.round(18*m)/100;description=spell.delivery==='zone'?`+${Math.round(value*100)} % de force d’attraction pour tes zones.`:`+${Math.round(value*100)} % de recul : ouvre un passage quand la horde se resserre.`;}
    if(key==='siphon'){value=Math.round(8*m)/100;description=`Récupère ${value.toLocaleString('fr-FR')} PV à chaque élimination.`;}
    if(key==='execute'){value=Math.round(4*m)/100;description=`Double les dégâts sous ${Math.round(Math.min(ACTIVE_STAT_CAPS.execute[1],state.stats.execute+value)*100)} % de vie, sauf contre les gardiens.`;}
    if(key==='fortune'){value=Math.round(35*m)/1000;description='Augmente les chances que les prochains pouvoirs soient rares ou épiques.';}
    if(key==='barrier'){value=1;description=`Absorbe entièrement un coup. Recharge : ${Math.max(9,28-(state.stats.barrier+1)*4)} secondes.`;}
    if(key==='greed'){value=Math.round(8*m)/100;description=`+${Math.round(value*100)} % de pièces à la fin de cette expédition.`;}
    if(key==='heal'){value=Math.round(45*m);description=`Récupère immédiatement ${value} PV.`;}
    if(key==='awakening'){value=1;description=`Force 3 + Tempo 3 : +25 % de dégâts de base, 1 attaque supplémentaire et une onde d’Azur toutes les ${(5/state.stats.cadence).toLocaleString('fr-FR',{maximumFractionDigits:1})} s à ta cadence actuelle.`;}
    return{id:key,title:def.title,description,kind:key==='awakening'?'evolution':'passive',rarity,icon:def.icon,value};
  }
  function canOffer(key){
    if(key==='awakening')return !state.evolved&&count('damage')>=3&&count('cadence')>=3;
    if(key==='heal')return state.player.hp<state.player.maxHp*.88;
    if(key==='velocity'&&!['projectile','homing','radial','cone'].includes(spell.delivery)&&!spell.travel)return false;
    const cap=ACTIVE_STAT_CAPS[key];
    return count(key)<UPGRADES[key].max&&(!cap||state.stats[cap[0]]<cap[1]);
  }
  function makeOffers(excluded=[]){
    const available=Object.keys(UPGRADES).filter(canOffer),selected=[];
    if(available.length<3&&!available.includes('heal'))available.push('heal');
    const draw=group=>{
      const eligible=group.filter(key=>available.includes(key)&&!selected.includes(key)&&!excluded.includes(key));
      const fresh=eligible.filter(key=>!recentOffers.includes(key)),pool=fresh.length?fresh:eligible;
      if(pool.length)selected.push(pool[Math.floor(cardRandom()*pool.length)]);
    };
    draw(['awakening']);
    if(state.player.hp<state.player.maxHp*.32)draw(['heal']);
    if(selected.length<3&&state.level<=3)draw(['damage','cadence','area','amount']);
    if(selected.length===0)draw(WEAPON_CARDS);
    if(selected.length<3&&!selected.includes('heal'))draw(DEFENSE_CARDS);
    if(selected.length<3)draw(UTILITY_CARDS);
    while(selected.length<3&&available.some(key=>!selected.includes(key)&&!excluded.includes(key)))draw(available);
    for(const key of available)if(selected.length<3&&!selected.includes(key))selected.push(key);
    recentOffers=[...recentOffers.slice(-3),...selected];
    state.offers=selected.map(offer);
  }
  function openUpgrade(){if(state.phase!=='playing'||pendingUpgrades.length===0)return;state.phase='upgrade';state.upgradeSource={...pendingUpgrades[0]};state.player.vx=state.player.vz=0;accumulator=0;pendingDash=false;makeOffers();}
  function chooseUpgrade(key){
    if(state.phase!=='upgrade')return false;const choice=state.offers.find(o=>o.id===key);if(!choice||!UPGRADES[key])return false;const v=choice.value;upgradeCounts.set(key,count(key)+1);
    if(key==='damage')state.stats.damage+=v;if(key==='cadence')state.stats.cadence+=v;if(key==='area')state.stats.area+=v;if(key==='amount')state.stats.amount+=v;if(key==='crit')state.stats.crit=Math.min(.9,state.stats.crit+v);
    if(key==='speed'){state.stats.moveSpeed+=v;state.player.speed=BASE_SPEED*state.stats.moveSpeed;}if(key==='magnet')state.stats.pickupRadius+=v;if(key==='vitality'){state.player.maxHp+=v;heal(v);}if(key==='regen')state.stats.regen+=v;if(key==='chain')state.stats.chain++;if(key==='burst')state.stats.burst++;if(key==='armor')state.stats.defense=Math.min(.55,state.stats.defense+v);if(key==='dash')state.stats.dashRecharge+=v;if(key==='wisdom')state.stats.xpGain+=v;if(key==='velocity')state.stats.velocity+=v;if(key==='knockback')state.stats.knockback+=v;if(key==='siphon')state.stats.siphon+=v;if(key==='execute')state.stats.execute=Math.min(.45,state.stats.execute+v);if(key==='fortune')state.stats.luck=Math.min(ACTIVE_STAT_CAPS.fortune[1],state.stats.luck+v);if(key==='barrier'){state.stats.barrier++;state.stats.barrierReady=state.t;}if(key==='greed')state.stats.coinMultiplier=Math.min(2,state.stats.coinMultiplier+v);if(key==='heal')heal(v);
    if(key==='awakening'){state.evolved=true;state.stats.damage+=.25;state.stats.amount++;novaClock=.1;say('Résonance d’Azur éveillée ! Toutes tes attaques gagnent en puissance.',4.5);}
    const old=state.upgrades.find(u=>u.id===key);if(old)old.level=count(key);else state.upgrades.push({id:key,title:UPGRADES[key].title,level:count(key),icon:UPGRADES[key].icon});if(family==='orbit')refreshOrbits();pendingUpgrades.shift();state.offers=[];if(pendingUpgrades.length){state.upgradeSource={...pendingUpgrades[0]};makeOffers();}else{state.upgradeSource=null;state.phase='playing';state.player.invuln=Math.max(state.player.invuln,.35);}return true;
  }
  function reroll(){if(state.phase!=='upgrade'||state.rerolls<=0)return false;const old=state.offers.map(o=>o.id);state.rerolls--;makeOffers(old);return true;}
  function addShot(type,x,z,vx,vz,radius,data={},extra={}){if(state.projectiles.length>=(cooperative?pacing().projectilesPerPlayer:MAX_PROJECTILES))return null;const hostile=extra.hostile===true,speedFactor=hostile?1:state.stats.velocity,shot={id:id(),type,family,x,z,vx:vx*speedFactor,vz:vz*speedFactor,radius,angle:Math.atan2(vx,vz),bornAt:state.t,y:.65,color:spell.color||hero.color,style:spell.style,delivery:spell.delivery,hostile,...(cooperative?{ownerId:cooperative.actorId}:{}),...extra};state.projectiles.push(shot);shotData.set(shot.id,{life:1.5,age:0,damage:profile.damage*state.stats.damage,hit:new Set(),...data});return shot;}
  function refreshOrbits(){for(const shot of state.projectiles)if(shot.type==='orbit')shotData.delete(shot.id);state.projectiles=state.projectiles.filter(p=>p.type!=='orbit');for(let i=0;i<profile.count+state.stats.amount;i++)addShot('orbit',state.player.x,state.player.z,0,0,ORBIT_HIT_RADIUS*state.stats.area,{life:999999},{orbitIndex:i});positionOrbits();}
  function positionOrbits(){const orbs=state.projectiles.filter(p=>p.type==='orbit');orbs.forEach((orb,i)=>{const a=orbitAngle+i*TAU/orbs.length;orb.x=state.player.x+Math.sin(a)*orbitRadius;orb.z=state.player.z+Math.cos(a)*orbitRadius;orb.angle=a;orb.radius=ORBIT_HIT_RADIUS*state.stats.area;});}
  function explosion(x,z,radius,damage,color=hero.color,status={}){effect('explosion',x,z,radius,.4,{color});for(const e of targetsNear(x,z,radius))if(e.hp>0&&(e.x-x)**2+(e.z-z)**2<(radius+e.radius)**2)hurtEnemy(e,damage,{...status,from:{x,z},knock:5});}
  function arcAttack(angle,radius,threshold,damage){const p=state.player,dx=Math.sin(angle),dz=Math.cos(angle);effect(family==='hammer'?'bonk':'slash',p.x,p.z,radius,.24,{angle,family});for(const e of targetsNear(p.x,p.z,radius)){if(e.hp<=0)continue;const x=e.x-p.x,z=e.z-p.z,d=hypot(x,z);if(d<radius+e.radius*.7&&(d<1||(x*dx+z*dz)/Math.max(.001,d)>threshold))hurtEnemy(e,damage,{knock:family==='hammer'?5:2.2});}}
  function beamAttack(angle,radius,width,damage){const p=state.player,end={x:p.x+Math.sin(angle)*radius,z:p.z+Math.cos(angle)*radius};effect('beam',p.x,p.z,width,.2,{angle,points:[{x:p.x,z:p.z},end],family});for(const e of targetsNear(p.x,p.z,radius))if(e.hp>0&&segmentDistanceSq(e.x,e.z,p.x,p.z,end.x,end.z)<=(width+e.radius)**2)hurtEnemy(e,damage,{knock:family==='spear'?3:1});}
  function updateWeapons(){
    const p=state.player,s=state.stats,scale=s.area,amount=Math.min(12,s.amount),damage=profile.damage*s.damage;attackClock-=STEP;novaClock-=STEP;orbitAngle+=STEP*(family==='orbit'?profile.speed:3.5)*s.cadence;
    if(family==='orbit')orbitRadius=profile.range+.25*(scale-1);
    if(state.evolved&&novaClock<=0){novaClock+=5/s.cadence;const r=5.6*scale;effect('nova',p.x,p.z,r,.6,{color:'#e2f58c'});for(const e of targetsNear(p.x,p.z,r))if(e.hp>0&&distance2(e,p)<(r+e.radius)**2)hurtEnemy(e,40*s.damage,{knock:9});}
    if(pendingAttack&&state.t+1e-9>=pendingAttack.impactAt){
      const swing=pendingAttack;
      pendingAttack=null;
      releaseAttack(swing);
    }
    if(family==='orbit'||attackClock>0||pendingAttack)return;
    const range=profile.range*scale,target=nearestTarget(p.x,p.z,Math.max(range,family==='mines'?16:0));
    if(!target&&!['stars','wave','mines'].includes(family))return;
    attackClock=Math.max(.08,profile.cooldown/(family==='vortex'?Math.sqrt(s.cadence):s.cadence));
    const angle=target?Math.atan2(target.x-p.x,target.z-p.z):p.angle;
    const timing=attackTiming(state.t,attackClock,angle,spell.delivery==='melee');
    p.attack=timing;
    const cast={target,range,angle,scale,amount,damage,impactAt:timing.impactAt};
    if(timing.impactAt>state.t)pendingAttack=cast;
    else releaseAttack(cast);
  }
  function releaseAttack({target,range,angle,scale,amount,damage}){
    const p=state.player,s=state.stats;
    state.attackCount++;
    if(spell.delivery!=='melee')effect('cast',p.x,p.z,.5,.22,{color:spell.color||hero.color});
    if(!spell.pattern&&['hammer','scythe','fists'].includes(family)){const threshold=family==='scythe'?-.7:family==='fists'?.5:.05;for(let i=0;i<=amount;i++)arcAttack(angle+(i?(i%2?1:-1)*.4:0),range,threshold,damage*(i?.65:1));return;}
    if(spell.pattern==='beam'||!spell.pattern&&(family==='laser'||family==='spear')){const count=profile.count+amount;for(let i=0;i<count;i++)beamAttack(angle+(spell.centered?(i-(count-1)/2)*(spell.spread||.14):(i?Math.ceil(i/2)*(i%2?1:-1)*(spell.spread||.14):0)),range,(family==='spear'?.35:.24)*scale,damage);return;}
    if(!spell.pattern&&family==='lightning'){const hit=new Set(),points=[{x:p.x,z:p.z}];let current=target;for(let i=0;i<profile.count+amount;i++){if(!current)break;hit.add(current.id);points.push({x:current.x,z:current.z});hurtEnemy(current,damage*(i?.85:1),{knock:.6});current=nearestTarget(current.x,current.z,5*scale,hit);}effect('lightning',p.x,p.z,.5,.25,{points});return;}
    if(spell.pattern==='wave'||!spell.pattern&&family==='wave'){
      for(let i=0;i<profile.count+amount;i++){
        const travel=spell.travel,delay=i*(spell.waveDelay||.16),vx=travel?Math.sin(angle)*profile.speed:0,vz=travel?Math.cos(angle)*profile.speed:0;
        addShot('wave',p.x,p.z,vx,vz,.1,{life:range/profile.speed+delay,delay,maxRadius:travel?spell.waveRadius*scale:range,expansion:profile.speed,damage,travel,slow:spell.slow},{y:.15});
      }return;
    }
    if(family==='mines'){const contact=state.enemies.some(e=>e.hp>0&&distance2(e,p)<=(p.radius+e.radius+.35)**2);for(let i=0;i<profile.count+amount;i++){const a=p.angle+Math.PI+(i%2?1:-1)*(.325+Math.floor(i/2)*.65),offset=contact&&i===0?0:1.25,center=target&&(target.breakable||spell.targeted)?target:p;addShot('mine',center.x+(center!==p?Math.sin(i*2.4)*i*.35:Math.sin(a)*offset),center.z+(center!==p?Math.cos(i*2.4)*i*.35:Math.cos(a)*offset),0,0,.38*scale,{life:10,arm:spell.arm||.4,explosionRadius:spell.targeted?3.1*scale:range,damage},{y:.2});}return;}
    if(spell.pattern==='zone'||!spell.pattern&&family==='vortex'){
      const used=new Set();for(let i=0;i<profile.count+amount;i++){
        const victim=nearestTarget(p.x,p.z,range,used)||target;if(!victim)continue;used.add(victim.id);
        addShot('vortex',victim.x+Math.sin(i*2.4)*i*.65,victim.z+Math.cos(i*2.4)*i*.65,0,0,(spell.zoneRadius||2.8)*scale,{life:spell.zoneLife||2.5,tick:0,firstPulse:true,damage,tickInterval:(spell.tickInterval||.34)/Math.sqrt(s.cadence),pull:spell.pull??1,poison:(spell.poison||0)*s.damage,slow:spell.slow},{y:.12});
      }return;
    }
    if(spell.pattern==='lob'||family==='grenade'){
      const used=new Set();for(let i=0;i<profile.count+amount;i++){
        const victim=nearestTarget(p.x,p.z,range,used)||target;if(!victim)continue;used.add(victim.id);const flight=.65,x=victim.x+Math.sin(i*2.4)*i*(spell.scatter||0),z=victim.z+Math.cos(i*2.4)*i*(spell.scatter||0);
        addShot('projectile',p.x,p.z,(x-p.x)/flight,(z-p.z)/flight,.3*scale,{life:flight,flight,lob:true,damage,explosionRadius:(spell.splash||2.8)*scale,poison:(spell.poison||0)*s.damage,slow:spell.slow},{angle});
      }return;
    }
    const shots=Math.min(32,profile.count+(family==='stars'?amount*2:amount));
    for(let i=0;i<shots;i++){
      let a=angle;if(spell.radial)a=angle+i*TAU/shots;else if(family==='stars'&&!spell.pattern)a=(target?angle:state.t*.48)+(i<profile.count?i*TAU/profile.count:(i-profile.count)*TAU/profile.count+TAU/(profile.count*2));else a+=spell.centered?(i-(shots-1)/2)*(spell.spread||.15):(i?Math.ceil(i/2)*(i%2?1:-1):0)*(spell.spread||(family==='dragon'?.2:.15));
      const data={life:range/profile.speed,damage,pierce:spell.pierce??(family==='bow'||family==='thorns'?2:family==='dragon'?3:0)};
      if(family==='fireball')data.explosionRadius=(spell.splash||2.5)*scale;if(family==='thorns')data.poison=(spell.poison??5.5)*s.damage;if(family==='frost')data.slow=2.4;if(family==='bees'||spell.homing){data.homing=true;data.life=2.5;}if(family==='boomerang'||spell.boomerang){data.life=range*2/profile.speed;data.turnAt=data.life*.46;data.boomerang=true;data.pierce=99;}
      if(spell.poison)data.poison=spell.poison*s.damage;if(spell.slow)data.slow=spell.slow;
      const r=(family==='fireball'?.32:family==='dragon'?.23:family==='stars'?.26:.17)*scale;addShot('projectile',p.x,p.z,Math.sin(a)*profile.speed,Math.cos(a)*profile.speed,r,data,{angle:a});
    }
  }
  function updatePlayer(input){
    const p=state.player,result=stepMovement(p,state.stats,{...input,dash:pendingDash},{terrain:terrainAt,resolve:resolveCircle});pendingDash=false;
    if(result.dashed)effect('dash',p.x,p.z,1.15,.32,{angle:Math.atan2(p.dashX,p.dashZ)});
    if(result.previousTerrain!==undefined&&result.previousTerrain!==p.terrain)effect('terrain-entry',p.x,p.z,1,.55,{terrain:p.terrain,color:p.terrain==='ice'?'#b4e9ff':p.terrain==='mud'?'#ba9974':'#c9e5ac'});
    if(!state.rift.arenaActive){const biome=biomeAt(p.x,p.z);if(biome!==state.biome){state.biome=biome;say(state.biomes.find(b=>b.id===biome)?.name||biome,3.5);}}if(state.stats.regen>0)p.hp=Math.min(p.maxHp,p.hp+state.stats.regen*STEP);
  }
  function updateSpawns(){
    state.wave=1+Math.floor((state.t+1e-9)/60);updateRift();if(state.rift.arenaActive)return;
    const living=party(),director=pacing();
    if(!siegeWarned&&state.t>=nextSiegeAt-3){siegeWarned=true;say('La horde se rassemble tout autour. Garde une issue !',3.5);}
    if(state.t>=nextSiegeAt){
      const count=siegePerSide(state.t,director.players);
      for(let side=0;side<4;side++)for(let i=0;i<count;i++)spawnEnemy(i%3===2?'spitter':i%2?'runner':'slime',{side,focus:living[(side+i)%living.length],siege:true});
      nextSiegeAt=state.t+60;siegeWarned=false;
    }
    if(state.t+1e-9>=nextEliteAt){if(spawnEnemy('brute',{elite:true})){nextEliteAt=state.t+Math.max(48,78-state.t/40);say('Une élite approche. Attention à sa charge !');}else nextEliteAt=state.t+1;}
    spawnClock-=STEP;if(spawnClock>0)return;spawnClock+=cooperative?1/director.spawnRate:Math.max(.24,.68-state.t/1500);
    const batch=cooperative?1:Math.min(4,1+Math.floor(state.t/180));
    for(let n=0;n<batch;n++){const roll=random(),pressure=Math.min(.12,state.t/6000);let type=roll<.39-pressure?'slime':roll<.68-pressure?'runner':roll<.81?'wisp':roll<.93?'spitter':'brute';
      const focus=living[spawnNumber%living.length]||state.player,heading=Math.floor(spawnNumber/Math.max(1,living.length))%4;
      const x=Math.sin(focus.angle),z=Math.cos(focus.angle),front=Math.abs(x)>Math.abs(z)?(x<0?0:1):(z<0?2:3);
      const side=state.t<55?heading:heading===0?front:heading===3?front^1:(front<2?1:0)*2+heading-1;
      spawnNumber++;
      if(state.biome==='crystal'&&roll<.27)type='wisp';if(state.biome==='swamp'&&roll<.25)type='spitter';if(state.biome==='desert'&&roll<.19)type='brute';
      // Shooters enter ahead of the hero they hunt: they are met, not left behind.
      spawnEnemy(type,{side:type==='spitter'&&state.t>=55?front:side,focus});
    }
  }
  function riftPosition(){
    const p=state.player.hp>0?state.player:party()[0]||state.player,radius=PACING.riftRadius;
    const clear=(x,z)=>hypot(x,z)<=ARENA-radius-1&&nearbyObstacles(x,z).every(o=>hypot(x-o.x,z-o.z)>=o.radius+radius+.65)&&state.pois.every(poi=>hypot(x-poi.x,z-poi.z)>=radius+3)&&state.traps.every(trap=>hypot(x-trap.x,z-trap.z)>=radius+trap.radius+.5);
    for(let attempt=0;attempt<96;attempt++){const a=random()*TAU,d=12+random()*6,x=p.x+Math.sin(a)*d,z=p.z+Math.cos(a)*d;if(clear(x,z))return{x,z};}
    // A deterministic ring scan catches narrow clearings missed by random
    // samples. If every clearing is blocked, the offer still safely defers.
    const offset=random()*TAU;for(const d of[18,15,12])for(let i=0;i<48;i++){const a=offset+i*TAU/48,x=p.x+Math.sin(a)*d,z=p.z+Math.cos(a)*d;if(clear(x,z))return{x,z};}
    return null;
  }
  function scheduleRift(){state.nextRiftAt=state.t+PACING.riftCooldown;state.nextBossAt=state.nextRiftAt;}
  function removeRiftPoi(poiId){state.pois=state.pois.filter(poi=>poi.id!==poiId);state.mapPOIs=state.mapPOIs.filter(poi=>poi.id!==poiId);knownPOIs.delete(poiId);}
  function enterRiftArena(){
    if(state.rift.arenaActive||riftReturn)return false;
    pendingAttack=null;state.player.attack=null;
    riftReturn={enteredAt:state.t,currentChunkKey,biome:state.biome,player:{x:state.player.x,z:state.player.z,angle:state.player.angle},enemies:state.enemies,corpses:state.corpses,gems:state.gems,projectiles:state.projectiles,effects:state.effects,pois:state.pois,obstacles:state.obstacles,zones:state.zones,traps:state.traps,breakables:state.breakables,pickups:state.pickups,world:state.world,enemyMeta:new Map(enemyData),shotMeta:new Map(shotData)};
    state.rift.arenaActive=true;state.rift.deadlineAt=state.t+PACING.riftDuration;state.biome='rift';state.enemies=[];state.corpses=[];state.gems=[];state.projectiles=[];state.effects=[];state.pois=[];state.obstacles=[];state.zones=[];state.traps=[];state.breakables=[];state.pickups=[];state.interaction=null;
    enemyData.clear();shotData.clear();currentChunkKey='rift-arena';Object.assign(state.player,{x:0,z:0,vx:0,vz:0,angle:Math.PI,terrain:'normal',invuln:Math.max(2,state.player.invuln)});rebuildObstacles();state.worldRevision++;if(family==='orbit')refreshOrbits();
    effect('rift-enter',0,0,RIFT_ARENA_RADIUS,1.2,{color:'#be98ff',tier:state.rift.tier});say(`Salle de faille · palier ${state.rift.tier}. Bats le gardien, ou tombe et retourne sur l’île.`,5);return true;
  }
  function leaveRiftArena(){
    if(!riftReturn)return false;
    pendingAttack=null;state.player.attack=null;const back=riftReturn,duration=state.t-back.enteredAt;state.rift.arenaActive=false;state.enemies=back.enemies;state.corpses=back.corpses||[];state.gems=back.gems;state.projectiles=back.projectiles;state.effects=back.effects;state.pois=back.pois;state.obstacles=back.obstacles;state.zones=back.zones;state.traps=back.traps;state.breakables=back.breakables;state.pickups=back.pickups;state.world=back.world;state.biome=back.biome;currentChunkKey=back.currentChunkKey;enemyData.clear();for(const [key,value] of back.enemyMeta)enemyData.set(key,value);shotData.clear();for(const [key,value] of back.shotMeta)shotData.set(key,value);Object.assign(state.player,{x:back.player.x,z:back.player.z,angle:back.player.angle,vx:0,vz:0,terrain:'normal'});nextEliteAt+=duration;nextSiegeAt+=duration;spawnClock=Math.max(.15,spawnClock);riftReturn=null;rebuildObstacles();state.worldRevision++;return true;
  }
  function failRift(){
    const r=state.rift,poiId=r.poiId,tier=r.tier;leaveRiftArena();r.phase='failed';r.bossId=null;r.activation=0;r.reward=null;state.bossIncoming=false;removeRiftPoi(poiId);scheduleRift();state.player.hp=Math.max(1,state.player.maxHp*.35);state.player.invuln=3;effect('rift-failed',state.player.x,state.player.z,4,.9,{color:'#b798d8',tier});say(`Le gardien de palier ${tier} t’a repoussé. Tu reviens sur l’île avec 35 % de vie ; l’expédition continue.`,6);return true;
  }
  function updateRift(){
    let r=state.rift;
    if(r.phase==='won'&&state.t-r.completedAt>=8&&state.pois.some(p=>p.id===r.poiId))removeRiftPoi(r.poiId);
    if(['waiting','expired','won','failed'].includes(r.phase)&&state.nextRiftAt>0&&state.t+1e-9>=state.nextRiftAt&&state.t>=riftOfferRetryAt&&!state.enemies.some(e=>e.type==='boss'&&e.hp>0)){
      const pos=riftPosition();riftOfferRetryAt=state.t+1;
      if(pos){
        const tier=state.riftsCleared+1,offeredReward={...RIFT_RELICS[(tier-1)%RIFT_RELICS.length],tier},poi={id:id(),type:'portal',name:`Faille d’Azur · palier ${tier}`,...pos,biome:biomeAt(pos.x,pos.z),radius:PACING.riftRadius,dynamic:true,phase:'offer',tier,offerAt:state.t,expiresAt:state.t+PACING.riftOffer,activation:0,offeredReward:{...offeredReward},discovered:true,completed:false,progress:0,active:false,guardians:[],guardiansTotal:1,pendingGuardians:0,guardiansRemaining:0,spawnRetryAt:0,completedAt:-100};
        state.pois.push(poi);rememberPoi(poi);state.nextRiftAt=0;state.nextBossAt=0;r=state.rift={phase:'offer',poiId:poi.id,tier,offerAt:poi.offerAt,expiresAt:poi.expiresAt,activation:0,activationDuration:PACING.riftActivation,bossId:null,completedAt:0,offeredReward,reward:null};
        effect('rift-open',poi.x,poi.z,PACING.riftRadius,1.2,{color:'#be98ff',tier,poiId:poi.id});say(`Une faille de palier ${tier} s’ouvre ! Défi facultatif : reste 2 secondes dans son cercle pour accepter.`,6);
      }
    }
    const poi=(riftReturn?.pois||state.pois).find(p=>p.id===r.poiId);
    if(poi&&['offer','activating'].includes(r.phase)){
      if(state.t+1e-9>=r.expiresAt){r.phase='expired';r.activation=0;poi.phase='expired';removeRiftPoi(poi.id);scheduleRift();say('La faille s’est refermée. Ton exploration continue.',3.5);}
      else{
        const inside=cooperative?party().some(p=>hypot(p.x-poi.x,p.z-poi.z)<PACING.riftRadius):hypot(state.player.x-poi.x,state.player.z-poi.z)<PACING.riftRadius;
        r.activation=inside?Math.min(1,r.activation+STEP/PACING.riftActivation):0;r.phase=inside?'activating':'offer';poi.phase=r.phase;poi.activation=r.activation;poi.progress=r.activation;
        if(r.activation>=1-1e-9){r.activation=poi.activation=1;r.phase=poi.phase='incoming';poi.active=true;poi.pendingGuardians=poi.guardiansRemaining=1;poi.progress=0;effect('rift-start',poi.x,poi.z,5,1,{color:'#ffb5df',tier:r.tier,poiId:poi.id});enterRiftArena();}
      }
    }
    if(poi&&r.phase==='incoming'&&state.t>=poi.spawnRetryAt){
      poi.spawnRetryAt=state.t+.5;const boss=spawnEnemy('boss',{poiId:poi.id,bossKind:`${poi.biome}-rift`,bossTier:r.tier});
      if(boss){r.bossId=boss.id;r.phase=poi.phase='active';poi.pendingGuardians=0;poi.guardians=[boss.id];}
    }
    if(riftReturn&&state.t-riftReturn.enteredAt>=PACING.riftDuration){
      failRift();
      say('La faille s’est refermée. L’expédition reprend sur l’île.',4.5);
      return;
    }
    if(poi&&r.phase==='active'){const boss=state.enemies.find(e=>e.id===r.bossId);if(boss)poi.progress=clamp(1-boss.hp/boss.maxHp,0,1);}
    state.bossIncoming=r.phase==='incoming';state.nextBossAt=state.nextRiftAt;
  }
  function completeRift(boss){
    if(cooperative?.completeBoss)return cooperative.completeBoss(boss);const r=state.rift;if(r.phase!=='active'||r.bossId!==boss.id||r.reward)return false;
    const reward={...RIFT_RELICS[(r.tier-1)%RIFT_RELICS.length],tier:r.tier};leaveRiftArena();r.phase='won';r.reward=reward;r.completedAt=state.t;state.riftsCleared++;state.relics.push({...reward});state.stats[reward.stat]+=reward.value;state.chestsOpened++;state.bossIncoming=false;scheduleRift();
    const poi=state.pois.find(p=>p.id===r.poiId);if(poi){poi.phase='won';poi.active=false;poi.completed=true;poi.completedAt=state.t;poi.progress=1;poi.guardiansRemaining=poi.pendingGuardians=0;}
    queueUpgrade({kind:'rift',title:`Faille vaincue · palier ${r.tier}`,tier:r.tier,minimumRarity:'rare',reward:{...reward}});heal(25);
    effect('rift-victory',state.player.x,state.player.z,7,1.3,{color:'#fff0a4',tier:r.tier,poiId:r.poiId});effect('nova',state.player.x,state.player.z,7,.65,{color:'#fff0a4'});say(`Gardien vaincu ! Retour sur l’île avec ${reward.title}, un pouvoir rare et 25 PV.`,5.5);return true;
  }
  function enemyShoot(e,data,radial=false){
    const look=radial?guardianShot(e.speciesId):shooterShot(e.speciesId),growth=Math.min(9,Math.max(0,(e.bossTier||1)-1)),n=radial?Math.min(18,8+growth*2):look.count,speed=radial?8+Math.min(2,growth*.22):look.speed,radius=radial?.25:look.radius,life=radial?3:SHOT_RANGE/speed;
    for(let i=0;i<n;i++){const a=radial?i*TAU/n+state.t*.11:Math.atan2(data.chargeX,data.chargeZ)+(i-(n-1)/2)*look.spread;addShot('projectile',e.x,e.z,Math.sin(a)*speed,Math.cos(a)*speed,radius,{life,damage:data.damage,pierce:0},{hostile:true,family:look.family,style:look.style,color:look.color,angle:a,until:state.t+life});}
  }
  function updateEnemies(){
    const living=party(),views=cooperative?.views?.(),rules=rangedRules(),windups=new Map();
    for(const e of state.enemies)if(e.type==='spitter'&&e.telegraph>0){const target=metadata(e).target;windups.set(target,(windups.get(target)||0)+1);}
    for(const e of state.enemies){
      const p=living.reduce((best,player)=>!best||distance2(e,player)<distance2(e,best)?player:best,null)||state.player;
      if(e.hp<=0)continue;const data=metadata(e);e.hitFlash=Math.max(0,finite(e.hitFlash)-STEP);
      if(data.poison>0){data.poison=Math.max(0,data.poison-STEP);hurtEnemy(e,data.poisonPower*STEP,{proc:false,critical:false,silent:true});if(e.hp<=0)continue;}
      data.slow=Math.max(0,data.slow-STEP);e.slowed=data.slow>0;
      const dx=p.x-e.x,dz=p.z-e.z,d=hypot(dx,dz)||1;
      // Abandoned enemies must release the spawn budget. Camp defenders can
      // return when players come back, without counting as defeated. A shooter
      // left far behind every view frees its place sooner, so the few allowed stay near the heroes.
      if((d>65||e.type==='spitter'&&state.t-e.spawnAt>6&&outsideView(e.x,e.z,e.radius+10))&&e.type!=='boss'&&e.telegraph<=0&&outsideView(e.x,e.z,e.radius)){
        if(data.poiId){
          const camp=state.pois.find(poi=>poi.id===data.poiId);
          if(camp&&!camp.completed){
            const index=camp.guardians.indexOf(e.id);
            if(index!==-1){camp.guardians.splice(index,1);camp.pendingGuardians++;}
          }
        }
        e.despawned=true;
        continue;
      }
      let vx=dx/d,vz=dz/d,speed=data.speed*(data.slow>0?.58:1);data.chargeCD-=STEP;data.shootCD-=STEP;data.recover=Math.max(0,data.recover-STEP);
      e.gaitPhase=state.t*(e.type==='runner'?12:e.type==='slime'?7.85:e.type==='brute'?5:7)+e.id*.71;e.hop=0;e.action='move';
      const ready=data.chargeTime<=0&&e.telegraph<=0&&data.recover<=0,bossGrowth=Math.min(9,Math.max(0,(e.bossTier||1)-1));
      if(e.type==='boss'&&data.shootCD<=0&&d<17&&ready){e.telegraph=.58;e.telegraphDuration=.58;data.action='radial';data.shootCD=6.2-Math.min(2,bossGrowth*.25);data.chargeX=dx/d;data.chargeZ=dz/d;}
      else if((e.type==='brute'||e.type==='boss')&&data.chargeCD<=0&&d>3&&d<15&&ready){e.telegraph=e.type==='boss'?.48:.38;e.telegraphDuration=e.telegraph;data.action='charge';data.chargeX=dx/d;data.chargeZ=dz/d;e.angle=Math.atan2(data.chargeX,data.chargeZ);data.chargeCD=e.type==='boss'?4.6-Math.min(1.4,bossGrowth*.18):5.5;}
      else if(e.type==='spitter'&&data.shootCD<=0&&d<15&&ready&&canVolley(e,p,views,rules,windups)){const look=shooterShot(e.speciesId),target=p.playerId??'solo';e.telegraph=look.windup;e.telegraphDuration=look.windup;e.shotCount=look.count;data.action='shoot';data.target=target;data.chargeX=dx/d;data.chargeZ=dz/d;e.angle=Math.atan2(data.chargeX,data.chargeZ);data.shootCD=look.cooldown;volleyAt.set(target,state.t);windups.set(target,(windups.get(target)||0)+1);}
      e.attackKind=data.action;e.attackAngle=Math.atan2(data.chargeX,data.chargeZ);
      if(e.telegraph>0){
        e.action='windup';e.telegraph=Math.max(0,e.telegraph-STEP);speed*=(data.action==='shoot'||data.action==='radial')?.82:.28;
        if(e.telegraph===0){
          if(data.action==='shoot'||data.action==='radial'){enemyShoot(e,data,data.action==='radial');e.action='shoot';data.recover=data.action==='radial'?.55:.28;}
          else data.chargeTime=e.type==='boss'?.62:.5;
        }
      }else if(data.chargeTime>0){
        e.action='charge';data.chargeTime=Math.max(0,data.chargeTime-STEP);vx=data.chargeX;vz=data.chargeZ;speed=e.type==='boss'?14.5+Math.min(2,bossGrowth*.2):13;if(data.chargeTime===0)data.recover=e.type==='boss'?.6:.48;
      }else if(data.recover>0){e.action='recover';speed*=(data.action==='shoot'||data.action==='radial')?.76:.28;}
      else{
        if(e.type==='slime'){
          const cycle=(state.t*1.25+e.id*.137)%1,airborne=cycle<.62;e.hop=airborne?Math.sin(cycle/.62*Math.PI)*.46:0;speed*=airborne?1.1:.82;
        }else if(e.type==='runner'){
          const flank=d>4?data.turn*Math.min(.65,(d-4)*.07)+Math.sin(state.t*2.1+e.id)*.24:Math.sin(state.t*3+e.id)*.1;
          vx+=-dz/d*flank+p.vx*.025;vz+=dx/d*flank+p.vz*.025;speed*=1+.035*Math.sin(e.gaitPhase*.25)**2;
        }else if(e.type==='wisp'){
          const drift=Math.sin(state.t*1.7+e.id*.6)*.68+(d<10?data.turn*.15:0);vx+=-dz/d*drift;vz+=dx/d*drift;e.hop=.22+Math.sin(state.t*3+e.id)*.13;
        }else if(e.type==='spitter'){
          // Shooters hold a firing spot about nine paces away, inside their target's view.
          const view=heroView(p,views),sx=clamp(p.x-dx/d*9.5,view.minX+2,view.maxX-2),sz=clamp(p.z-dz/d*9.5,view.minZ+2,view.maxZ-7),tx=sx-e.x,tz=sz-e.z,td=hypot(tx,tz);
          if(td>1.2){vx=tx/td;vz=tz/td;speed*=td>8?1.3:td>4?1:.6;}else{vx=-dz/d*data.turn;vz=dx/d*data.turn;speed*=.36;}
        }else if(e.type==='brute'){speed*=.91+.09*Math.sin(e.gaitPhase)**2;}
        for(const o of nearbyObstacles(e.x,e.z)){const ox=e.x-o.x,oz=e.z-o.z,zone=o.radius+e.radius+1.4;if(ox*ox+oz*oz>=zone*zone)continue;const od=hypot(ox,oz);if(od<zone&&od>1e-4){const strength=(zone-od)/1.4;vx+=ox/od*strength*1.6+oz/od*data.turn*strength;vz+=oz/od*strength*1.6-ox/od*data.turn*strength;}}
        const v=hypot(vx,vz)||1;vx/=v;vz/=v;e.angle=Math.atan2(vx,vz);
      }
      e.terrain=terrainAt(e.x,e.z);if(e.terrain==='mud')speed*=.62;const desiredX=vx*speed+data.knockX,desiredZ=vz*speed+data.knockZ;if(e.terrain==='ice'&&e.action==='move'){const steer=1-Math.exp(-4.5*STEP);e.vx=finite(e.vx)+(desiredX-finite(e.vx))*steer;e.vz=finite(e.vz)+(desiredZ-finite(e.vz))*steer;}else{e.vx=desiredX;e.vz=desiredZ;}e.moveSpeed=hypot(e.vx,e.vz);e.x+=e.vx*STEP;e.z+=e.vz*STEP;data.knockX*=.82;data.knockZ*=.82;
      if(resolveCircle(e)&&data.chargeTime>0){data.chargeTime=0;data.recover=.8;}
    }
    separateEnemies();
  }
  function separateEnemies(){
    const cell=1.6,bins=new Map();let largest=0;
    for(let i=0;i<state.enemies.length;i++){
      const e=state.enemies[i];if(e.hp<=0)continue;largest=Math.max(largest,e.radius);
      const key=`${Math.floor(e.x/cell)},${Math.floor(e.z/cell)}`;let bucket=bins.get(key);if(!bucket){bucket=[];bins.set(key,bucket);}bucket.push(i);
    }
    for(let i=0;i<state.enemies.length;i++){
      const a=state.enemies[i];if(a.hp<=0)continue;
      const cx=Math.floor(a.x/cell),cz=Math.floor(a.z/cell),reach=Math.max(1,Math.ceil((a.radius+largest)*.92/cell));
      for(let ox=-reach;ox<=reach;ox++)for(let oz=-reach;oz<=reach;oz++)for(const j of bins.get(`${cx+ox},${cz+oz}`)||EMPTY_LIST){
        if(j<=i)continue;const b=state.enemies[j],dx=b.x-a.x,dz=b.z-a.z,min=(a.radius+b.radius)*.92;
        if(dx*dx+dz*dz>=min*min)continue;const d=hypot(dx,dz);if(d>=min)continue;
        const nx=d>1e-5?dx/d:1,nz=d>1e-5?dz/d:0,push=Math.min(.12,(min-d)*.35),share=b.radius*b.radius/(a.radius*a.radius+b.radius*b.radius);
        a.x-=nx*push*share;a.z-=nz*push*share;b.x+=nx*push*(1-share);b.z+=nz*push*(1-share);
      }
      resolveCircle(a);
    }
  }
  function updateProjectiles(filter='all'){
    if(family==='orbit')positionOrbits();const alive=[];
    for(const shot of state.projectiles){
      if(filter==='hostile'&&!shot.hostile||filter==='friendly'&&shot.hostile){alive.push(shot);continue;}
      const data=shotData.get(shot.id);if(!data)continue;data.age+=STEP;data.life-=STEP;
      if(shot.type==='orbit'){
        for(const e of targetsNear(state.player.x,state.player.z,orbitRadius+shot.radius+1)){
          if(e.hp<=0||distance2(e,shot)>(e.radius+shot.radius)**2)continue;
          const info=e.breakable?e:metadata(e),hitKey=cooperative?'orbitNextHit:'+cooperative.actorId:'orbitNextHit';
          if(state.t>=finite(info[hitKey])){info[hitKey]=state.t+profile.cooldown/state.stats.cadence;hurtEnemy(e,profile.damage*state.stats.damage,{knock:1.2,slow:spell.slow,from:shot});state.attackCount++;}
        }
        alive.push(shot);continue;
      }
      if(shot.type==='wave'){if(data.delay>0){data.delay-=STEP;alive.push(shot);continue;}if(data.travel){shot.x+=shot.vx*STEP;shot.z+=shot.vz*STEP;}shot.radius=Math.min(data.travel?data.maxRadius:Infinity,shot.radius+data.expansion*STEP);for(const e of targetsNear(shot.x,shot.z,shot.radius+1))if(e.hp>0&&!data.hit.has(e.id)&&Math.abs(hypot(e.x-shot.x,e.z-shot.z)-shot.radius)<=e.radius+.48*state.stats.area){data.hit.add(e.id);hurtEnemy(e,data.damage,{from:shot,knock:4,slow:data.slow});}if((data.travel||shot.radius<data.maxRadius)&&data.life>0)alive.push(shot);else shotData.delete(shot.id);continue;}
      if(shot.type==='mine'){data.arm=Math.max(0,data.arm-STEP);const trigger=1.25*state.stats.area,target=data.arm<=0&&targetsNear(shot.x,shot.z,trigger+1).some(e=>e.hp>0&&distance2(e,shot)<=(trigger+e.radius)**2);if(target){explosion(shot.x,shot.z,data.explosionRadius,data.damage,shot.color,{poison:data.poison,slow:data.slow});shotData.delete(shot.id);}else if(data.life>0)alive.push(shot);else shotData.delete(shot.id);continue;}
      if(shot.type==='vortex'){data.tick-=STEP;shot.angle+=STEP*4*state.stats.cadence;for(const e of targetsNear(shot.x,shot.z,shot.radius+1)){if(e.hp<=0||distance2(e,shot)>(shot.radius+e.radius)**2)continue;const info=e.breakable?null:metadata(e),dx=shot.x-e.x,dz=shot.z-e.z,d=hypot(dx,dz)||1;if(info&&d>.45){const force=(e.type==='boss'?.4:3)*(data.pull??1)*state.stats.knockback;info.knockX+=dx/d*force*STEP*12;info.knockZ+=dz/d*force*STEP*12;}if(data.tick<=0)hurtEnemy(e,data.damage*(data.firstPulse?2:1),{from:shot,knock:0,poison:data.poison,slow:data.slow});}if(data.tick<=0){data.firstPulse=false;data.tick+=data.tickInterval;}if(data.life>0)alive.push(shot);else shotData.delete(shot.id);continue;}
      if(data.homing){const target=nearestTarget(shot.x,shot.z,14);if(target){const dx=target.x-shot.x,dz=target.z-shot.z,d=hypot(dx,dz)||1,blend=1-Math.exp(-7*STEP),speed=profile.speed*state.stats.velocity;shot.vx+=(dx/d*speed-shot.vx)*blend;shot.vz+=(dz/d*speed-shot.vz)*blend;}}
      if(data.boomerang&&data.age>data.turnAt){if(!data.returning){data.returning=true;data.hit.clear();}const dx=state.player.x-shot.x,dz=state.player.z-shot.z,d=hypot(dx,dz)||1;const speed=profile.speed*1.2*state.stats.velocity;shot.vx=dx/d*speed;shot.vz=dz/d*speed;if(d<.5)data.life=0;}
      const oldX=shot.x,oldZ=shot.z;shot.x+=shot.vx*STEP;shot.z+=shot.vz*STEP;shot.angle=Math.atan2(shot.vx,shot.vz);
      if(data.lob){shot.y=.7+Math.sin(clamp(data.age/data.flight,0,1)*Math.PI)*3.5;if(data.life<=0){explosion(shot.x,shot.z,data.explosionRadius,data.damage,shot.color,{poison:data.poison,slow:data.slow});shotData.delete(shot.id);}else alive.push(shot);continue;}
      let remove=data.life<=0||shot.hostile&&outsideProjectileView(shot.x,shot.z,shot.radius)||hypot(shot.x,shot.z)>ARENA+2;
      if(shot.hostile){if(cooperative){const victim=party().filter(p=>segmentDistanceSq(p.x,p.z,oldX,oldZ,shot.x,shot.z)<(p.radius+shot.radius)**2).sort((a,b)=>distance2(a,{x:oldX,z:oldZ})-distance2(b,{x:oldX,z:oldZ}))[0];if(victim){cooperative.hurtPlayer(victim.playerId,data.damage,shot.x,shot.z);remove=true;}}else if(segmentDistanceSq(state.player.x,state.player.z,oldX,oldZ,shot.x,shot.z)<(state.player.radius+shot.radius)**2){hurtPlayer(data.damage,shot.x,shot.z);remove=true;}}
      else{const hits=[];for(const e of targetsNear(shot.x,shot.z,2))if(e.hp>0&&!data.hit.has(e.id)&&segmentDistanceSq(e.x,e.z,oldX,oldZ,shot.x,shot.z)<=(e.radius+shot.radius)**2)hits.push(e);hits.sort((a,b)=>(a.x-oldX)**2+(a.z-oldZ)**2-((b.x-oldX)**2+(b.z-oldZ)**2));for(const e of hits){data.hit.add(e.id);if(data.explosionRadius){explosion(shot.x,shot.z,data.explosionRadius,data.damage,shot.color,{poison:data.poison,slow:data.slow});remove=true;break;}hurtEnemy(e,data.damage,{from:shot,knock:.8,poison:data.poison||0,slow:data.slow||0});if(data.pierce<=0){remove=true;break;}data.pierce--;}}
      if(remove)shotData.delete(shot.id);else alive.push(shot);
    }
    state.projectiles=alive;
  }
  function updateInteraction(){
    let chosen=null,best=Infinity;const p=state.player;
    for(const poi of state.pois){
      if(!poi.discovered)continue;const d=hypot(p.x-poi.x,p.z-poi.z),guide=POI_GUIDE[poi.type];if(!guide)continue;
      const inside=d<guide.radius,recent=poi.completed&&state.t-poi.completedAt<3;
      if(poi.completed&&!recent||d>(poi.active&&!poi.completed?32:16))continue;
      const score=d-(inside&&!poi.completed?100:recent&&d<5?70:poi.active?8:0);if(score>=best)continue;best=score;
      let action=guide.action,detail=guide.detail;
      if(poi.completed){action='Accompli';detail='Récompense récupérée. Une autre découverte t’attend.';}
      else if(poi.type==='shrine'){if(inside)action='Reste dans le cercle';else if(poi.progress>0)action='Reviens dans le cercle';}
      else if(poi.type==='well'&&p.hp>=p.maxHp-.1){action='Ta vie est pleine';detail='La source reste disponible. Reviens après avoir été blessé.';}
      else if(poi.type==='portal'){
        if(poi.phase==='incoming'){action='Le gardien approche';detail='Défi accepté. Prépare-toi : tu peux te déplacer librement.';}
        else if(poi.phase==='active'){action=`Terrasse le gardien · palier ${poi.tier}`;detail='Bats le gardien pour obtenir sa relique et un pouvoir rare ou mieux.';}
        else if(inside){action='Reste dans le cercle pour accepter';detail='Sors du cercle pour annuler. Le défi reste entièrement facultatif.';}
      }
      else if(poi.type==='camp'&&poi.active){action=`Bats les sentinelles · ${poi.guardiansRemaining} restantes`;detail=poi.pendingGuardians>0?'Les sentinelles approchent. Prépare-toi à défendre ta position.':guide.detail;}
      chosen={poiId:poi.id,type:poi.type,title:poi.name,action,detail,reward:poi.offeredReward?`${poi.offeredReward.description} · pouvoir rare ou mieux · +25 PV · trésor`:guide.reward,danger:guide.danger,distance:d,progress:clamp(poi.progress,0,1),inside,active:poi.active,completed:poi.completed,remaining:poi.type==='shrine'?Math.max(0,(1-poi.progress)*6):poi.type==='portal'&&['offer','activating'].includes(poi.phase)?Math.max(0,(1-poi.activation)*PACING.riftActivation):0,guardiansRemaining:poi.guardiansRemaining||0,guardiansTotal:poi.guardiansTotal||0,...(poi.type==='portal'?{phase:poi.phase,tier:poi.tier,expiresAt:poi.expiresAt,activation:poi.activation}:{} )};
    }
    state.interaction=chosen;
  }
  function updatePOIs(){
    const p=state.player;
    for(const poi of state.pois){
      const nearest=cooperative?party().reduce((best,q)=>!best||distance2(q,poi)<distance2(best,poi)?q:best,null)||p:p,d=hypot(nearest.x-poi.x,nearest.z-poi.z);if(!poi.discovered&&d<15){poi.discovered=true;rememberPoi(poi);state.discovered++;if(state.t>1.5)say(`Découverte · ${poi.name}`);}if(poi.completed)continue;
      if(poi.type==='chest'&&d<1.7){poi.completed=true;poi.completedAt=state.t;poi.progress=1;state.chestsOpened++;queueUpgrade({kind:'chest',title:poi.name,poiId:poi.id});heal(12);effect('chest',poi.x,poi.z,2.2,.65,{color:'#ffdf79'});say('Trésor ouvert : un pouvoir, 12 PV et des gains pour le camp !');}
      else if(poi.type==='well'&&d<1.8&&nearest.hp<nearest.maxHp-.1){poi.completed=true;poi.completedAt=state.t;poi.progress=1;if(cooperative&&nearest!==p)nearest.hp=Math.min(nearest.maxHp,nearest.hp+nearest.maxHp*.4);else heal(p.maxHp*.4);say('Source de vie : 40 % des PV maximum restaurés.');}
      else if(poi.type==='shrine'){
        if(d<3.3){poi.progress=Math.min(1,poi.progress+STEP/6);if(!poi.active){poi.active=true;for(let i=0;i<3;i++)spawnEnemy(i===2?'runner':'slime');say('Sanctuaire : reste 6 secondes dans le cercle. Tu peux esquiver à l’intérieur.',5);}}else if(poi.progress>0)poi.progress=Math.max(0,poi.progress-STEP/18);
        if(poi.progress>=1){poi.completed=true;poi.completedAt=state.t;queueUpgrade({kind:'shrine',title:'Sanctuaire éveillé',poiId:poi.id});heal(10);effect('nova',poi.x,poi.z,5,.65,{color:'#a6e5ff'});say('Sanctuaire éveillé : un pouvoir et 10 PV !');}
      }else if(poi.type==='camp'&&poi.discovered){
        if(!poi.active&&d<9){
          poi.active=true;poi.guardiansTotal=4;poi.pendingGuardians=poi.guardiansTotal;poi.guardiansRemaining=poi.guardiansTotal;
          say('Camp alerté ! Quatre sentinelles approchent. Bats-les pour gagner un pouvoir.',5);
        }
        if(poi.active&&poi.pendingGuardians>0&&d<15&&state.t>=poi.spawnRetryAt){
          poi.spawnRetryAt=state.t+.5;
          while(poi.pendingGuardians>0){
            const first=poi.guardians.length===0,type=first?'brute':'runner';
            const e=spawnEnemy(type,{elite:first,poiId:poi.id});if(!e)break;poi.guardians.push(e.id);poi.pendingGuardians--;
          }
        }
        if(poi.active){
          const alive=poi.guardians.filter(enemyId=>state.enemies.some(e=>e.id===enemyId&&e.hp>0));poi.guardiansRemaining=alive.length+poi.pendingGuardians;poi.progress=poi.guardiansTotal?1-poi.guardiansRemaining/poi.guardiansTotal:0;
          if(poi.guardians.length&&poi.pendingGuardians===0&&alive.length===0){poi.completed=true;poi.completedAt=state.t;poi.progress=1;queueUpgrade({kind:'camp',title:'Camp libéré',poiId:poi.id});state.chestsOpened++;heal(15);effect('chest',poi.x,poi.z,3.2,.8,{color:'#ffdf79'});say('Camp libéré ! Trésor, 15 PV et un pouvoir.',4.5);}
        }
      }
    }
    updateInteraction();
  }
  function updateTraps(){
    for(const trap of state.traps){
      const duration=trap.phase==='warning'?trap.warningDuration:trap.phase==='active'?trap.activeDuration:trap.phase==='cooldown'?trap.cooldownDuration:0;
      if(trap.phase==='idle'){
        const near=party().some(p=>distance2(trap,p)<(trap.radius+1.2)**2)||state.enemies.some(e=>e.hp>0&&distance2(e,trap)<(trap.radius+e.radius*.6)**2);
        if(near){trap.phase='warning';trap.phaseTime=0;trap.phaseDuration=trap.warningDuration;trap.phaseProgress=0;trap.hitIds=[];state.trapsTriggered++;effect('trap-warning',trap.x,trap.z,trap.radius,trap.warningDuration,{trapId:trap.id,color:'#ffbf6b'});}continue;
      }
      trap.phaseTime+=STEP;trap.phaseDuration=duration;trap.phaseProgress=clamp(trap.phaseTime/Math.max(.001,duration),0,1);
      if(trap.phaseTime+1e-9>=duration){trap.phase=trap.phase==='warning'?'active':trap.phase==='active'?'cooldown':'idle';trap.phaseTime=0;trap.phaseProgress=0;trap.phaseDuration=trap.phase==='active'?trap.activeDuration:trap.phase==='cooldown'?trap.cooldownDuration:0;}
      if(trap.phase!=='active')continue;
      for(const enemy of state.enemies)if(enemy.hp>0&&!trap.hitIds.includes(enemy.id)&&distance2(enemy,trap)<(trap.radius+enemy.radius*.6)**2){trap.hitIds.push(enemy.id);const damage=Math.min(enemy.hp,35);hurtEnemy(enemy,35,{critical:false,proc:false,knock:0,from:trap});effect('trap-hit',enemy.x,enemy.z,enemy.radius,.32,{trapId:trap.id,targetId:enemy.id,amount:damage,color:'#ffe0a5'});}
      if(!cooperative&&!trap.hitIds.includes('player')&&distance2(state.player,trap)<(trap.radius+state.player.radius*.5)**2){const damage=hurtPlayer(12,trap.x,trap.z);if(damage){trap.hitIds.push('player');effect('trap-hit',state.player.x,state.player.z,1,.35,{trapId:trap.id,targetId:'player',amount:damage,color:'#ff9e83'});}}
      if(state.phase!=='playing')return;
    }
  }
  function collectPickups(){const p=state.player,kept=[];for(const pickup of state.pickups){if(pickup.collected)continue;const d=hypot(p.x-pickup.x,p.z-pickup.z);if(p.hp<p.maxHp-.1){if(d<1.2){const before=p.hp;heal(pickup.value);pickup.collected=true;const amount=p.hp-before;state.healingCollected+=amount;effect('pickup-heal',pickup.x,pickup.z,1,.55,{amount,color:'#a8f4b2'});continue;}if(d<3){const move=Math.min(d,7*STEP);pickup.x+=(p.x-pickup.x)/d*move;pickup.z+=(p.z-pickup.z)/d*move;}}kept.push(pickup);}state.pickups=kept;}
  function queueLevelUps(){while(state.xp>=state.nextXP){state.xp-=state.nextXP;state.level++;const growth=state.level-2;state.nextXP=74+growth*29+growth*growth*6;queueUpgrade({kind:'level',title:`Niveau ${state.level}`,level:state.level});}}
  function collectXP(){
    const p=state.player,kept=[];
    for(const gem of state.gems){
      if(gem.collected||!Number.isFinite(gem.x)||!Number.isFinite(gem.z)||!Number.isFinite(gem.value)||gem.value<=0)continue;
      if(!experienceReady(gem,state.t)){kept.push(gem);continue;}
      const dx=p.x-gem.x,dz=p.z-gem.z,d=hypot(dx,dz);
      if(d<p.radius+.4){const gained=gem.value*state.stats.xpGain;if(cooperative?.onXP)cooperative.onXP(gem.value);else{state.xp+=gained;state.collected+=gained;}gem.collected=true;xpFeedback+=gained;}
      else{if(d<state.stats.pickupRadius){const move=Math.min(d,(11+(state.stats.pickupRadius-d)*2.5)*STEP);gem.x+=dx/d*move;gem.z+=dz/d*move;}kept.push(gem);}
    }
    state.gems=kept;
    if(xpFeedback>0&&state.t>=xpFeedbackAt){effect('xp-pickup',p.x,p.z,.6,.65,{amount:xpFeedback,color:'#6de8ff'});xpFeedback=0;xpFeedbackAt=state.t+.15;}
    queueLevelUps();
  }
  function tick(input){
    if(state.player.hp<=0){if(state.rift.arenaActive)failRift();else finish('death');return;}ticks++;state.t=ticks*STEP;streamWorld();if(indexedObstacles!==state.obstacles||indexedZones!==state.zones||indexedProps!==state.breakables)rebuildObstacles();updatePlayer(input);if(streamWorld())resolveCircle(state.player);else refreshOverflowGems();updateSpawns();updateTraps();if(state.phase!=='playing')return;updateEnemies();updateWeapons();if(state.phase==='playing')updateProjectiles();if(state.player.invuln<=0&&state.phase==='playing')for(const e of state.enemies)if(e.hp>0&&distance2(e,state.player)<(e.radius+state.player.radius)**2){hurtPlayer(metadata(e).damage,e.x,e.z);break;}
    state.corpses=state.corpses.filter(c=>state.t-c.diedAt<CORPSE_LIFETIME);state.enemies=state.enemies.filter(e=>{if(e.hp>0&&!e.despawned&&Number.isFinite(e.x)&&Number.isFinite(e.z))return true;enemyData.delete(e.id);return false;});if(propsDirty){state.breakables=state.breakables.filter(p=>!p.broken);propsDirty=false;rebuildObstacles();}for(const prop of state.breakables)prop.hitFlash=Math.max(0,prop.hitFlash-STEP);if(state.phase==='playing'){collectXP();collectPickups();updatePOIs();openUpgrade();}for(const fx of state.effects)fx.life-=STEP;state.effects=state.effects.filter(fx=>fx.life>0);state.messageTime=Math.max(0,state.messageTime-STEP);
  }
  function start(){resetInternals();Object.assign(state,makeState());rebuildObstacles();state.phase='playing';if(family==='orbit')refreshOrbits();for(let i=0;i<openingCount();i++)spawnEnemy('slime',{initial:true,initialIndex:i});updateInteraction();return state;}
  function step(dt=STEP,input={}){if(state.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return state;pendingDash||=Boolean(input?.dash);accumulator=Math.min(accumulator+Math.min(dt,.1),.1);let steps=0;while(accumulator+1e-10>=STEP&&state.phase==='playing'&&steps<6){accumulator=Math.max(0,accumulator-STEP);tick(input);steps++;}return state;}
  function pause(){if(state.phase!=='playing'&&state.phase!=='upgrade')return false;pausedFrom=state.phase;state.phase='paused';pendingDash=false;return true;}
  function resume(){if(state.phase!=='paused')return false;state.phase=pausedFrom;return true;}
  function extract(){return finish('extracted');}
  function snapshot(){const round=n=>Math.round(finite(n)*1000)/1000;return{
    phase:state.phase,runId:state.runId,seed:state.seed,heroId:state.heroId,heroLevel:state.heroLevel,baseStats:{...state.baseStats,trait:{...state.baseStats.trait}},attackFamily:family,t:round(state.t),wave:state.wave,bossesDefeated:state.bossesDefeated,biome:state.biome,nextBossAt:state.nextBossAt,nextRiftAt:state.nextRiftAt,coinMultiplier:state.stats.coinMultiplier,rift:{...state.rift,offeredReward:{...state.rift.offeredReward},reward:state.rift.reward?{...state.rift.reward}:null},riftsCleared:state.riftsCleared,relics:state.relics.map(r=>({...r})),upgradeSource:state.upgradeSource?{...state.upgradeSource}:null,
    kills:state.kills,collected:state.collected,level:state.level,xp:state.xp,nextXP:state.nextXP,rerolls:state.rerolls,player:Object.fromEntries(Object.entries(state.player).map(([k,v])=>[k,typeof v==='number'?round(v):v&&typeof v==='object'?{...v}:v])),stats:{...state.stats},
    world:{...state.world,activeChunks:state.world.activeChunks.map(c=>({...c})),visitedChunks:state.world.visitedChunks.map(c=>({...c}))},worldRevision:state.worldRevision,propsBroken:state.propsBroken,trapsTriggered:state.trapsTriggered,healingCollected:round(state.healingCollected),breakables:state.breakables.length,pickups:state.pickups.length,enemies:state.enemies.length,gems:state.gems.length,projectiles:state.projectiles.length,effects:state.effects.length,bossHP:state.enemies.filter(e=>e.type==='boss').reduce((sum,e)=>sum+e.hp,0),discovered:state.discovered,chestsOpened:state.chestsOpened,discoveriesTotal:state.pois.length,completedPOIs:state.pois.filter(p=>p.completed).length,outcome:state.outcome,
    offers:state.offers.map(o=>o.id),upgrades:state.upgrades.map(u=>({...u})),damageDealt:round(state.damageDealt),attackCount:state.attackCount,criticalHits:state.criticalHits,evolved:state.evolved,pendingUpgrades:pendingUpgrades.length,message:state.message
  };}
  const coop=cooperative?{
    get worldData(){return worldData;},get enemyData(){return enemyData;},addGem,completeRift,failRift,hurtPlayer,
    syncWorld(root){
      worldData=root.coop.worldData;cooperative.enemyData=root.coop.enemyData;
      for(const key of ['enemies','corpses','gems','obstacles','zones','traps','breakables','pickups','pois','mapPOIs','world','rift','arenaRadius','worldRevision','nextRiftAt','nextBossAt'])state[key]=root.state[key];
      state.t=root.state.t;state.biome=state.rift.arenaActive?'rift':biomeAt(state.player.x,state.player.z);rebuildObstacles();
    },
    worldTick(time){
      state.t=time;ticks=Math.round(time/STEP);if(!streamWorld())refreshOverflowGems();rebuildObstacles();updateSpawns();updateTraps();updateEnemies();updateProjectiles('hostile');
      state.corpses=state.corpses.filter(c=>state.t-c.diedAt<CORPSE_LIFETIME);state.enemies=state.enemies.filter(e=>{if(e.hp>0&&!e.despawned)return true;enemyData.delete(e.id);return false;});
      for(const prop of state.breakables)prop.hitFlash=Math.max(0,(prop.hitFlash||0)-STEP);
    },
    actorTick(input,time){
      state.t=time;state.phase='playing';pendingDash||=Boolean(input?.dash);
      if(state.player.hp>0){updatePlayer(input||{});updateWeapons();}
      else{state.projectiles=state.projectiles.filter(p=>{if(p.type==='orbit'){shotData.delete(p.id);return false;}return true;});}
      updateProjectiles('friendly');
      if(state.player.hp>0){
        if(state.player.invuln<=0)for(const e of state.enemies)if(e.hp>0&&distance2(e,state.player)<(e.radius+state.player.radius)**2){hurtPlayer(metadata(e).damage,e.x,e.z);break;}
        for(const trap of state.traps)if(trap.phase==='active'&&!trap.hitIds.includes('actor:'+cooperative.actorId)&&distance2(state.player,trap)<(trap.radius+state.player.radius*.5)**2){if(hurtPlayer(12,trap.x,trap.z))trap.hitIds.push('actor:'+cooperative.actorId);}
        collectXP();collectPickups();
      }
      if(propsDirty){state.breakables=state.breakables.filter(p=>!p.broken);rebuildObstacles();propsDirty=false;}
      for(const fx of state.effects)fx.life-=STEP;state.effects=state.effects.filter(fx=>fx.life>0);state.messageTime=Math.max(0,state.messageTime-STEP);updateInteraction();
    },
    finishWorld(){updatePOIs();},
    openOffers(){queueLevelUps();openUpgrade();},
    grant(source){pendingUpgrades.push({minimumRarity:'common',...source});},
    resetProjectiles(){pendingAttack=null;state.player.attack=null;state.projectiles=[];shotData.clear();if(state.player.hp>0&&family==='orbit')refreshOrbits();},
    refreshInteraction:updateInteraction,finish
  }:null;
  return{state,start,step,chooseUpgrade,reroll,pause,resume,extract,snapshot,setSpawnBounds,...(coop?{coop}:{})};
}
