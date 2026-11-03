// Bound idle models across the whole collection, not just each species.
export function createModelPool({limit=128,perKey=16,dispose}){
  const buckets=new Map(),idle=new Map();
  function remove(value,key){const bucket=buckets.get(key),index=bucket?.indexOf(value);if(index>=0)bucket.splice(index,1);if(!bucket?.length)buckets.delete(key);idle.delete(value);}
  return {
    take(key){const bucket=buckets.get(key),value=bucket?.pop();if(value){idle.delete(value);if(!bucket.length)buckets.delete(key);}return value;},
    put(key,value){
      if((buckets.get(key)?.length||0)>=perKey){dispose(value);return;}
      while(idle.size>=limit){const [old,oldKey]=idle.entries().next().value;remove(old,oldKey);dispose(old);}
      let bucket=buckets.get(key);if(!bucket){bucket=[];buckets.set(key,bucket);}bucket.push(value);idle.set(value,key);
    },
    clear(){for(const value of idle.keys())dispose(value);idle.clear();buckets.clear();},
    get size(){return idle.size;}
  };
}
