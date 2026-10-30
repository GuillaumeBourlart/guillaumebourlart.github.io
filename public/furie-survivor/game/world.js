// Shared world coordinates and deterministic data. Rendering owns no gameplay.
export const WORLD_RADIUS=1024,CHUNK_SIZE=64,ACTIVE_CHUNK_RADIUS=2;
export const biomeAt=(x,z)=>z < -26-Math.abs(x)*.22?'crystal':x>28+Math.max(0,z)*.32?'desert':x < -28-Math.max(0,z)*.32?'swamp':'forest';
export const worldChunkAt=(x,z)=>({x:Math.floor((x+CHUNK_SIZE/2)/CHUNK_SIZE),z:Math.floor((z+CHUNK_SIZE/2)/CHUNK_SIZE)});
const hypot=Math.hypot;
function randomFrom(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
function seedValue(seed){if(Number.isFinite(seed))return Math.trunc(seed)>>>0;let value=2166136261;for(const c of String(seed))value=Math.imul(value^c.charCodeAt(0),16777619);return value>>>0;}
const names={chest:'Trésor oublié',shrine:'Sanctuaire d’Azur',camp:'Camp de gardiens',well:'Source de vie'};
const kinds=['chest','shrine','camp','well','chest','shrine'];

// Chunks retain their mutable run state when unloaded. Only the current5×5
// window is published to the simulation/renderers; a fresh factory resets it.
export function createWorldData(seed=12345){
  const runSeed=seedValue(seed),chunks=new Map();
  function getChunk(cx,cz){
    cx=Math.trunc(cx);cz=Math.trunc(cz);const key=`${cx}:${cz}`;if(chunks.has(key))return chunks.get(key);
    const random=randomFrom(runSeed^Math.imul(cx+431,374761393)^Math.imul(cz+719,668265263)),centerX=cx*CHUNK_SIZE,centerZ=cz*CHUNK_SIZE;
    const chunk={id:key,x:cx,z:cz,pois:[],obstacles:[],zones:[],traps:[],breakables:[],pickups:[],gems:[]},origin=cx===0&&cz===0;
    const id=(kind,index)=>`w:${cx}:${cz}:${kind}:${index}`,inside=(x,z,radius=1)=>hypot(x,z)<WORLD_RADIUS-radius-1;
    const point=(padding=7)=>({x:centerX+(random()-.5)*(CHUNK_SIZE-padding*2),z:centerZ+(random()-.5)*(CHUNK_SIZE-padding*2)});
    const addPoi=(type,x,z,name)=>{if(!inside(x,z,5))return;chunk.pois.push({id:id('poi',chunk.pois.length),type,name:name||names[type],x,z,biome:biomeAt(x,z),discovered:hypot(x,z)<=15,completed:false,progress:0,active:false,guardians:[],guardiansTotal:0,pendingGuardians:0,guardiansRemaining:0,spawnRetryAt:0,completedAt:-100});};
    if(origin){addPoi('chest',9,4,'Coffre du voyageur');addPoi('shrine',-10,-7,'Autel de l’aube');addPoi('well',3,17,'Source claire');addPoi('camp',22,6,'Camp des moussus');}
    else for(let i=0;i<4;i++)addPoi(kinds[Math.floor(random()*kinds.length)],centerX+(i%2?16:-16)+(random()-.5)*7,centerZ+(i<2?-16:16)+(random()-.5)*7);
    const addZone=(type,x,z,radius)=>{if(inside(x,z,radius))chunk.zones.push({id:id('zone',chunk.zones.length),type,x,z,radius,biome:biomeAt(x,z)});};
    if(origin){addZone('mud',-7,8,4.3);addZone('ice',12,-12,4.8);}
    else for(let i=0;i<2;i++){const p=point(10),biome=biomeAt(p.x,p.z);addZone(biome==='crystal'?'ice':biome==='swamp'?'mud':random()<.7?'mud':'ice',p.x,p.z,4+random()*2.3);}
    for(let i=0,attempt=0;i<14&&attempt<110;attempt++){
      const p=point(5),radius=.8+random()*1.35;
      if(!inside(p.x,p.z,radius)||origin&&hypot(p.x,p.z)<8||chunk.pois.some(q=>hypot(q.x-p.x,q.z-p.z)<radius+5)||chunk.obstacles.some(q=>hypot(q.x-p.x,q.z-p.z)<radius+q.radius+3))continue;
      const biome=biomeAt(p.x,p.z);chunk.obstacles.push({id:id('obstacle',i++),...p,radius,biome,type:biome==='crystal'?'crystal':biome==='desert'?'rock':random()<.65?'tree':'pillar'});
    }
    const clear=(p,radius,poiGap=3)=>inside(p.x,p.z,radius)&&chunk.obstacles.every(o=>hypot(p.x-o.x,p.z-o.z)>radius+o.radius+.5)&&chunk.pois.every(o=>hypot(p.x-o.x,p.z-o.z)>radius+poiGap);
    for(let attempt=0;attempt<50&&!chunk.traps.length;attempt++){
      const p=origin&&attempt===0?{x:18,z:-5}:point(8),radius=1.65;
      if(!clear(p,radius,4)||origin&&hypot(p.x,p.z)<16)continue;
      chunk.traps.push({id:id('trap',0),type:'spikes',...p,radius,phase:'idle',phaseTime:0,phaseDuration:0,phaseProgress:0,warningDuration:.9,activeDuration:.45,cooldownDuration:3.2,hitIds:[],biome:biomeAt(p.x,p.z)});
    }
    const addProp=(type,p,index)=>{const radius=type==='crystal'?.72:type==='crate'?.62:.48,hp=type==='crystal'?24:type==='crate'?18:12,healing=type==='vase';chunk.breakables.push({id:id('prop',index),type,breakable:true,...p,radius,hp,maxHp:hp,broken:false,hitFlash:0,orbitNextHit:0,loot:{xp:healing?4:type==='crystal'?10:7,heal:healing?18:0},biome:biomeAt(p.x,p.z)});};
    if(origin){for(const [type,x,z]of[['crate',4.7,1.8],['vase',-4.5,3],['crystal',7,-4]]){const p={x,z};if(clear(p,.7,1))addProp(type,p,chunk.breakables.length);}}
    for(let attempt=0;attempt<90&&chunk.breakables.length<6;attempt++){
      const p=point(6),type=['crate','vase','crystal'][Math.floor(random()*3)];
      if(!clear(p,.8,1.5)||chunk.breakables.some(o=>hypot(p.x-o.x,p.z-o.z)<2.5)||chunk.traps.some(o=>hypot(p.x-o.x,p.z-o.z)<o.radius+2.5)||origin&&hypot(p.x,p.z)<3)continue;
      addProp(type,p,chunk.breakables.length);
    }
    chunks.set(key,chunk);return chunk;
  }
  return{getChunk,get visitedChunks(){return[...chunks.values()].map(c=>({id:c.id,x:c.x,z:c.z}));},get visitedCount(){return chunks.size;}};
}
