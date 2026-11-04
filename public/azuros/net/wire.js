// Snapshot wire format shared by the server and the browser, without DOM or socket code.
// Protocol 3 sends each snapshot as a delta: top-level values only when they change, entity
// fields only when they change, visual effects once, and world chunks once per connection.
// Both sides drop their memory on every new connection, so a lost message never leaks into the next one.
export const WIRE_PROTOCOL=3;
// Moving entities are listed in every snapshot; slow lists only when one of their entries changes.
// Both kinds carry only the fields that changed since this socket last received that entry.
const ENTITY_KEYS=new Set(['enemies','projectiles','gems','corpses']),LISTS=new Set(['traps','pois','breakables','pickups']);
const ALWAYS=new Set(['t','phase','player','party','inputAck','connectionGeneration','serverFrame']);

export function rounded(value){
  if(typeof value==='number')return Math.round(value*1000)/1000;
  if(value===null||typeof value!=='object')return value;
  if(Array.isArray(value)){const out=new Array(value.length);for(let i=0;i<value.length;i++)out[i]=rounded(value[i]);return out;}
  const out={};for(const key of Object.keys(value))out[key]=rounded(value[key]);return out;
}
function same(a,b){
  if(a===b)return true;
  if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return false;
  return JSON.stringify(a)===JSON.stringify(b);
}
const json=value=>JSON.stringify(value===undefined?null:value);
// Map markers change only through these fields; a cheap signature avoids serialising them twice.
const mapSignature=list=>{let n=0;for(const p of list||[])n+=(p.discovered?1:0)+(p.completed?2:0);return (list?.length||0)+':'+n;};

export function createSnapshotEncoder(){
  let keys=new Map(),entities=new Map(),effects=new Set(),mapKey='';
  return{
    reset(){keys=new Map();entities=new Map();effects=new Set();mapKey='';},
    // Builds the "state" JSON. commit() must be called only once the message has been handed to the socket.
    encode(state){
      const parts=[],nextKeys=new Map(keys),nextEntities=new Map(),nextEffects=new Set();let nextMapKey=mapKey;
      for(const key of Object.keys(state)){
        const value=state[key];
        if(ENTITY_KEYS.has(key)||LISTS.has(key)){
          const current=rounded(value||[]);
          if(LISTS.has(key)){const text=JSON.stringify(current);if(text===keys.get(key))continue;nextKeys.set(key,text);}
          const known=entities.get(key)||new Map(),seen=new Map(),list=[];
          for(const entry of current){
            const previous=known.get(entry.id);seen.set(entry.id,entry);
            if(!previous){list.push(entry);continue;}
            const diff={id:entry.id};
            for(const field of Object.keys(entry))if(!same(entry[field],previous[field]))diff[field]=entry[field];
            for(const field of Object.keys(previous))if(!(field in entry))diff[field]=null;
            list.push(diff);
          }
          nextEntities.set(key,seen);parts.push(JSON.stringify(key)+':'+JSON.stringify(list));
        }else if(key==='effects'){
          // The client keeps each effect and ages it from its birth time, so it travels once while in range.
          const fresh=[];for(const effect of value||[]){nextEffects.add(effect.id);if(!effects.has(effect.id))fresh.push(rounded(effect));}
          parts.push('"effects":'+JSON.stringify(fresh));
        }else if(ALWAYS.has(key))parts.push(JSON.stringify(key)+':'+json(rounded(value)));
        else{
          if(key==='mapPOIs'){const signature=mapSignature(value);if(signature===mapKey&&keys.has(key))continue;nextMapKey=signature;}
          const text=json(rounded(value));if(text===keys.get(key))continue;
          nextKeys.set(key,text);parts.push(JSON.stringify(key)+':'+text);
        }
      }
      return{text:'{'+parts.join(',')+'}',commit(){keys=nextKeys;for(const [key,seen]of nextEntities)entities.set(key,seen);effects=nextEffects;mapKey=nextMapKey;}};
    }
  };
}

export function createSnapshotDecoder(){
  let base=null,entities=new Map();
  return{
    reset(){base=null;entities=new Map();},
    apply(partial){
      const next=base?{...base}:{};
      for(const key of Object.keys(partial)){
        const value=partial[key];
        if(!ENTITY_KEYS.has(key)&&!LISTS.has(key)){next[key]=value;continue;}
        const known=entities.get(key)||new Map(),seen=new Map(),list=new Array(value.length);
        for(let i=0;i<value.length;i++){
          const diff=value[i],previous=known.get(diff.id),entity=previous?{...previous,...diff}:diff;
          seen.set(entity.id,entity);list[i]=entity;
        }
        entities.set(key,seen);next[key]=list;
      }
      base=next;return next;
    }
  };
}

// World geometry is static per chunk: each chunk travels once per connection and the
// active list is rebuilt from the cache. The rift arena is not chunked and travels whole.
export function createWorldEncoder(){
  let run='',chunks=new Set(),visited=0,biomes=false;
  return{
    reset(){run='';chunks=new Set();visited=0;biomes=false;},
    encode(state,revision,getChunk){
      const world=state.world||{},active=world.activeChunks||[];
      if(state.rift?.arenaActive||!getChunk||!active.length)return{message:{type:'world',revision,data:{obstacles:state.obstacles,zones:state.zones,world,biomes:state.biomes}},commit(){}};
      const fresh=run===state.runId?chunks:new Set(),list=[],ids=[];
      for(const c of active){ids.push(c.id);if(fresh.has(c.id))continue;const chunk=getChunk(c.x,c.z);list.push({id:c.id,x:c.x,z:c.z,obstacles:chunk.obstacles,zones:chunk.zones});}
      const all=world.visitedChunks||[],from=run===state.runId?Math.min(visited,all.length):0;
      const {visitedChunks,activeChunks,...rest}=world;
      const message={type:'world',revision,chunked:true,run:state.runId,chunks:list,active:ids,world:{...rest,visitedFrom:from,visitedAdded:all.slice(from)},...(biomes&&run===state.runId?{}:{biomes:state.biomes})};
      return{message,commit(){if(run!==state.runId){chunks=new Set();biomes=false;}run=state.runId;for(const c of list)chunks.add(c.id);visited=all.length;biomes=true;}};
    }
  };
}

export function createWorldDecoder(){
  let run='',chunks=new Map(),visited=[],biomes=[];
  return{
    reset(){run='';chunks=new Map();visited=[];biomes=[];},
    // Returns the static world fields, or null when a chunk is unknown and a full resend is needed.
    apply(data){
      // The rift arena travels whole; the chunk cache stays valid for the return to the world.
      if(!data.chunked)return data.data;
      if(data.run!==run){run=data.run;chunks=new Map();visited=[];biomes=[];}
      for(const c of data.chunks)chunks.set(c.id,c);
      const obstacles=[],zones=[],activeChunks=[];
      for(const id of data.active){const c=chunks.get(id);if(!c)return null;activeChunks.push({id,x:c.x,z:c.z});for(const o of c.obstacles)obstacles.push(o);for(const z of c.zones)zones.push(z);}
      const {visitedFrom,visitedAdded,...world}=data.world;
      visited=visited.slice(0,visitedFrom).concat(visitedAdded);if(data.biomes)biomes=data.biomes;
      return{obstacles,zones,world:{...world,activeChunks,visitedChunks:visited},biomes};
    }
  };
}
