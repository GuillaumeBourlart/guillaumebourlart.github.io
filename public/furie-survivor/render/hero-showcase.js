import * as THREE from '../vendor/three.module.js';
import {makeHero,disposeModel} from './models.js';
import {collectionCamera,frameCollectionHero} from './hero-framing.js';

const thumbnailCache=new Map();
let thumbnailKit=null;

function lights(scene){scene.add(new THREE.HemisphereLight('#eef5ff','#352d4d',2));const key=new THREE.DirectionalLight('#ffe8c1',2.8);key.position.set(-5,8,7);scene.add(key);const rim=new THREE.DirectionalLight('#a78dff',1.8);rim.position.set(5,4,-6);scene.add(rim);}


function getThumbnailKit(){
  if(thumbnailKit)return thumbnailKit;
  try{
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});renderer.setPixelRatio(1);renderer.setSize(240,280,false);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    const scene=new THREE.Scene(),camera=collectionCamera(),avatarCamera=new THREE.PerspectiveCamera(30,1,.1,30);lights(scene);thumbnailKit={renderer,scene,camera,avatarCamera};return thumbnailKit;
  }catch{return null;}
}

export function heroThumbnail(hero,{avatar=false}={}){
  const key=hero.id+(avatar?':avatar':'');if(thumbnailCache.has(key))return thumbnailCache.get(key);const kit=getThumbnailKit();if(!kit)return'';
  const model=makeHero(hero);kit.scene.add(model);kit.renderer.setSize(avatar?128:240,avatar?128:280,false);const camera=avatar?kit.avatarCamera:kit.camera;
  if(avatar){const [x,y,z]=model.userData.portraitFocus||[0,2,0];model.rotation.y=-.16;camera.position.set(x,y+.1,z+2.5);camera.lookAt(x,y,z);camera.updateMatrixWorld(true);}else frameCollectionHero(model,camera);
  kit.renderer.render(kit.scene,camera);let url='';try{url=kit.renderer.domElement.toDataURL('image/webp',.9);}catch{}kit.scene.remove(model);disposeModel(model);thumbnailCache.set(key,url);return url;
}

export function modelImage(hero,{large=false,avatar=false}={}){const src=heroThumbnail(hero,{avatar});return src?`<img class="hero-model-image${large?' large':''}${avatar?' avatar':''}" src="${src}" alt="${String(hero.name).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">`:'';}

export {createHeroShowcase} from './ritual-stage.js';
