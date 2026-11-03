import * as THREE from '../vendor/three.module.js';
export const GAME_CAMERA=Object.freeze({verticalSpan:24.5,maxHorizontalSpan:64,height:22,depth:18,leadZ:.4,creatureHeight:7});
export function gameplayFraming(width,height){const aspect=Math.max(.1,width/Math.max(1,height)),span=Math.min(GAME_CAMERA.verticalSpan,GAME_CAMERA.maxHorizontalSpan/aspect);return{span,halfWidth:span*aspect/2,halfHeight:span/2};}
export function updateGameplayProjection(camera,width,height){const f=gameplayFraming(width,height);camera.left=-f.halfWidth;camera.right=f.halfWidth;camera.top=f.halfHeight;camera.bottom=-f.halfHeight;camera.updateProjectionMatrix();return camera;}
export function applyGameplayCamera(camera,width,height,x=0,z=0){updateGameplayProjection(camera,width,height);camera.position.set(x,GAME_CAMERA.height,z+GAME_CAMERA.leadZ+GAME_CAMERA.depth);camera.lookAt(x,0,z+GAME_CAMERA.leadZ);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);return camera;}
// Enclose the entire visible vertical slab, not only its floor. A tall guardian
// whose feet are below the screen must also remain invisible when first spawned.
export function cameraGroundBounds(camera,maxHeight=GAME_CAMERA.creatureHeight){
  camera.updateMatrixWorld(true);let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  for(const x of[-1,1])for(const y of[-1,1]){const a=new THREE.Vector3(x,y,-1).unproject(camera),b=new THREE.Vector3(x,y,1).unproject(camera),d=b.sub(a);for(const h of[0,maxHeight]){const t=(h-a.y)/d.y,wx=a.x+d.x*t,wz=a.z+d.z*t;minX=Math.min(minX,wx);maxX=Math.max(maxX,wx);minZ=Math.min(minZ,wz);maxZ=Math.max(maxZ,wz);}}
  return{minX,maxX,minZ,maxZ};
}
