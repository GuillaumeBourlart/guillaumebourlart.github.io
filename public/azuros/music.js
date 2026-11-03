const tracks={camp:'./assets/audio/music/camp.mp3',expedition:'./assets/audio/music/expedition.mp3'};

export function createMusic(context,output){
  if(typeof window.Audio!=='function'||!context.createMediaElementSource)return null;
  const channels=new Map();let active='',target=-1,disposed=false;
  function channel(key){
    if(channels.has(key))return channels.get(key);
    const media=new window.Audio();media.loop=true;media.preload='none';media.src=tracks[key];
    const source=context.createMediaElementSource(media),gain=context.createGain();
    gain.gain.value=0;source.connect(gain);gain.connect(output);
    const entry={media,source,gain,timer:null,unlocked:false,starting:null};channels.set(key,entry);return entry;
  }
  function fade(entry,volume){
    clearTimeout(entry.timer);
    const {media,gain}=entry,now=context.currentTime;
    gain.gain.cancelAndHoldAtTime?.(now);
    if(!gain.gain.cancelAndHoldAtTime)gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(volume,now,volume?.28:.17);
    if(volume){if(media.paused)start(entry);}
    else entry.timer=setTimeout(()=>media.pause(),950);
  }
  function start(entry,key){
    if(entry.starting)return;
    entry.starting=entry.media.play().then(()=>{
      entry.unlocked=true;if(key&&key!==active)entry.media.pause();
    }).catch(()=>{}).finally(()=>{entry.starting=null;});
  }
  function mix(scene,volume){
    if(disposed)return;
    const next=volume?scene:'';
    if(next===active&&volume===target)return;
    active=next;target=volume;
    if(active)channel(active);
    for(const [key,entry] of channels)fade(entry,key===active?volume:0);
  }
  return{mix,retry(){const entry=channels.get(active);if(entry?.media.paused)start(entry);},prime(){
    // Safari grants playback per media element. Unlock both in the first gesture
    // so a network-driven transition can start the expedition track later.
    for(const key of Object.keys(tracks)){const entry=channel(key);if(!entry.unlocked)start(entry,key);}
  },dispose(){
    disposed=true;for(const entry of channels.values()){clearTimeout(entry.timer);entry.media.pause();entry.media.removeAttribute('src');entry.media.load();entry.source.disconnect();entry.gain.disconnect();}channels.clear();
  }};
}
