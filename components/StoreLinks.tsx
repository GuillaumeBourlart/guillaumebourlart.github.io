import { ArrowUpRight } from 'lucide-react'
import { App } from '@/data/apps'

/** Store buttons for an app: a link where it is live, a « bientôt » label where it is not yet published. */
export default function StoreLinks({ app, compact = false }: { app: App; compact?: boolean }) {
  const stores = [
    { name: 'App Store', inSentence: 'l’App Store', url: app.appStoreUrl, soon: app.appStoreSoon },
    { name: 'Google Play', inSentence: 'Google Play', url: app.googlePlayUrl, soon: app.googlePlaySoon },
  ].sort((a, b) => Number(Boolean(b.url)) - Number(Boolean(a.url)))
  return (
    <div className={compact ? 'store-links store-links-compact' : 'store-links'}>
      {stores.map(store => store.url
        ? <a key={store.name} className={compact ? 'text-link' : 'button button-dark'} href={store.url} target="_blank" rel="noopener noreferrer" aria-label={`${app.name} sur ${store.inSentence} (nouvel onglet)`}>{compact ? store.name : `Télécharger sur ${store.inSentence}`} <ArrowUpRight size={compact ? 15 : 17} aria-hidden="true" /></a>
        : store.soon && <span key={store.name} className="store-soon">Bientôt sur {store.inSentence}</span>)}
    </div>
  )
}
