import * as THREE from '../vendor/three.module.js';
import {paintedTexture} from './textures.js';

const colors={forest:'#365e54',crystal:'#626e86',desert:'#b3987c',swamp:'#3e6267'};
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function terrainWeights(x,z){
  const c=1-smooth(-32-Math.abs(x)*.22,-20-Math.abs(x)*.22,z),d=smooth(22+Math.max(0,z)*.32,34+Math.max(0,z)*.32,x),s=1-smooth(-34-Math.max(0,z)*.32,-22-Math.max(0,z)*.32,x);
  return{forest:(1-c)*(1-d)*(1-s),crystal:c,desert:(1-c)*d,swamp:(1-c)*(1-d)*s};
}
let surface;
const fallback=new Map();
export function terrainMaterial(x,z,{software=false}={}){
  if(software||typeof document==='undefined'){
    const weights=terrainWeights(x,z),color=new THREE.Color(0);for(const key of Object.keys(colors))color.add(new THREE.Color(colors[key]).multiplyScalar(weights[key]));
    const key=color.getHexString();if(!fallback.has(key))fallback.set(key,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));return fallback.get(key);
  }
  if(surface)return surface;
  surface=new THREE.ShaderMaterial({name:'world-anchored-biome-ground',side:THREE.DoubleSide,
    uniforms:Object.fromEntries(Object.entries(colors).map(([key,color])=>[key,{value:paintedTexture(key,color)}])),
    vertexShader:`varying vec2 worldXZ;void main(){vec4 p=modelMatrix*vec4(position,1.);worldXZ=p.xz;gl_Position=projectionMatrix*viewMatrix*p;}`,
    fragmentShader:`uniform sampler2D forest;uniform sampler2D crystal;uniform sampler2D desert;uniform sampler2D swamp;varying vec2 worldXZ;
      void main(){float x=worldXZ.x,z=worldXZ.y;float c=1.-smoothstep(-32.-abs(x)*.22,-20.-abs(x)*.22,z);float d=smoothstep(22.+max(0.,z)*.32,34.+max(0.,z)*.32,x);float s=1.-smoothstep(-34.-max(0.,z)*.32,-22.-max(0.,z)*.32,x);
      vec2 uv=abs(fract((worldXZ*vec2(1.,-1.)+6.)/24.)*2.-1.);
      gl_FragColor=texture2D(forest,uv)*((1.-c)*(1.-d)*(1.-s))+texture2D(crystal,uv)*c+texture2D(desert,uv)*((1.-c)*d)+texture2D(swamp,uv)*((1.-c)*(1.-d)*s);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`});
  return surface;
}
