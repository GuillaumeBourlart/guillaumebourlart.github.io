// One authoritative backend is shared by the VPS page and static site copies.
// Local development continues to use its own server. This value is deployment
// configuration, never taken from a query string or browser storage.
export const PRODUCTION_SERVER_BASE='https://vps-f42f8938.vps.ovh.net/azuros/';
const localHost=hostname=>['localhost','127.0.0.1','[::1]'].includes(hostname);
export function resolveServerBase(moduleURL,{override}={}){
  const clientBase=new URL('../',moduleURL);
  if(override){
    const base=new URL(override,clientBase);
    if(base.username||base.password||base.search||base.hash||!(base.protocol==='https:'||base.protocol==='http:'&&localHost(base.hostname)))throw new Error('Le serveur du jeu doit utiliser HTTPS, ou HTTP sur localhost.');
    if(!base.pathname.endsWith('/'))base.pathname+='/';return base;
  }
  return localHost(clientBase.hostname)?clientBase:new URL(PRODUCTION_SERVER_BASE);
}
const base=resolveServerBase(import.meta.url,{override:typeof document==='undefined'?null:document.querySelector('meta[name="fury-server-base"]')?.content.trim()});
export const apiURL=path=>new URL(path,base);
