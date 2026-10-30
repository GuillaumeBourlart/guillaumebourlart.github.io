import * as THREE from '../vendor/three.module.js';
import {TAU,GEO,material,flat,mesh,disc,ring,group,makeHero} from './models.js';

const thumbnailCache=new Map();
let thumbnailKit=null;

function lights(scene){scene.add(new THREE.HemisphereLight('#eef5ff','#352d4d',2));const key=new THREE.DirectionalLight('#ffe8c1',2.8);key.position.set(-5,8,7);scene.add(key);const rim=new THREE.DirectionalLight('#a78dff',1.8);rim.position.set(5,4,-6);scene.add(rim);}
function frameHero(heroModel,camera,hero){const scale=.9/(heroModel.userData.baseScale||1);heroModel.scale.setScalar(scale);heroModel.position.set(0,-.2,0);heroModel.rotation.y=-.32;camera.position.set(0,2.1,7);camera.lookAt(0,1.25,0);camera.updateMatrixWorld(true);}

function getThumbnailKit(){
  if(thumbnailKit)return thumbnailKit;
  try{
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});renderer.setPixelRatio(1);renderer.setSize(240,280,false);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,240/280,.1,30);lights(scene);thumbnailKit={renderer,scene,camera};return thumbnailKit;
  }catch{return null;}
}

export function heroThumbnail(hero){
  if(thumbnailCache.has(hero.id))return thumbnailCache.get(hero.id);const kit=getThumbnailKit();if(!kit)return'';
  const model=makeHero(hero);kit.scene.add(model);frameHero(model,kit.camera,hero);kit.renderer.render(kit.scene,kit.camera);let url='';try{url=kit.renderer.domElement.toDataURL('image/webp',.9);}catch{}kit.scene.remove(model);thumbnailCache.set(hero.id,url);return url;
}

export function modelImage(hero,{large=false}={}){const src=heroThumbnail(hero);return src?`<img class="hero-model-image${large?' large':''}" src="${src}" alt="${String(hero.name).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">`:'';}

export function createHeroShowcase(container){
  let renderer=null,scene=null,camera=null,heroModel=null,heroId='',mode='idle',rarityColor='#9f8ae8',start=performance.now(),frame=0,observer=null,crystal=null,halo=null,particles=[];
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(1.5,devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(31,1,.1,40);lights(scene);container.appendChild(renderer.domElement);
    const stage=group(scene);mesh(GEO.cylinder16,material('#252a47'),0,-.12,0,1.65,.24,1.65,stage);disc(material('#4c4675'),0,.02,0,1.52,stage);halo=ring(flat('#b59bff',.75),0,.06,0,1.43,stage);crystal=mesh(GEO.gem,material('#b59bff',.4),0,1.35,0,.62,1.15,.62,stage);
    for(let i=0;i<18;i++){const p=mesh(GEO.gem,material(i%3?'#fff3c4':'#cdb2ff',.35),0,0,0,.045,.1,.045,stage);p.userData={a:i/18*TAU,r:.8+(i%5)*.22,speed:.35+(i%4)*.08,phase:i*.7};particles.push(p);}
    camera.position.set(0,2.2,7);camera.lookAt(0,1.25,0);
    const resize=()=>{const rect=container.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};observer=new ResizeObserver(resize);observer.observe(container);resize();
    const animate=now=>{frame=requestAnimationFrame(animate);if(container.offsetParent===null)return;const t=(now-start)/1000;halo.material.color.set(rarityColor);crystal.material.color.set(rarityColor);halo.rotation.z=t*(mode==='charging'?1.4:.28);crystal.visible=mode==='charging';crystal.rotation.y=t*2.2;crystal.scale.setScalar(mode==='charging'?.88+Math.sin(t*4)*.09:.01);for(const p of particles){const u=p.userData,a=u.a+t*u.speed;p.position.set(Math.sin(a)*u.r,.35+(Math.sin(t*2+u.phase)+1)*.7,Math.cos(a)*u.r);p.visible=mode!=='idle';}if(heroModel){heroModel.visible=mode==='revealed';if(mode==='revealed'){const reveal=Math.min(1,(now-start)/720),ease=1-Math.pow(1-reveal,3),base=.88/(heroModel.userData.baseScale||1);heroModel.scale.setScalar(base*ease);heroModel.position.y=-.18+(1-ease)*1.8+Math.sin(t*2.4)*.025;heroModel.rotation.y=-.38+t*.24;}}renderer.render(scene,camera);};frame=requestAnimationFrame(animate);
  }catch{container.dataset.fallback='true';}
  function setHero(hero,color,reveal=false){if(!scene)return;rarityColor=color||rarityColor;if(heroModel){scene.remove(heroModel);heroModel=null;}heroModel=makeHero(hero);scene.add(heroModel);heroId=hero.id;mode=reveal?'revealed':'charging';start=performance.now();}
  return{charge(hero,color){setHero(hero,color,false);},reveal(hero,color){if(hero.id!==heroId)setHero(hero,color,true);else{rarityColor=color||rarityColor;mode='revealed';start=performance.now();}},clear(){mode='idle';if(heroModel)heroModel.visible=false;},dispose(){cancelAnimationFrame(frame);observer?.disconnect();renderer?.dispose();renderer?.domElement.remove();}};
}
