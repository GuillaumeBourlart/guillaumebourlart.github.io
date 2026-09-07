import { studioApps, clientApps } from '@/data/apps'
import AppCard from './AppCard'

export default function AppsSection() {
  return (
    <>
    <section id="apps" className="apps-section site-container" aria-labelledby="apps-title">
      <div className="section-heading">
        <div><p className="eyebrow">01 / Les applications du studio</p><h2 id="apps-title">À chaque app,<br />son terrain de jeu.</h2></div>
        <p>Des jeux pour se challenger, des moments à partager et des outils à découvrir. Voici les applications propres à Mobiverse Games.</p>
      </div>
      <div className="apps-grid">{studioApps.map((app, index) => <AppCard key={app.id} app={app} index={index} />)}</div>
    </section>
    <section id="clients" className="apps-section client-projects site-container" aria-labelledby="clients-title">
      <div className="section-heading">
        <div><p className="eyebrow">02 / Les réalisations clients</p><h2 id="clients-title">Vos projets.<br />Notre savoir-faire.</h2></div>
        <p>Ces applications ont été développées en prestation pour des clients. Elles sont présentées comme des références de développement, et restent les applications de leurs porteurs de projet.</p>
      </div>
      <div className="apps-grid">{clientApps.map((app, index) => <AppCard key={app.id} app={app} index={studioApps.length + index} />)}</div>
    </section>
    </>
  )
}
