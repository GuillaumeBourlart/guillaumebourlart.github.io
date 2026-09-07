import Image from 'next/image'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { studioApps } from '@/data/apps'
import IPhoneMockup from './IPhoneMockup'

export default function Hero() {
  return (
    <section className="hero site-container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" /> Studio indépendant · Applications & jeux iOS</p>
        <h1 id="hero-title">De petits écrans.<br />De <span className="hero-highlight">grandes</span><br /> idées.</h1>
        <p className="hero-description">Jouer, découvrir, se retrouver. Mobiverse Games crée des applications qui donnent envie de toucher à tout.</p>
        <a href="#apps" className="button button-dark hero-cta">Explorez nos applications <ArrowDown size={19} aria-hidden="true" /></a>
        <div className="hero-proof">
          <div className="app-icon-stack" aria-hidden="true">{studioApps.slice(0, 3).map(app => <Image key={app.id} src={app.iconUrl!} width={40} height={40} alt="" />)}</div>
          <p><strong>{studioApps.length} applications du studio.</strong> Et des projets pour nos clients.</p>
        </div>
      </div>
      <div className="hero-showcase">
        <div className="showcase-topline"><span>Créées par Mobiverse Games</span><ArrowUpRight size={22} aria-hidden="true" /></div>
        <div className="hero-screens">
          <a className="hero-screen hero-screen-left" href="#app-2" aria-label="Découvrir Reflexe Master"><IPhoneMockup src="/screenshots/reflexemaster1.png" sizes="(max-width: 600px) 34vw, 210px" priority alt="Reflexe Master : jeux de mémoire et de réflexes" /></a>
          <a className="hero-screen hero-screen-right" href="#app-3" aria-label="Découvrir Do it fast!"><IPhoneMockup src="/screenshots/doitfast1.png" sizes="(max-width: 600px) 34vw, 210px" priority alt="Do it fast! : un jeu de mots à partager en équipe" /></a>
          <a className="hero-screen hero-screen-center" href="#app-1" aria-label="Découvrir Pawder"><IPhoneMockup src="/screenshots/pawder1.jpeg" sizes="(max-width: 600px) 42vw, 250px" priority alt="Pawder : les animaux à l’honneur" /></a>
        </div>
        <div className="showcase-bottomline"><span>Des univers différents.<br /><strong>La même envie de créer.</strong></span><span className="showcase-platform">À découvrir<br />sur l’App Store</span></div>
      </div>
    </section>
  )
}
