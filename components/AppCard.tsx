import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { App } from '@/data/apps'
import AppGallery from './AppGallery'
import StoreLinks from './StoreLinks'

/** Stands in for the gallery until the app has screenshots. */
export function AppPlaceholder({ app }: { app: App }) {
  return <div className="app-placeholder">{app.iconUrl ? <Image src={app.iconUrl} width={160} height={160} alt="" /> : <span aria-hidden="true">{app.name}</span>}</div>
}

export default function AppCard({ app, index }: { app: App; index: number }) {
  const isStudio = app.projectType === 'studio'
  return (
    <article id={`app-${app.slug}`} className="app-card" style={{ '--app-accent': app.accent } as React.CSSProperties} aria-labelledby={`app-title-${app.slug}`}>
      <div className="app-visual">
        <div className="app-visual-label"><span>{String(index + 1).padStart(2, '0')}</span><span>{app.category}</span></div>
        {app.screenshots.length > 0 ? <AppGallery screenshots={app.screenshots} name={app.name} landscape={app.landscapeScreenshots} /> : <AppPlaceholder app={app} />}
      </div>
      <div className="app-details">
        <div className="app-title-row">
          {app.iconUrl && <Image src={app.iconUrl} width={52} height={52} alt="" className="app-icon" />}
          <div><p className={`app-platform ${isStudio ? '' : 'app-client-label'}`}>{isStudio ? 'Application du studio' : 'Application d’un client'}</p><h3 id={`app-title-${app.slug}`}>{app.name}</h3></div>
        </div>
        <p className="app-description">{app.description}</p>
        {!isStudio && <p className="app-credit">Rôle : développement iOS en prestation.</p>}
        <div className="app-card-actions">
          {isStudio && <Link className="text-link" href={`/apps/${app.slug}/`} aria-label={`Découvrir la page de ${app.name}`}>Découvrir l’application <ArrowUpRight size={17} aria-hidden="true" /></Link>}
          <StoreLinks app={app} compact />
        </div>
      </div>
    </article>
  )
}
