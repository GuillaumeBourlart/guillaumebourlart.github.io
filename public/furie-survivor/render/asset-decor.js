import * as THREE from '../vendor/three.module.js';
import {staticAsset} from './asset-library.js';
import {batchStaticChildren} from './static-batch.js';

const flowers=['nature-flower-1-clump','nature-flower-2-clump','nature-flower-3-clump','nature-flower-4-clump','nature-flower-5-clump','nature-flower-1','nature-flower-2','nature-flower-3','nature-flower-4','nature-flower-5','nature-petals-1','nature-petals-2','nature-petals-3','nature-petals-4','nature-petals-5'];
const shrubs=['nature-bush','nature-bush-small','nature-bush-large','nature-bush-flowers','nature-bush-small-flowers','nature-bush-large-flowers','nature-grass-small','nature-grass-large'];
const randomFor=(x,z)=>{let n=(Math.imul(x,73856093)^Math.imul(z,19349663))>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};
export function createAssetDecor(scene){
  const layer=new THREE.Group(),chunks=new Map();layer.name='imported-nature-detail';scene.add(layer);
  function remove(g){g.traverse(o=>{if(o.userData.uniqueGeometry)o.geometry?.dispose();});layer.remove(g);}
  return {
    update(state,bounds){
      const wanted=new Set(),size=16;
      for(let x=Math.floor(bounds.minX/size)-1;x<=Math.floor(bounds.maxX/size)+1;x++)for(let z=Math.floor(bounds.minZ/size)-1;z<=Math.floor(bounds.maxZ/size)+1;z++){
        const id=x+':'+z;wanted.add(id);if(chunks.has(id))continue;const g=new THREE.Group(),rng=randomFor(x,z);
        for(let i=0;i<7;i++){
          const px=(x+rng())*size,pz=(z+rng())*size;
          if(Math.hypot(px,pz)<6.2||Math.hypot(px,pz)>state.arenaRadius-4)continue;
          const pool=i%3?flowers:shrubs,key=pool[Math.floor(rng()*pool.length)],model=staticAsset(key,{height:i%3?.22+rng()*.23:.38+rng()*.43,width:i%3?.75:1.25,rotation:rng()*Math.PI*2});
          if(model){model.position.set(px,.015,pz);g.add(model);}
        }
        g.updateMatrixWorld(true);const meshes=[];g.traverse(o=>{if(o.isMesh){const m=new THREE.Mesh(o.geometry,o.material);o.matrixWorld.decompose(m.position,m.quaternion,m.scale);meshes.push(m);}});g.clear();for(const m of meshes)g.add(m);batchStaticChildren(g);chunks.set(id,g);layer.add(g);
      }
      for(const[id,g] of chunks)if(!wanted.has(id)){remove(g);chunks.delete(id);}
    },
    dispose(){for(const g of chunks.values())remove(g);chunks.clear();scene.remove(layer);}
  };
}
export function decorateCamp(parent){
  const placements=[['dungeon-barrel-large',-2.8,-3.1,.8],['dungeon-crates-stacked',3.3,-3.8,1.2],['dungeon-chest-gold',-3.2,.4,.8],['dungeon-sword-shield-broken',3.1,1.4,.75],['dungeon-candle-triple',-1.6,-4.7,.6],['dungeon-banner-shield-blue',2.1,-4.5,2.2]];
  for(const[key,x,z,height]of placements){const m=staticAsset(key,{height,width:1.4,rotation:.15});if(m){m.position.set(x,0,z);parent.add(m);}}
}
