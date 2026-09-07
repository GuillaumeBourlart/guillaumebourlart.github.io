import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { App } from '@/data/apps'
import AppGallery from './AppGallery'

export default function AppCard({ app, index }: { app: App; index: number }) {
  return (
    <article id={`app-${app.id}`} className={`app-card app-theme-${app.id}`} aria-labelledby={`app-title-${app.id}`}>
      <div className="app-visual">
        <div className="app-visual-label"><span>{String(index + 1).padStart(2, '0')}</span><span>{app.category}</span></div>
        {app.screenshots && app.screenshots.length > 0 && <AppGallery screenshots={app.screenshots} name={app.name} />}
      </div>
      <div className="app-details">
        <div className="app-title-row">
          {app.iconUrl && <Image src={app.iconUrl} width={52} height={52} alt="" className="app-icon" />}
          <div><p className={`app-platform ${app.projectType === 'client' ? 'app-client-label' : ''}`}>{app.projectType === 'client' ? 'Application d’un client' : 'Application du studio'}</p><h3 id={`app-title-${app.id}`}>{app.name}</h3></div>
        </div>
        <p className="app-description">{app.description}</p>
        {app.projectType === 'client' && <p className="app-credit">Rôle : développement iOS en prestation.</p>}
        <div className="app-links">
          <a className="text-link" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer" aria-label={`Découvrir ${app.name} sur l’App Store (nouvel onglet)`}>Voir sur l’App Store <ArrowUpRight size={17} aria-hidden="true" /></a>
          {app.id === '1' && <Link className="app-support" href="/pawder/assistance/">Assistance</Link>}
        </div>
      </div>
    </article>
  )
}
