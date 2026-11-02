import {RARITIES,MAX_STAT_POINTS,getHero} from './game/catalog.js';
import {getHeroCombatStats,STAT_KEYS} from './game/hero-stats.js';

export const RARITY_ORDER=Object.freeze(['common','uncommon','rare','epic','legendary','mythic']);
export function rarityRank(rarity){return Math.max(1,RARITY_ORDER.indexOf(rarity)+1);}
export function rarityMarks(rarity){return `<span class="rarity-marks" aria-hidden="true">${Array.from({length:rarityRank(rarity)},()=>'<i></i>').join('')}</span>`;}
export function rarityBadge(rarity){const r=RARITIES[rarity]||RARITIES.common;return `<span class="rarity-badge" style="--rarity:${r.color}">${rarityMarks(rarity)}<b>${r.label}</b></span>`;}
const number=(n,digits=0)=>Number(n).toLocaleString('fr-FR',{minimumFractionDigits:digits,maximumFractionDigits:digits});
export function statValue(stats,key){
  return {power:number(stats.power),vitality:number(stats.maxHp),armor:number(stats.defense*100,1)+' %',cadence:'×'+number(stats.cadence,2),mobility:number(stats.speed,1),precision:number(stats.crit*100,1)+' %',reach:'×'+number(stats.area,2),recovery:number(stats.regen,2)+'/s',magnetism:number(stats.pickupRadius,1)+' m',fortune:number(stats.luck*100,1)+' %'}[key]||'';
}
// Values and previews come from the same combat calculation as the simulation.
export function trainingPreview(heroId,points,key){
  if(!STAT_KEYS.includes(key))throw new Error('Unknown training stat');
  const hero=getHero(heroId),current=getHeroCombatStats(hero.id,points),rank=current.statPoints[key],max=rank>=MAX_STAT_POINTS;
  const next=max?current:getHeroCombatStats(hero.id,{...current.statPoints,[key]:rank+1});
  return {rank,max,current:statValue(current,key),next:statValue(next,key),base:statValue(getHeroCombatStats(hero.id),key)};
}
