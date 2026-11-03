import {HEROES,HERO_BY_ID,getHero} from './catalog.js';
const pools=Object.fromEntries(['blob','big','flying'].map(group=>[group,HEROES.filter(h=>h.group===group)]));
export function enemyCreature(e){
  if(e.speciesId&&Object.hasOwn(HERO_BY_ID,e.speciesId))return HERO_BY_ID[e.speciesId];
  if(e.type==='boss')return getHero({forest:'roncin',crystal:'helios',desert:'drako',swamp:'nox'}[e.biome]||'nox');
  const pool=['wisp','wraith','bat'].includes(e.type)?pools.flying:['brute','goblin'].includes(e.type)?pools.big:pools.blob;
  let hash=2166136261;for(const c of String(e.id??0)+':'+(e.biome||''))hash=Math.imul(hash^c.charCodeAt(0),16777619);
  return pool[(hash>>>0)%pool.length];
}
