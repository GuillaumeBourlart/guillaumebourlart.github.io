import { apps } from '@/data/apps'
import AppCard from './AppCard'

export default function AppsSection() {
  const orderedApps = [...apps.filter(app => app.featured), ...apps.filter(app => !app.featured)]
  return (
    <section id="apps" className="apps-section site-container" aria-labelledby="apps-title">
      <div className="section-heading">
        <div><p className="eyebrow">01 / Les applications</p><h2 id="apps-title">À chaque app,<br />son terrain de jeu.</h2></div>
        <p>Des jeux pour se challenger, des découvertes à collectionner, des moments à partager. Entrez dans les univers de Mobiverse Games.</p>
      </div>
      <div className="apps-grid">{orderedApps.map((app, index) => <AppCard key={app.id} app={app} index={index} />)}</div>
    </section>
  )
}
