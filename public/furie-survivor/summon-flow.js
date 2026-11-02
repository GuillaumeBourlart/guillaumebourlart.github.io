import {HERO_BY_ID} from './game/catalog.js';

// Playback only: rewards are already settled. This controller never rolls or spends.
export function createSummonFlow({onChange=()=>{},onReveal=()=>{},onComplete=()=>{},clock={now:()=>performance.now(),set:(fn,ms)=>setTimeout(fn,ms),clear:id=>clearTimeout(id)}}={}){
  let queue=[],index=0,phase='idle',timer=null,omenAt=0,quiet=false,generation=0;
  const cancelTimer=()=>{if(timer!==null)clock.clear(timer);timer=null;};
  const snapshot=()=>({phase,index,total:queue.length,result:queue[index]||null,results:queue.slice()});
  function schedule(fn,ms){cancelTimer();const token=generation;timer=clock.set(()=>{timer=null;if(token===generation)fn();},ms);}
  function emit(){onChange(snapshot());}
  function reveal(){if(phase!=='omen')return;cancelTimer();phase='revealed';emit();onReveal(queue[index]);}
  function omen(){if(phase!=='gathering')return;phase='omen';omenAt=clock.now();emit();schedule(reveal,quiet?550:1450);}
  function prepare(){phase='gathering';emit();schedule(omen,quiet?0:550);}
  return {
    start(results,{reducedMotion=false}={}){
      if(phase!=='idle')return false;
      if(!Array.isArray(results)||!results.length||results.length>5||results.some(r=>!r||!Object.hasOwn(HERO_BY_ID,r.heroId)))return false;
      queue=results.map(r=>Object.freeze({...r}));index=0;quiet=reducedMotion;generation++;prepare();return true;
    },
    advance(){
      if(phase==='gathering'){omen();return;}
      if(phase==='omen'){
        const remaining=(quiet?350:600)-(clock.now()-omenAt);
        if(remaining<=0)reveal();else schedule(reveal,remaining);
        return;
      }
      if(phase!=='revealed')return;
      if(index<queue.length-1){index++;prepare();return;}
      cancelTimer();generation++;phase='idle';queue=[];emit();onComplete();
    },
    cancel(){cancelTimer();generation++;phase='idle';queue=[];},
    get state(){return snapshot();}
  };
}
