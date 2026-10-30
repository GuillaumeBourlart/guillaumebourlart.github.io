import {biomeAt} from './game/world.js';

const COLORS={forest:'#395d56',crystal:'#605f81',desert:'#92795d',swamp:'#34565d'};
const POI_COLORS={chest:'#f4d697',shrine:'#c8abff',camp:'#f4a58c',well:'#9ae7d9',portal:'#c6a8ff'};

// A local radar stays useful at any world position. The overview is an explicit
// choice, never a 2 km minimap on which every nearby object becomes a pixel.
export function mapFrame(state,size,mode='radar'){
  const radius=mode==='world'?(state.arenaRadius||1024):mode==='nearby'?120:44;
  const x=mode==='world'?0:state.player.x,z=mode==='world'?0:state.player.z;
  const scale=(size-18)/(radius*2);
  return{radius,x,z,scale,point:(px,pz)=>[size/2+(px-x)*scale,size/2+(pz-z)*scale]};
}

export function drawExpeditionMap(ctx,state,size,{mode='radar'}={}){
  if(!state||!ctx)return;
  const full=mode!=='radar',overview=mode==='world',v=mapFrame(state,size,mode),world=v.point,mid=size/2;
  ctx.clearRect(0,0,size,size);ctx.save();ctx.beginPath();ctx.arc(mid,mid,mid-4,0,Math.PI*2);ctx.clip();
  ctx.fillStyle='#172b43';ctx.fillRect(0,0,size,size);
  const cell=full?18:14;
  for(let y=0;y<size;y+=cell)for(let x=0;x<size;x+=cell){
    const wx=v.x+(x+cell/2-mid)/v.scale,wz=v.z+(y+cell/2-mid)/v.scale;
    if(Math.hypot(wx,wz)>(state.arenaRadius||1024))continue;
    ctx.fillStyle=COLORS[biomeAt(wx,wz)];ctx.fillRect(x,y,cell+1,cell+1);
  }
  const spacing=overview?256:full?32:16;
  ctx.strokeStyle='#e1e8f011';ctx.lineWidth=1;
  for(let x=Math.ceil((v.x-v.radius)/spacing)*spacing;x<v.x+v.radius;x+=spacing){const sx=world(x,v.z)[0];ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,size);ctx.stroke();}
  for(let z=Math.ceil((v.z-v.radius)/spacing)*spacing;z<v.z+v.radius;z+=spacing){const sy=world(v.x,z)[1];ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(size,sy);ctx.stroke();}
  if(overview){
    ctx.fillStyle='#d4edca18';const chunk=state.world?.chunkSize||64;
    for(const c of state.world?.visitedChunks||[]){const p=world(c.x*chunk-chunk/2,c.z*chunk-chunk/2);ctx.fillRect(p[0],p[1],chunk*v.scale,chunk*v.scale);}
    ctx.font='600 12px Outfit, sans-serif';ctx.textAlign='center';
    for(const [name,x,z,color] of [['CRISTAL',0,-560,'#e5d4ff'],['DUNES',590,220,'#f4dbac'],['MARAIS',-590,220,'#b9e7e4'],['FORÊT',0,600,'#d4eac4']]){const p=world(x,z);ctx.fillStyle=color;ctx.fillText(name,p[0],p[1]);}
  }else{
    for(const zone of state.zones||[]){const p=world(zone.x,zone.z);ctx.fillStyle=zone.type==='ice'?'#abddf36e':'#c1a17075';ctx.strokeStyle=zone.type==='ice'?'#cbf1fa9e':'#e4c08b7d';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p[0],p[1],zone.radius*v.scale,0,Math.PI*2);ctx.fill();ctx.stroke();}
    for(const trap of state.traps||[]){const p=world(trap.x,trap.z),r=full?4:2;ctx.fillStyle=trap.phase==='active'||trap.phase==='warning'?'#ff8b91':'#c88c86';ctx.beginPath();ctx.moveTo(p[0],p[1]-r);ctx.lineTo(p[0]+r,p[1]+r);ctx.lineTo(p[0]-r,p[1]+r);ctx.closePath();ctx.fill();}
    for(const item of state.pickups||[]){const p=world(item.x,item.z);ctx.fillStyle='#a9f1bd';ctx.fillRect(p[0]-2,p[1]-2,4,4);}
  }
  const home=world(0,0);ctx.fillStyle='#e9e4c9';ctx.strokeStyle='#172539';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(home[0],home[1]-6);ctx.lineTo(home[0]+6,home[1]);ctx.lineTo(home[0]+4,home[1]);ctx.lineTo(home[0]+4,home[1]+5);ctx.lineTo(home[0]-4,home[1]+5);ctx.lineTo(home[0]-4,home[1]);ctx.lineTo(home[0]-6,home[1]);ctx.closePath();ctx.fill();ctx.stroke();
  for(const poi of state.mapPOIs||state.pois||[]){
    if(!poi.discovered)continue;const [x,y]=world(poi.x,poi.z),r=full?(overview?3.2:5):2.6;
    if(x<0||x>size||y<0||y>size)continue;
    ctx.globalAlpha=poi.completed?.3:1;ctx.fillStyle=POI_COLORS[poi.type]||'#eee7b3';ctx.strokeStyle='#172539';ctx.lineWidth=full?1.5:1;ctx.beginPath();
    if(poi.type==='chest'||poi.type==='camp')ctx.rect(x-r,y-r,r*2,r*2);
    else if(poi.type==='shrine'){ctx.moveTo(x,y-r*1.4);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r*1.4);ctx.lineTo(x-r,y);ctx.closePath();}
    else ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  ctx.globalAlpha=1;
  for(const e of state.enemies||[]){if(e.hp<=0||overview&&e.type!=='boss')continue;const p=world(e.x,e.z),boss=e.type==='boss';ctx.fillStyle=boss?'#ff8793':'#e79191';ctx.beginPath();ctx.arc(p[0],p[1],boss?(full?6:3.5):(full?2:1.5),0,Math.PI*2);ctx.fill();}
  const [x,y]=world(state.player.x,state.player.z);ctx.fillStyle='#f6f9c0';ctx.shadowColor='#d4f5b7';ctx.shadowBlur=full?12:5;ctx.beginPath();ctx.arc(x,y,full?6:3.7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle='#f0ffbd';ctx.lineWidth=full?2:1.5;const dx=Math.sin(state.player.angle),dz=Math.cos(state.player.angle);ctx.beginPath();ctx.moveTo(x+dx*8,y+dz*8);ctx.lineTo(x+dx*(full?20:12),y+dz*(full?20:12));ctx.stroke();
  if(full){const length=overview?256:50,px=length*v.scale;ctx.strokeStyle='#e7ebdfb3';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mid-px/2,size-35);ctx.lineTo(mid+px/2,size-35);ctx.stroke();ctx.fillStyle='#eef1df';ctx.font='500 11px Outfit, sans-serif';ctx.textAlign='center';ctx.fillText(length+' m',mid,size-18);}
  ctx.restore();
}
