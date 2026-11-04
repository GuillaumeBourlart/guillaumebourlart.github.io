// Never fade a shared living material. Corpses borrow originals until fading starts.
export function corpseAppearance(root){
  const assignments=[],materials=new Map(),skeletons=[],shadows=[],matrixAuto=root.matrixAutoUpdate,worldAuto=root.matrixWorldAutoUpdate;
  // Keep their ground shadow, but avoid rendering every fallen body into the sun map.
  root.traverse(o=>{if(o.isMesh&&o.castShadow){shadows.push(o);o.castShadow=false;}});
  let frozen=false;
  return {
    freeze(){if(frozen)return;root.updateMatrixWorld(true);root.traverse(o=>{if(o.isSkinnedMesh&&!skeletons.some(s=>s.skeleton===o.skeleton)){const skeleton=o.skeleton;skeleton.update();skeletons.push({skeleton,update:skeleton.update});skeleton.update=()=>{};}});root.matrixAutoUpdate=false;root.matrixWorldAutoUpdate=false;frozen=true;},
    fade(opacity){
      if(opacity===1&&!assignments.length)return;
      if(!assignments.length)root.traverse(o=>{if(!o.material)return;assignments.push({object:o,original:o.material});const replace=m=>{if(!materials.has(m)){const copy=m.clone();copy.transparent=true;copy.depthWrite=false;copy.forceSinglePass=true;materials.set(m,{copy,opacity:m.opacity});}return materials.get(m).copy;};o.material=Array.isArray(o.material)?o.material.map(replace):replace(o.material);});
      for(const {copy,opacity:base}of materials.values())copy.opacity=base*opacity;
    },
    restore(){root.matrixAutoUpdate=matrixAuto;root.matrixWorldAutoUpdate=worldAuto;for(const o of shadows)o.castShadow=true;for(const {skeleton,update}of skeletons)skeleton.update=update;for(const {object,original}of assignments)object.material=original;for(const {copy}of materials.values())copy.dispose();}
  };
}
