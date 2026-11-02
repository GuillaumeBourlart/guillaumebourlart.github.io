import * as THREE from '../vendor/three.module.js';

// Retain a skeleton's pose between animation samples. The mesh still follows its
// actor every frame: newMeshWorld × inverseSampledMeshWorld moves the cached skin.
export function cacheSkeletonPose(asset){
  const rig=asset?.userData.rig;if(!rig||rig.poseCache)return;rig.poseCache=true;rig.poseVersion??=0;
  const roots=new Set(),skeletons=new Set();
  asset.traverse(mesh=>{
    if(!mesh.isSkinnedMesh)return;
    const update=mesh.updateMatrixWorld,inverse=new THREE.Matrix4();let version=-1;
    mesh.updateMatrixWorld=function(force){update.call(this,force);if(version!==rig.poseVersion){inverse.copy(this.bindMatrixInverse);version=rig.poseVersion;}else this.bindMatrixInverse.copy(inverse);};
    if(!skeletons.has(mesh.skeleton)){
      const skeleton=mesh.skeleton,updateSkeleton=skeleton.update;let sampled=-1;
      skeleton.update=function(){if(sampled!==rig.poseVersion){updateSkeleton.call(this);sampled=rig.poseVersion;}};skeletons.add(skeleton);
    }
    for(const bone of mesh.skeleton.bones)if(!bone.parent?.isBone)roots.add(bone);
  });
  for(const bone of roots){const update=bone.updateMatrixWorld;let version=-1;bone.updateMatrixWorld=function(force){if(version!==rig.poseVersion){update.call(this,force);version=rig.poseVersion;}};}
}
