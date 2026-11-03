export const DEATH_TIMING=Object.freeze({
  cameraZoomMs:900,
  lostWordAtMs:620,
  resultAtMs:1750
});

const clamp=value=>Math.max(0,Math.min(1,value));
export function deathPresentation(elapsedMs=0){
  const elapsed=Math.max(0,Number(elapsedMs)||0),linear=clamp(elapsed/DEATH_TIMING.cameraZoomMs);
  return{
    elapsedMs:elapsed,
    zoomProgress:1-(1-linear)**3,
    showLostWord:elapsed>=DEATH_TIMING.lostWordAtMs,
    showResult:elapsed>=DEATH_TIMING.resultAtMs
  };
}

export function livingSpectateTarget(state){
  const local=state?.player;if(!local||local.hp>0)return null;
  const living=(state.party||[]).filter(member=>member.id!==local.playerId&&member.player?.hp>0);
  living.sort((a,b)=>(a.player.x-local.x)**2+(a.player.z-local.z)**2-((b.player.x-local.x)**2+(b.player.z-local.z)**2));
  return living[0]||null;
}
