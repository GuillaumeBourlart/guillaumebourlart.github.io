import * as THREE from '../vendor/three.module.js';
import {GEO,makeHero,disposeModel} from './models.js';
import {animateAsset} from './asset-library.js';

export function createHeroShowcase(container,{altar=false}={}){
  if(!container)return {charge(){},omen(){},reveal(){},clear(){},dispose(){}};
  let renderer,scene,camera,observer,frame=0,lastRender=0,model=null,heroId='',mode=altar?'sanctuary':'idle',color='#a5d7ed',started=performance.now();
  const materials=[],geometries=[],rings=[],motes=[],shards=[],v=new THREE.Vector3();
  const material=(c,options={})=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.62,...options});materials.push(m);return m;};
  const glow=(c,opacity=1)=>{const m=new THREE.MeshBasicMaterial({color:c,transparent:opacity<1,opacity,depthWrite:opacity===1});materials.push(m);return m;};
  const mesh=(geometry,mat,parent,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;};
  let crystal,core,light,energy;
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(1.5,devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;container.appendChild(renderer.domElement);
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(31,1,.1,40);camera.position.set(0,3.1,8.2);camera.lookAt(0,1.35,0);
    scene.add(new THREE.HemisphereLight('#d6e9fc','#111b32',2.6));
    const key=new THREE.DirectionalLight('#fff0d5',3.2);key.position.set(-4,7,6);scene.add(key);
    const rim=new THREE.DirectionalLight('#bda4ff',2.5);rim.position.set(4,3,-4);scene.add(rim);
    light=new THREE.PointLight(color,7,8,1.5);light.position.set(0,2.5,1);scene.add(light);
    const base=material('#142a37',{metalness:.32}),stone=material('#29424e'),gold=material('#c8b887',{metalness:.6,roughness:.28});
    mesh(GEO.cylinder16,base,scene,0,-.23,0,1.82,.24,1.82);
    mesh(GEO.cylinder16,gold,scene,0,-.095,0,1.77,.026,1.77);
    mesh(GEO.cylinder16,stone,scene,0,-.015,0,1.64,.13,1.64);
    mesh(GEO.cylinder16,base,scene,0,.055,0,1.51,.025,1.51);
    const torus=new THREE.TorusGeometry(1,.012,5,80);geometries.push(torus);
    for(const radius of[1.25,1.47,1.9]){const r=mesh(torus,glow(color,.75),scene,0,.08,0,radius,radius,radius);r.rotation.x=-Math.PI/2;rings.push(r);}
    for(let i=0;i<12;i++){
      const a=i/12*Math.PI*2,x=Math.sin(a)*1.35,z=Math.cos(a)*1.35;
      const rune=mesh(GEO.gem,gold,scene,x,.09,z,.025,.012,.09);rune.rotation.y=a;
    }
    for(let i=0;i<6;i++){
      const a=i/6*Math.PI*2,x=Math.sin(a)*1.88,z=Math.cos(a)*1.88;
      mesh(GEO.cylinder,base,scene,x,.07,z,.18,.45,.18);
      mesh(GEO.cylinder,gold,scene,x,.3,z,.2,.025,.2);
      const shard=mesh(GEO.gem,material(color,{emissive:color,emissiveIntensity:.5,metalness:.2}),scene,x,.57,z,.11,.3,.11);shards.push(shard);
    }
    crystal=new THREE.Group();scene.add(crystal);
    core=mesh(GEO.gem,material(color,{emissive:color,emissiveIntensity:.65,metalness:.1,roughness:.15}),crystal,0,0,0,.44,.77,.44);
    mesh(GEO.gem,material('#e7f6ff',{wireframe:true,transparent:true,opacity:.25}),crystal,0,0,0,.49,.84,.49);
    const band=mesh(torus,gold,crystal,0,0,0,.74,.74,.74);band.rotation.x=.8;band.rotation.y=.3;
    energy=mesh(GEO.cylinder16,glow(color,.06),scene,0,2.3,0,.64,4.5,.64);
    for(let i=0;i<30;i++){
      const m=mesh(GEO.gem,glow(i%4?'#d5e9f2':color,.7),scene,0,0,0,.016,.045,.016);m.userData={angle:i*2.4,r:.7+(i%7)*.16,h:(i/30)*3.8};motes.push(m);
    }
    const resize=()=>{const b=container.getBoundingClientRect();if(!b.width||!b.height)return;renderer.setSize(b.width,b.height,false);camera.aspect=b.width/b.height;camera.zoom=Math.min(1,camera.aspect/(altar?1.12:1));camera.updateProjectionMatrix();};observer=new ResizeObserver(resize);observer.observe(container);resize();
    const animate=now=>{
      frame=requestAnimationFrame(animate);if(container.offsetParent===null||now-lastRender<25)return;lastRender=now;
      const quiet=document.body.dataset.reducedMotion==='true',t=quiet?0:(now-started)/1000,invoking=['gathering','omen','sanctuary'].includes(mode),charged=mode==='omen';
      core.material.color.set(color);core.material.emissive.set(color);light.color.set(color);light.intensity=charged?9:5;
      crystal.visible=invoking;crystal.position.y=1.7+(quiet?0:Math.sin(t*1.7)*.10);crystal.rotation.y=t*(charged?.85:.4);crystal.rotation.z=.12;
      energy.visible=charged;energy.material.color.set(color);
      for(const [i,r] of rings.entries()){r.material.color.set(color);r.material.opacity=charged?.9:.45;r.rotation.z=t*(i%2?-.12:.15);}
      for(const [i,s] of shards.entries()){s.material.color.set(color);s.material.emissive.set(color);s.position.y=.57+(quiet?0:Math.sin(t*1.8+i)*.035);}
      for(const m of motes){const u=m.userData,a=u.angle+t*.16,h=(u.h+t*(charged?.55:.17))%3.8;m.position.set(Math.sin(a)*u.r,.25+h,Math.cos(a)*u.r);m.visible=mode!=='idle';}
      if(model){
        model.visible=mode==='revealed';
        if(model.visible){const p=quiet?1:Math.min(1,(now-started)/850),ease=1-Math.pow(1-p,3);model.scale.setScalar(model.userData.ritualScale*(.94+.06*ease));model.position.y=model.userData.ritualY+(1-ease)*.4;model.rotation.y=-.27+(quiet?0:Math.sin(t*.35)*.17);animateAsset(model,{time:now/1000,menu:true,reducedMotion:quiet});}
      }
      renderer.render(scene,camera);
    };frame=requestAnimationFrame(animate);
  }catch{container.dataset.fallback='true';}
  function setHero(hero){
    if(!scene||heroId===hero.id)return;
    if(model){scene.remove(model);disposeModel(model);}
    model=makeHero(hero);model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(v),scale=Math.min(2.9/size.y,2.8/size.x);
    model.userData.ritualScale=scale;model.userData.ritualY=.12-bounds.min.y*scale;model.position.x=-(bounds.min.x+bounds.max.x)*.5*scale;model.visible=false;scene.add(model);heroId=hero.id;
  }
  return {
    charge(hero,c){setHero(hero);color=c||'#acd9ed';mode='gathering';started=performance.now();},
    omen(c){color=c||color;mode='omen';},
    reveal(hero,c){setHero(hero);color=c||color;mode='revealed';started=performance.now();},
    clear(){mode=altar?'sanctuary':'idle';if(model)model.visible=false;},
    dispose(){cancelAnimationFrame(frame);observer?.disconnect();if(model)disposeModel(model);for(const m of materials)m.dispose();for(const g of geometries)g.dispose();renderer?.dispose();renderer?.domElement.remove();}
  };
}
