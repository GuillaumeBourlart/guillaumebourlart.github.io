import * as THREE from '../vendor/three.module.js';
import {GEO,group,mesh,flat} from './models.js';
const glow=new THREE.MeshBasicMaterial({color:'#51ddff',transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});
const body=new THREE.MeshBasicMaterial({color:'#5ee1ff'}),core=new THREE.MeshBasicMaterial({color:'#f0ffff'}),rim=new THREE.MeshBasicMaterial({color:'#12334c',side:THREE.BackSide});
export function makeExperience(){
  const root=group();root.name='experience-pickup';
  const halo=mesh(GEO.disc,glow,0,.065,0,.63,.63,1,root);halo.rotation.x=-Math.PI/2;
  const crystal=group(root,0,.48,0);mesh(GEO.gem,rim,0,0,0,.23,.38,.23,crystal);mesh(GEO.gem,body,0,.02,.025,.185,.31,.185,crystal);mesh(GEO.gem,core,.055,.07,.12,.06,.17,.055,crystal);
  const glint=mesh(GEO.star,flat('#eaffff',.95),0,.99,0,.10,.16,.10,root);root.userData={crystal,halo,glint};return root;
}
export function updateExperience(root,gem,time,quiet=false){
  const phase=typeof gem.id==='number'?gem.id:0,large=gem.value>=12,scale=large?1.3:gem.value>=5?1.13:1;
  root.position.set(gem.x,0,gem.z);root.scale.setScalar(scale);
  root.userData.crystal.position.y=.48+(quiet?0:Math.sin(time*2.4+phase)*.07);root.userData.crystal.rotation.y=quiet?.35:time*.8+phase;
  root.userData.halo.scale.setScalar(.63*(quiet?1:1+Math.sin(time*2+phase)*.08));root.userData.glint.rotation.y=quiet?0:-time*.5;
}
