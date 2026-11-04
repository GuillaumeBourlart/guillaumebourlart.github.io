// Each shooting species throws its own projectile, so a creature's look tells what it fires.
// Shooting blobs never appear as melee enemies (creatures.js), and melee blobs never shoot.
export const SHOOTERS=Object.freeze({
  kael:Object.freeze({family:'daggers',style:'knife',color:'#5fd38a',speed:12.5,radius:.2,count:1,spread:0,cooldown:1.4,windup:.45}),
  poppy:Object.freeze({family:'fireball',style:'',color:'#ff7a52',speed:7.5,radius:.36,count:1,spread:0,cooldown:1.8,windup:.6}),
  kiko:Object.freeze({family:'boomerang',style:'',color:'#ffb347',speed:9.5,radius:.26,count:1,spread:0,cooldown:1.6,windup:.5}),
  sylve:Object.freeze({family:'thorns',style:'',color:'#b5e06a',speed:10,radius:.2,count:3,spread:.2,cooldown:2.1,windup:.55}),
  frimas:Object.freeze({family:'frost',style:'',color:'#8fd8ff',speed:9.5,radius:.24,count:2,spread:.16,cooldown:1.8,windup:.5}),
  lyra:Object.freeze({family:'arcane',style:'arcane',color:'#b892ff',speed:8.5,radius:.3,count:1,spread:0,cooldown:1.6,windup:.55})
});
// Biome guardians keep their radial bursts, drawn with their own species' projectile.
const GUARDIAN_SHOTS=Object.freeze({
  roncin:Object.freeze({family:'thorns',style:'',color:'#b5e06a'}),
  helios:Object.freeze({family:'spear',style:'',color:'#ffd36e'}),
  drako:Object.freeze({family:'fireball',style:'',color:'#ff8a4c'}),
  nox:Object.freeze({family:'scythe',style:'',color:'#c3a8ff'})
});
const FALLBACK=Object.freeze({family:'enemy',style:'',color:'#ff6e81',speed:10,radius:.25,count:1,spread:0,cooldown:2.6,windup:.5});
// A hostile shot flies this far, then fades: stray shots no longer cross the whole screen.
export const SHOT_RANGE=18;
export function shooterShot(speciesId){return Object.hasOwn(SHOOTERS,speciesId)?SHOOTERS[speciesId]:FALLBACK;}
export function guardianShot(speciesId){return Object.hasOwn(GUARDIAN_SHOTS,speciesId)?GUARDIAN_SHOTS[speciesId]:FALLBACK;}

// Shooters alive at once, and the calm between two volleys aimed at the same hero. Extra shooters
// arrive as melee runners instead, so the pressure grows through bodies, not through bullets.
export function rangedPacing(seconds,gate,players=1){
  const minutes=Math.max(0,seconds-gate)/60,n=Math.max(1,Math.min(4,Math.floor(players)||1));
  return{cap:Math.round(Math.min(8,3+minutes*.6)*(1+.5*(n-1))),gap:Math.max(.45,.8-minutes*.04),windups:minutes<3?1:2};
}
