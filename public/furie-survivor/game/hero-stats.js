// Shared, real combat values for simulation, progression and hero cards.
// Every displayed statistic below has a gameplay effect; there are no fake scores.
import { getHero, MAX_HERO_LEVEL, MAX_STAT_POINTS } from './catalog.js';

export const STAT_DEFINITIONS=Object.freeze({
  power:Object.freeze({id:'power',label:'Puissance',short:'PUI',icon:'damage',description:'+3,5 % de dégâts par point.'}),
  vitality:Object.freeze({id:'vitality',label:'Vitalité',short:'VIE',icon:'vitality',description:'+3 % de vie maximale par point.'}),
  armor:Object.freeze({id:'armor',label:'Armure',short:'ARM',icon:'shield',description:'+0,8 point de défense par point.'}),
  cadence:Object.freeze({id:'cadence',label:'Cadence',short:'CAD',icon:'cadence',description:'+2,5 % de cadence d’attaque par point.'}),
  mobility:Object.freeze({id:'mobility',label:'Mobilité',short:'MOB',icon:'speed',description:'+1,8 % de vitesse de déplacement par point.'}),
  precision:Object.freeze({id:'precision',label:'Précision',short:'CRI',icon:'crit',description:'+1,2 point de critique par point.'}),
  reach:Object.freeze({id:'reach',label:'Amplitude',short:'AMP',icon:'area',description:'+2,2 % de portée et de taille par point.'}),
  recovery:Object.freeze({id:'recovery',label:'Récupération',short:'RÉG',icon:'regen',description:'+0,12 PV régénéré par seconde et par point.'}),
  magnetism:Object.freeze({id:'magnetism',label:'Collecte',short:'COL',icon:'magnet',description:'+0,45 mètre de ramassage par point.'}),
  fortune:Object.freeze({id:'fortune',label:'Fortune',short:'CHN',icon:'essence',description:'Augmente la chance de pouvoirs rares et épiques.'})
});
export const STAT_KEYS=Object.freeze(Object.keys(STAT_DEFINITIONS));

export const RARITY_POWER=Object.freeze({
  common:Object.freeze({damage:1,hp:1,defense:0,luck:0}),
  uncommon:Object.freeze({damage:1.05,hp:1.05,defense:.025,luck:.004}),
  rare:Object.freeze({damage:1.10,hp:1.10,defense:.05,luck:.008}),
  epic:Object.freeze({damage:1.17,hp:1.17,defense:.075,luck:.014}),
  legendary:Object.freeze({damage:1.25,hp:1.25,defense:.105,luck:.021}),
  mythic:Object.freeze({damage:1.35,hp:1.35,defense:.14,luck:.03})
});

const ROLES=Object.freeze({
  balanced:Object.freeze({label:'Équilibré',damage:1,hp:1,defense:0,cadence:1,moveSpeed:1,crit:.05}),
  guardian:Object.freeze({label:'Gardien',damage:.98,hp:1.15,defense:.04,cadence:1,moveSpeed:.98,crit:.05}),
  ranger:Object.freeze({label:'Tireur',damage:1.04,hp:.96,defense:0,cadence:1,moveSpeed:1.02,crit:.08}),
  skirmisher:Object.freeze({label:'Éclaireur',damage:.96,hp:.96,defense:0,cadence:1.06,moveSpeed:1.04,crit:.07}),
  arcanist:Object.freeze({label:'Arcaniste',damage:1.08,hp:.94,defense:0,cadence:.98,moveSpeed:1,crit:.05}),
  controller:Object.freeze({label:'Contrôle',damage:.98,hp:1.04,defense:.02,cadence:1,moveSpeed:1,crit:.05}),
  engineer:Object.freeze({label:'Artificier',damage:1.04,hp:1,defense:.02,cadence:.98,moveSpeed:.98,crit:.05}),
  brawler:Object.freeze({label:'Combattant',damage:1,hp:1.10,defense:.02,cadence:1.02,moveSpeed:1,crit:.05}),
  berserker:Object.freeze({label:'Assaut',damage:1.08,hp:1.04,defense:0,cadence:.98,moveSpeed:.98,crit:.06})
});

