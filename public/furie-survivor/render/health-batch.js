import * as THREE from '../vendor/three.module.js';

// Preserve the existing camera-facing bars; submit their three layers together.
export function createHealthBatch(parent,{capacity=512}={}){
  const layers=[],base=new THREE.Matrix4(),world=new THREE.Matrix4();let count=0;
  return {
    begin(){count=0;},
    capture(root,bar){
      if(!bar.visible||count>=capacity)return;
      if(!layers.length)for(const child of bar.children){const mesh=new THREE.InstancedMesh(child.geometry.clone(),child.material.clone(),capacity);mesh.name='enemy-health-instances';mesh.renderOrder=child.renderOrder;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.count=0;parent.add(mesh);layers.push(mesh);}
      root.updateMatrix();bar.updateMatrix();base.multiplyMatrices(root.matrix,bar.matrix);
      for(let i=0;i<layers.length;i++){bar.children[i].updateMatrix();world.multiplyMatrices(base,bar.children[i].matrix);layers[i].setMatrixAt(count,world);}
      count++;bar.visible=false;
    },
    commit(){for(const layer of layers){layer.count=count;layer.visible=count>0;if(count)layer.instanceMatrix.needsUpdate=true;}},
    dispose(){for(const layer of layers){parent.remove(layer);layer.geometry.dispose();layer.material.dispose();layer.dispose();}layers.length=0;}
  };
}
