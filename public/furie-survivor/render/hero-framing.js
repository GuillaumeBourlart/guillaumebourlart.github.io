import * as THREE from '../vendor/three.module.js';

// Every full-body card uses the same camera and gameplay scale. Face avatars are separate.
export const COLLECTION_FRAME_HEIGHT=5.3;
export function frameCollectionHero(model,camera,aspect=240/280){
  model.scale.setScalar(model.userData.baseScale||1);model.rotation.y=-.32;
  model.position.set(0,model.userData.floating?.2:0,0);
  camera.left=-COLLECTION_FRAME_HEIGHT*aspect/2;camera.right=COLLECTION_FRAME_HEIGHT*aspect/2;
  camera.top=COLLECTION_FRAME_HEIGHT/2;camera.bottom=-COLLECTION_FRAME_HEIGHT/2;
  camera.position.set(0,2.1,9);camera.lookAt(0,1.8,0);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
}
export function collectionCamera(aspect=240/280){return new THREE.OrthographicCamera(-COLLECTION_FRAME_HEIGHT*aspect/2,COLLECTION_FRAME_HEIGHT*aspect/2,COLLECTION_FRAME_HEIGHT/2,-COLLECTION_FRAME_HEIGHT/2,.1,40);}