const identity=(role,title,description,tuning={})=>Object.freeze({role,trait:Object.freeze({title,description}),tuning:Object.freeze(tuning)});
export const HERO_IDENTITIES=Object.freeze({
  bram:identity('guardian','Peau de pierre','Un grand gardien minéral : solide, lourd et sûr au contact.'),
  lyra:identity('balanced','Harmonie lunaire','Un profil polyvalent dont les lunes protègent les angles morts.'),
  kael:identity('ranger','Œil sylvestre','Plus de dégâts, de critique et de vitesse, au prix de la vie.'),
  nyx:identity('skirmisher','Pas d’ombre','Très mobile et rapide, mais moins résistante lors d’une erreur.'),
  poppy:identity('arcanist','Cœur de braise','De gros impacts explosifs, avec une réserve de vie réduite.'),
  volt:identity('arcanist','Haute tension','Des dégâts élevés qui se propagent entre les cibles.'),
  kiko:identity('skirmisher','Retour agile','Un petit combattant rapide qui exploite l’aller-retour.'),
  momo:identity('brawler','Poings solides','Un panda massif taillé pour la mêlée et les échanges courts.'),
  ondine:identity('controller','Écume protectrice','Davantage de vie et de contrôle autour d’elle.'),
  boum:identity('engineer','Mélange robuste','Des zones puissantes, une cadence et une mobilité plus lentes.'),
  sylve:identity('controller','Écorce vive','Une créature végétale résistante qui use la horde au poison.'),
  astra:identity('balanced','Ciel équilibré','Une couverture radiale régulière dans toutes les directions.'),
  nox:identity('berserker','Faim de minuit','Dégâts et vie élevés, avec un rythme volontairement lourd.'),
  miel:identity('controller','Ruche gardienne','Une reine-insecte qui guide ses projectiles vers les fuyards.'),
  pixel:identity('ranger','Visée prismatique','Un automate précis qui perce des lignes entières.'),
  frimas:identity('controller','Fourrure de givre','Un petit quadrupède qui ralentit les ennemis.'),
  gizmo:identity('engineer','Atelier blindé','Un minuscule artificier qui prépare le terrain.'),
  orion:identity('guardian','Garde solaire','Un grand lancier protégé, lent mais difficile à renverser.'),
  umbra:identity('controller','Voile gravitaire','Une entité flottante mythique qui regroupe la horde.'),
  drako:identity('berserker','Sang royal','Un dragon mythique très puissant au prix d’une mobilité mesurée.'),
  rocco:identity('guardian','Rempart','Un énorme golem : +14 % de zone, +5 % de vie et -4 % de vitesse.',{area:1.14,hp:1.05,moveSpeed:.96}),
  plume:identity('ranger','Œil vif','+7 points de critique, mais -6 % de dégâts par impact.',{crit:.07,damage:.94}),
  zeste:identity('skirmisher','Grand panier','+1,2 m de ramassage et +4 % de vitesse.',{pickupRadius:1.2,moveSpeed:1.04}),
  selene:identity('balanced','Veille lunaire','+12 % de zone et 0,15 PV régénéré par seconde.',{area:1.12,regen:.15}),
  baltha:identity('engineer','Grand chaudron','+20 % de zone, mais -6 % de cadence.',{area:1.2,cadence:.94}),
  roncin:identity('controller','Sève tenace','0,30 PV par seconde et +4 % de vie.',{regen:.3,hp:1.04}),
  piko:identity('skirmisher','Escadrille','Une abeille supplémentaire, mais -14 % de dégâts par abeille.',{amount:1,damage:.86}),
  helios:identity('guardian','Pointe solaire','+15 % de portée et +5 points de critique.',{area:1.15,crit:.05}),
  cendre:identity('arcanist','Braise ample','+22 % de zone, mais -5 % de dégâts par impact.',{area:1.22,damage:.95}),
  nebula:identity('balanced','Ciel chargé','Deux étoiles supplémentaires, mais -10 % de dégâts par étoile.',{amount:1,damage:.9}),
  chrono:identity('ranger','Temps volé','+12 % de cadence, mais -6 % de vie.',{cadence:1.12,hp:.94}),
  yuzu:identity('controller','Marée douce','+18 % de zone, 0,35 PV par seconde et -3 % de vitesse.',{area:1.18,regen:.35,moveSpeed:.97})
});

