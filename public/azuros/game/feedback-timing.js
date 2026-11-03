import {GAME_SPEED} from './timing.js';

export const XP_ACTIVATION_DELAY=1;
export const CORPSE_LIFETIME=2*GAME_SPEED;
export const CORPSE_FADE=.5*GAME_SPEED;
export const CORPSE_HOLD=CORPSE_LIFETIME-CORPSE_FADE;
export function corpseOpacity(age){return Math.max(0,Math.min(1,1-Math.max(0,age-CORPSE_HOLD)/CORPSE_FADE));}
export function experienceReady(gem,time){return !Number.isFinite(gem.activeAt)||time+1e-9>=gem.activeAt;}
