// Local CC0 recordings. Missing or unsupported sounds keep the procedural cue.
const clips=(...names)=>Object.freeze(names.map(name=>'./assets/audio/sfx/'+name+'.mp3'));
const blade=clips('dagger'),arcane=clips('magic'),fire=clips('fire'),blunt=clips('blunt');
export const AUDIO_BANK=Object.freeze({
  select:clips('select'),upgrade:clips('upgrade'),reward:clips('chest'),
  hit:clips('hit'),critical:clips('critical'),hurt:clips('hurt'),
  xp:clips('xp_01','xp_02'),dash:clips('dash'),'pickup-heal':clips('heal'),
  step_normal:clips('step_01','step_02','step_03','step_04'),
  step_mud:clips('step_03','step_04'),step_ice:clips('step_01','step_02'),
  attack_bow:clips('bow'),attack_daggers:blade,attack_spear:blade,attack_scythe:blade,
  attack_hammer:blunt,attack_fists:blunt,attack_fireball:fire,attack_dragon:fire,
  attack_lightning:arcane,attack_frost:arcane,attack_laser:arcane,
  break_crate:clips('wood_break'),break_barrel:clips('wood_break'),
  break_vase:clips('stone_break'),break_crystal:clips('crystal_break'),
  summon:clips('omen'),'rift-open':clips('rift'),'rift-start':clips('guardian'),
  'trap-hit':clips('trap'),'heavy-impact':blunt,explosion:clips('boom'),
});