export const HERO_SHAPES=Object.freeze({
  bram:Object.freeze({form:'golem',modelScale:1.18,bodyRadius:.56}),
  momo:Object.freeze({form:'beast',modelScale:1.12,bodyRadius:.54}),
  sylve:Object.freeze({form:'plant',modelScale:1.02,bodyRadius:.48}),
  miel:Object.freeze({form:'bee',modelScale:.88,bodyRadius:.42}),
  frimas:Object.freeze({form:'quadruped',modelScale:.78,bodyRadius:.38}),
  gizmo:Object.freeze({form:'tiny',modelScale:.72,bodyRadius:.36}),
  umbra:Object.freeze({form:'spirit',modelScale:1.14,bodyRadius:.50}),
  drako:Object.freeze({form:'dragon',modelScale:1.28,bodyRadius:.62}),
  rocco:Object.freeze({form:'golem',modelScale:1.42,bodyRadius:.68}),
  piko:Object.freeze({form:'bee',modelScale:.64,bodyRadius:.32}),
  nebula:Object.freeze({form:'spirit',modelScale:.92,bodyRadius:.43}),
  yuzu:Object.freeze({form:'turtle',modelScale:1.32,bodyRadius:.65})
});

const round=value=>Number(value.toFixed(4));
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function emptyStatPoints(){return Object.fromEntries(STAT_KEYS.map(key=>[key,0]));}
export function normalizeStatPoints(source={}){
  const result=emptyStatPoints();
  if(!source||typeof source!=='object')return result;
  for(const key of STAT_KEYS)result[key]=clamp(Math.floor(Number(source[key])||0),0,MAX_STAT_POINTS);
  return result;
}
export function legacyStatPoints(level=1){
  const safe=Number.isFinite(level)?clamp(Math.floor(level),1,20):1,result=emptyStatPoints();
  for(let i=0;i<safe-1;i++)result[STAT_KEYS[i%STAT_KEYS.length]]++;
  return result;
}
export function heroLevelFromStats(points={}){return clamp(1+Object.values(normalizeStatPoints(points)).reduce((sum,value)=>sum+value,0),1,MAX_HERO_LEVEL);}

export function getTrainingBonuses(pointsOrLevel={}){
  const points=typeof pointsOrLevel==='number'?legacyStatPoints(pointsOrLevel):normalizeStatPoints(pointsOrLevel);
  return{
    damage:round(1+.035*points.power),maxHp:round(1+.03*points.vitality),defense:round(.008*points.armor),
    cadence:round(1+.025*points.cadence),moveSpeed:round(1+.018*points.mobility),crit:round(.012*points.precision),
    area:round(1+.022*points.reach),regen:round(.12*points.recovery),pickupRadius:round(.45*points.magnetism),luck:round(.0125*points.fortune),
    points,level:heroLevelFromStats(points)
  };
}

export function getHeroBaseStats(id){
  const hero=getHero(id),rarity=RARITY_POWER[hero.rarity]||RARITY_POWER.common,identity=HERO_IDENTITIES[hero.id]||HERO_IDENTITIES.lyra,role=ROLES[identity.role]||ROLES.balanced,t=identity.tuning,shape=HERO_SHAPES[hero.id]||{};
  return{
    damage:round(rarity.damage*role.damage*(t.damage??1)),maxHp:Math.round(100*rarity.hp*role.hp*(t.hp??1)),
    defense:round(clamp(rarity.defense+role.defense+(t.defense??0),0,.45)),cadence:round(role.cadence*(t.cadence??1)),
    moveSpeed:round(role.moveSpeed*(t.moveSpeed??1)),crit:round(clamp(role.crit+(t.crit??0),0,.65)),area:round(t.area??1),
    amount:Math.floor(t.amount??0),regen:round(t.regen??0),pickupRadius:round(4.8+(t.pickupRadius??0)),luck:rarity.luck,
    bodyRadius:shape.bodyRadius??.47,modelScale:shape.modelScale??1,form:shape.form??'humanoid',
    role:role.label,roleId:identity.role,trait:{...identity.trait},rarity:hero.rarity
  };
}

export function getHeroCombatStats(id,pointsOrLevel={}){
  const base=getHeroBaseStats(id),training=getTrainingBonuses(pointsOrLevel),damage=round(base.damage*training.damage),moveSpeed=round(base.moveSpeed*training.moveSpeed);
  return{
    ...base,level:training.level,training,statPoints:{...training.points},damage,power:Math.round(damage*100),
    baseMaxHp:base.maxHp,maxHp:Math.round(base.maxHp*training.maxHp),defense:round(clamp(base.defense+training.defense,0,.45)),
    cadence:round(base.cadence*training.cadence),moveSpeed,speed:round(7.2*moveSpeed),crit:round(clamp(base.crit+training.crit,0,.75)),
    area:round(base.area*training.area),regen:round(base.regen+training.regen),pickupRadius:round(base.pickupRadius+training.pickupRadius),luck:round(base.luck+training.luck)
  };
}
