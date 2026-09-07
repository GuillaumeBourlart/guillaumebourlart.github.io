import Link from 'next/link'
import { ArrowUpRight, Gamepad2, Smartphone, Monitor } from 'lucide-react'

const services = [
  { icon: Smartphone, title: 'Applications iOS', description: 'Des applications natives pour iPhone, pensées pour leur usage et développées avec Swift et SwiftUI.' },
  { icon: Gamepad2, title: 'Jeux mobiles', description: 'Réflexes, jeux de société, expériences à partager : des idées qui prennent vie, un écran à la fois.' },
  { icon: Monitor, title: 'Projets sur mesure', description: 'Une application ou un site web à créer ? Le studio accompagne aussi vos projets, de l’idée au développement.' },
]

export default function Studio() {
  return (
    <section id="studio" className="studio-section" aria-labelledby="studio-title">
      <div className="site-container studio-grid">
        <div className="studio-intro">
          <p className="eyebrow">03 / Le studio</p>
          <h2 id="studio-title">L’esprit joueur.<br />Le goût de <span>créer.</span></h2>
          <p>Mobiverse Games est un studio indépendant qui crée ses propres applications et jeux mobiles, et développe des applications pour ses clients.</p>
          <p>Cette expérience de création nourrit aussi les projets confiés au studio : une idée à préciser, une application à développer, un univers à faire découvrir.</p>
          <Link href="/a-propos/" className="text-link">Rencontrez le créateur du studio <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="studio-services">{services.map((service, index) => <div className="service-row" key={service.title}>
          <span className="service-number">0{index + 1}</span>
          <div><service.icon size={26} strokeWidth={1.5} aria-hidden="true" /><h3>{service.title}</h3><p>{service.description}</p></div>
        </div>)}</div>
      </div>
      <div className="site-container studio-note"><span>Indépendant dans l’esprit.</span><span>Concret dans les réalisations.</span></div>
    </section>
  )
}
