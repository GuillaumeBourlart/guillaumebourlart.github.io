import {getHero} from '../game/catalog.js';
import {escapeHTML as esc,icon,portrait} from '../portraits.js';

export function createOnlineUI({onOpen=()=>{},onClose=()=>{},onGoogle,onPassword,onReset,onLogout,onCreate,onJoin,onReady,onStart,onLeave,onRetry,getAccount=()=>null,getRoom=()=>null}={}){
  let panel='',create=false,busy=false,lastFocus=null,available=false,status='Connexion aux comptes…',room=null,actionVersion=0;
  const button=document.createElement('button');button.id='account-button';button.className='account-entry';button.innerHTML=icon('heroes')+'<span>Compte</span>';button.setAttribute('aria-label','Connexion et compte');document.querySelector('.header-right').append(button);
  const layer=document.createElement('section');layer.className='online-overlay';layer.hidden=true;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Compte et groupe');
  layer.innerHTML='<div class="online-dialog"><button class="online-close" data-action="close" aria-label="Fermer">'+icon('close')+'</button><div id="online-content"></div><p id="online-message" class="online-message" role="status" aria-live="polite"></p></div>';document.body.append(layer);
  const content=layer.querySelector('#online-content'),message=layer.querySelector('#online-message');
  const team=document.createElement('aside');team.className='team-hud';team.hidden=true;team.setAttribute('aria-label','Ton groupe');document.body.append(team);
  const banner=document.createElement('div');banner.className='network-banner';banner.hidden=true;banner.setAttribute('role','status');document.body.append(banner);
  // A short delay in the snapshots is shown as a small signal icon instead of a message.
  const weak=document.createElement('div');weak.className='network-weak';weak.hidden=true;weak.setAttribute('role','img');weak.setAttribute('aria-label','Connexion instable');weak.innerHTML='<i></i><i></i><i></i>';document.body.append(weak);
  function show(next){if(!panel)lastFocus=document.activeElement;panel=next;layer.hidden=false;document.getElementById('game').inert=true;onOpen();render();queueMicrotask(()=>content.querySelector('input,button')?.focus());}
  function close(){panel='';busy=false;actionVersion++;layer.hidden=true;document.getElementById('game').inert=false;onClose();if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});}
  function render(){
    if(!panel)return;message.textContent='';
    const account=getAccount(),user=account?.user;
    if(panel==='account'){
      if(user){
        const providers=account.providers;
        content.innerHTML=`<span class="eyebrow">TA LÉGENDE, PARTOUT</span><h2>Ton <em>compte.</em></h2><p class="online-email">${esc(user.email||user.displayName||'Aventurier')}</p><div class="provider-chips">${providers.includes('google.com')?'<span>✓ Google</span>':''}${providers.includes('password')?'<span>✓ Mot de passe</span>':''}</div><p class="online-subtitle">${esc(status)}</p>${!providers.includes('google.com')?'<button class="google-button" data-action="google"><b>G</b> Relier Google</button>':''}${!providers.includes('password')?`<details class="optional-password"><summary>Ajouter un mot de passe <small>Facultatif</small></summary><p>Google suffit pour te connecter et garder ta progression.</p><form id="account-form"><label>E-mail<input name="email" type="email" value="${esc(user.email||'')}" readonly autocomplete="email" required></label><label>Nouveau mot de passe<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><button class="primary-button" type="submit">Ajouter ce mode de connexion</button></form></details>`:''}<p class="online-note">Les méthodes liées ouvrent la même carrière.</p><div class="account-tools"><button data-action="retry">Actualiser</button><button data-action="logout">Se déconnecter</button></div>`;
      }else{
        content.innerHTML=`<span class="eyebrow">GARDE TA LÉGENDE</span><h2>Rejoins <em>l’aventure.</em></h2><p class="online-subtitle">Ta collection sauvegardée. Le coop jusqu’à 4.</p><button class="google-button" data-action="google" ${available?'':'disabled'}><b>G</b> Continuer avec Google</button><div class="auth-divider"><span>ou avec ton e-mail</span></div><div class="auth-tabs"><button data-action="login" class="${create?'':'active'}">Connexion</button><button data-action="signup" class="${create?'active':''}">Créer un compte</button></div><form id="account-form"><label>E-mail<input name="email" type="email" autocomplete="email" required></label><label>Mot de passe<input name="password" type="password" minlength="8" autocomplete="${create?'new-password':'current-password'}" required></label><button class="primary-button" type="submit" ${available?'':'disabled'}>${create?'Créer ma carrière':'Se connecter'} <span>↗</span></button></form>${!create?'<button class="online-link" data-action="reset">Mot de passe oublié</button>':''}<p class="online-note">Ton ancienne carrière reste disponible sur cet appareil.</p>`;
      }
    }else{
      if(room){
        const me=room.members.find(m=>m.id===user?.uid),host=room.host===user?.uid,ready=room.members.every(m=>m.ready&&m.connected);
        content.innerHTML=`<span class="eyebrow">L’AZUR SE PARTAGE</span><h2>Ta <em>compagnie.</em></h2><button class="room-code" data-action="copy" aria-label="Copier le code du groupe"><small>CODE DU GROUPE</small><strong>${esc(room.code)}</strong><span>Copier l’invitation ↗</span></button><div class="party-slots">${Array.from({length:room.maxPlayers},(_,i)=>{const m=room.members[i];if(!m)return'<div class="party-slot empty"><span>＋</span><small>Place libre</small></div>';const h=getHero(m.heroId);return`<div class="party-slot" style="--ally:${h.color}"><span class="party-portrait">${portrait(h)}</span><div><strong>${esc(m.name)}</strong><small>${esc(h.name)}${room.host===m.id?' · chef':''}</small></div><b class="${m.ready&&m.connected?'ready':''}">${!m.connected?'Reconnexion':m.ready?'Prêt':'En attente'}</b></div>`;}).join('')}</div><button class="${me?.ready?'secondary':'primary'}-button" data-action="ready">${me?.ready?'Annuler · je ne suis plus prêt':'Je suis prêt'}</button>${host?`<button class="primary-button" data-action="start" ${ready?'':'disabled'}>Partir ensemble <span>↗</span></button>`:'<p class="online-note">Le chef lance le départ quand tout le monde est prêt.</p>'}<button class="online-link" data-action="leave">Quitter le groupe</button>`;
      }else content.innerHTML=`<span class="eyebrow">JUSQU’À 4 AVENTURIERS</span><h2>Ensemble, <em>plus loin.</em></h2><p class="online-subtitle">Plus de monstres. L’XP partagée. Chacun son héros.</p><button class="primary-button" data-action="create">Créer un groupe <span>＋</span></button><div class="auth-divider"><span>ou retrouver tes amis</span></div><form id="join-form"><label>Code du groupe<input name="code" maxlength="6" minlength="6" pattern="[a-fA-F0-9]{6}" placeholder="A1B2C3" autocomplete="off" value="${esc(new URL(location.href).searchParams.get('room')?.slice(0,6)||'')}" required></label><button class="secondary-button" type="submit">Rejoindre le groupe <span>→</span></button></form><p class="online-note">Choisis ton héros au camp avant de rejoindre.</p>`;
    }
  }
  async function action(fn,external=false){if(busy)return;busy=true;const version=++actionVersion;message.textContent='Un instant…';const hint=external?setTimeout(()=>{if(panel&&version===actionVersion)message.textContent='Si aucune fenêtre Google ne s’ouvre, autorise les popups ou ouvre le jeu dans ton navigateur.';},8000):null;try{await fn();if(version===actionVersion&&panel&&message.textContent==='Un instant…')message.textContent='';}catch(error){if(version===actionVersion)message.textContent=error.message||'Action impossible.';}finally{clearTimeout(hint);if(version===actionVersion)busy=false;}}
  button.addEventListener('click',()=>show('account'));
  document.getElementById('coop-button').addEventListener('click',()=>{if(!getAccount()?.user){show('account');message.textContent='Connecte-toi pour rejoindre une compagnie.';}else show('lobby');});
  layer.addEventListener('click',event=>{const a=event.target.closest('[data-action]')?.dataset.action;if(!a)return;
    if(a==='close'){close();return;}
    if(a==='login'||a==='signup'){create=a==='signup';render();return;}
    const handlers={google:onGoogle,logout:onLogout,create:onCreate,start:onStart,leave:onLeave,retry:onRetry,
      ready:()=>onReady(!room?.members.find(m=>m.id===getAccount()?.user?.uid)?.ready),
      reset:()=>onReset(content.querySelector('[name=email]')?.value||''),
      copy:async()=>{const url=new URL(location.href);url.searchParams.set('room',room.code);await navigator.clipboard.writeText(url.href);message.textContent='Invitation copiée.';}};
    if(handlers[a])action(handlers[a],a==='google');
  });
  layer.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.target);if(event.target.id==='account-form')action(()=>onPassword(data.get('email').trim(),data.get('password'),create));else if(event.target.id==='join-form')action(()=>onJoin(data.get('code').trim()));});
  layer.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.stopPropagation();close();}
    if(event.key==='Tab'){const nodes=[...layer.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href]')].filter(n=>n.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
  });
  let teamKey='';
  return{openAccount:()=>show('account'),openLobby:()=>show('lobby'),close,isBlocking:()=>Boolean(panel),
    connected(){if(panel==='account')close();},
    setAccountReady(value=true){available=value;button.classList.toggle('connected',Boolean(getAccount()?.user));button.querySelector('span').textContent=getAccount()?.user?'Mon compte':'Connexion';if(panel==='account')render();},
    setStatus(value){status=value;if(panel)message.textContent=value;},
    setRoom(next){room=next;if(next&&!getAccount()?.user)return;if(next?.phase==='lobby'){if(panel!=='lobby')show('lobby');else render();}else if(next?.phase==='playing'&&panel==='lobby')close();else if(panel==='lobby')render();},
    update(state,{lag=0}={}){
      document.body.dataset.online=String(Boolean(state.online));
      button.hidden=state.phase!=='menu';
      const party=state.party?.filter(m=>m.id!==state.player.playerId)||[],key=JSON.stringify(party.map(m=>[m.id,m.heroId,Math.ceil(m.player.hp),m.player.maxHp]));team.hidden=!party.length||!['playing','upgrade','paused','waiting','reconnecting'].includes(state.phase);
      if(key!==teamKey){teamKey=key;team.innerHTML=party.map(m=>{const h=getHero(m.heroId);return`<div class="ally-pill ${m.player.hp<=0?'downed':''}" style="--ally:${h.color}"><span class="ally-mark">${esc(h.name.slice(0,1))}</span><div><strong>${esc(m.name)}</strong><span class="ally-life" role="progressbar" aria-label="Vie de ${esc(m.name)}" aria-valuemin="0" aria-valuemax="${Math.ceil(m.player.maxHp)}" aria-valuenow="${Math.ceil(m.player.hp)}"><i style="width:${100*Math.max(0,m.player.hp/m.player.maxHp)}%"></i></span></div>${m.player.hp<=0?'<b>✚</b>':''}</div>`;}).join('');}
      // Being downed is shown in the world by the revive ring; the banner is kept for the network.
      const text=state.phase==='waiting'?'Tes alliés choisissent leur pouvoir…':state.phase==='reconnecting'?'Reconnexion au groupe… Ta place est gardée 30 s.':'';banner.hidden=!text;banner.textContent=text;
      weak.hidden=!(state.online&&state.phase==='playing'&&lag>900);
    }
  };
}
