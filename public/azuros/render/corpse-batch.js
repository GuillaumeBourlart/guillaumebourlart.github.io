import * as THREE from '../vendor/three.module.js';

// Death poses stop changing after their native animation. Bake each species once,
// then draw its fallen instances together, including an independent fade value.
export function bakeCorpseParts(root){
  root.updateMatrixWorld(true);
  const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),parts=[],v=new THREE.Vector3();
  function visit(o,visible){
    visible=visible&&o.visible;if(!visible)return;
    if(o.isMesh&&o.geometry?.attributes.position){
      const geometry=o.geometry.clone(),local=new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld),position=geometry.attributes.position;
      for(let i=0;i<position.count;i++){o.getVertexPosition(i,v).applyMatrix4(local);position.setXYZ(i,v.x,v.y,v.z);}
      geometry.deleteAttribute('skinIndex');geometry.deleteAttribute('skinWeight');geometry.morphAttributes={};
      geometry.computeVertexNormals();geometry.computeBoundingSphere();
      parts.push({geometry,material:o.material});
    }
    for(const child of o.children)visit(child,visible);
  }
  visit(root,true);return parts;
}

function fadingMaterial(original){
  const m=original.clone();m.transparent=true;m.depthWrite=false;
  m.onBeforeCompile=shader=>{
    shader.vertexShader='attribute float corpseAlpha; varying float vCorpseAlpha;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCorpseAlpha = corpseAlpha;');
    shader.fragmentShader='varying float vCorpseAlpha;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a *= vCorpseAlpha;');
  };
  m.customProgramCacheKey=()=> 'corpse-alpha-v1';return m;
}

export function createCorpseBatch(parent,{capacity=512}={}){
  const templates=new Map();
  function prepare(key,root){
    if(templates.has(key))return true;if(!root)return false;
    const parts=bakeCorpseParts(root);if(!parts.length)return false;
    const entry={count:0,parts:parts.map(({geometry,material})=>{
      const originals=Array.isArray(material)?material:[material],materials=originals.map(fadingMaterial);
      const alpha=new THREE.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(THREE.DynamicDrawUsage);geometry.setAttribute('corpseAlpha',alpha);
      const mesh=new THREE.InstancedMesh(geometry,Array.isArray(material)?materials:materials[0],capacity);
      mesh.name='fallen-creature-instances';mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=true;mesh.count=0;
      parent.add(mesh);return {mesh,alpha,materials};
    })};
    templates.set(key,entry);return true;
  }
  return {
    prepare,
    begin(){for(const entry of templates.values())entry.count=0;},
    add(key,matrix,opacity){
      const entry=templates.get(key);if(!entry||entry.count>=capacity)return false;
      for(const {mesh,alpha}of entry.parts){mesh.setMatrixAt(entry.count,matrix);alpha.setX(entry.count,opacity);}
      entry.count++;return true;
    },
    commit(){for(const entry of templates.values())for(const {mesh,alpha}of entry.parts){mesh.count=entry.count;mesh.visible=entry.count>0;if(entry.count){mesh.instanceMatrix.needsUpdate=true;alpha.needsUpdate=true;}}},
    clear(){for(const entry of templates.values())for(const {mesh,materials}of entry.parts){parent.remove(mesh);mesh.geometry.dispose();for(const m of materials)m.dispose();mesh.dispose();}templates.clear();}
  };
}
