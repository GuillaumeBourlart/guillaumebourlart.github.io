const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Intersect the projected target's direction with a safe rectangle on screen.
export function edgePosition(point,width,height){
  const cx=width/2,cy=height/2,dx=point.x-cx,dy=point.y-cy;
  const left=38,right=width-38,top=Math.min(112,height*.25),bottom=height-Math.min(105,height*.24);
  const tx=dx>0?(right-cx)/dx:dx<0?(left-cx)/dx:Infinity,ty=dy>0?(bottom-cy)/dy:dy<0?(top-cy)/dy:Infinity;
  const t=Math.min(tx,ty);
  return{x:clamp(cx+dx*(Number.isFinite(t)?t:0),left,right),y:clamp(cy+dy*(Number.isFinite(t)?t:0),top,bottom),angle:Math.atan2(dy,dx)+Math.PI/2};
}
export function directionTargets(state){
  const targets=[];
  if(['offer','activating'].includes(state.rift?.phase)&&!state.rift.arenaActive){const poi=state.pois.find(p=>p.id===state.rift.poiId);if(poi)targets.push({id:'rift',kind:'rift',x:poi.x,z:poi.z,label:'Faille'});}
  for(const m of state.party||[])if(m.id!==state.player.playerId&&m.player.hp<=0)targets.push({id:m.id,kind:'revive',...m.player,label:m.name||'Allié',progress:m.player.reviveProgress||0});
  return targets;
}
export function createDirections(){
  const layer=document.createElement('div');layer.className='direction-layer';layer.hidden=true;document.body.append(layer);const nodes=new Map();
  function node(target){let el=nodes.get(target.id);if(!el){el=document.createElement('div');el.innerHTML='<span class="direction-symbol" aria-hidden="true">↑</span><span class="direction-label"></span><small></small><span class="revive-meter" role="progressbar" aria-label="Réanimation" aria-valuemin="0" aria-valuemax="100"><i></i></span>';layer.append(el);nodes.set(target.id,el);}return el;}
  return{update(state,project,{blocked=false}={}){
    layer.hidden=blocked||state.phase!=='playing';if(layer.hidden)return;const active=new Set(),occupied=[],width=window.innerWidth,height=window.innerHeight;
    const hud=[...document.querySelectorAll('.vitals,#run-clock-button,#minimap-button,#map-button,#pause-button,#discovery-hint,.team-hud')].filter(el=>el.getClientRects().length).map(el=>el.getBoundingClientRect());
    for(const target of directionTargets(state)){
      const p=project(target.x,target.z,1.4),visible=p.visible,near=Math.hypot(state.player.x-target.x,state.player.z-target.z)<=3,canRevive=state.player.hp>0;
      if(target.kind==='rift'&&visible)continue;
      const el=node(target);active.add(target.id);el.hidden=false;el.className=`direction-marker ${target.kind} ${visible?'on-screen':'off-screen'}`;
      const position=visible?{x:clamp(p.x,64,width-64),y:clamp(p.y-30,105,height-95),angle:0}:edgePosition(p,width,height);
      if(!visible)for(const rect of hud)if(position.x+48>rect.left&&position.x-48<rect.right&&position.y+40>rect.top&&position.y-24<rect.bottom)position.y=clamp(rect.bottom+34>height-100?rect.top-44:rect.bottom+34,112,height-100);
      for(const other of occupied)if(Math.hypot(position.x-other.x,position.y-other.y)<58)position.y=clamp(other.y+58,112,height-100);occupied.push(position);
      el.style.left=position.x+'px';el.style.top=position.y+'px';el.querySelector('.direction-symbol').style.transform=`rotate(${position.angle}rad)`;
      el.querySelector('.direction-symbol').textContent=visible?'✚':'↑';el.querySelector('.direction-label').textContent=target.label;
      el.querySelector('small').textContent=visible?(near&&canRevive?'Reste près · '+Math.max(0,4*(1-target.progress)).toFixed(1).replace('.',',')+' s':canRevive?'Approche pour réanimer':'Un allié peut le relever'):Math.ceil(Math.hypot(state.player.x-target.x,state.player.z-target.z))+' m';
      const meter=el.querySelector('.revive-meter');meter.hidden=target.kind!=='revive'||!visible;meter.setAttribute('aria-valuenow',Math.round(target.progress*100));meter.querySelector('i').style.transform=`scaleX(${target.progress})`;
    }
    for(const[id,el]of nodes)if(!active.has(id)){el.remove();nodes.delete(id);}
  }};
}
