export const XP_ACTIVATION_DELAY=1;
export const CORPSE_HOLD=3;
export const CORPSE_FADE=.65;
export const CORPSE_LIFETIME=CORPSE_HOLD+CORPSE_FADE;
export function corpseOpacity(age){return Math.max(0,Math.min(1,1-Math.max(0,age-CORPSE_HOLD)/CORPSE_FADE));}
export function experienceReady(gem,time){return !Number.isFinite(gem.activeAt)||time+1e-9>=gem.activeAt;}
