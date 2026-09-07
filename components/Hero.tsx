import Image from 'next/image'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { apps } from '@/data/apps'

export default function Hero() {
  return (
    <section className="hero site-container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" /> Studio indépendant · Applications & jeux iOS</p>
        <h1 id="hero-title">De petits écrans.<br />De <span className="hero-highlight">grandes</span><br /> idées.</h1>
        <p className="hero-description">Jouer, découvrir, se retrouver. Mobiverse Games crée des applications qui donnent envie de toucher à tout.</p>
        <a href="#apps" className="button button-dark hero-cta">Explorez nos applications <ArrowDown size={19} aria-hidden="true" /></a>
        <div className="hero-proof">
          <div className="app-icon-stack" aria-hidden="true">{apps.filter(app => app.featured).map(app => <Image key={app.id} src={app.iconUrl!} width={40} height={40} alt="" />)}</div>
          <p><strong>{apps.length} applications.</strong> Autant d’univers à découvrir.</p>
        </div>
      </div>
      <div className="hero-showcase">
        <div className="showcase-topline"><span>Créées par Mobiverse Games</span><ArrowUpRight size={22} aria-hidden="true" /></div>
        <div className="hero-screens">
          <a className="hero-screen hero-screen-left" href="#app-2" aria-label="Découvrir Reflexe Master"><Image src="/screenshots/reflexemaster1.png" width={1284} height={2778} sizes="(max-width: 600px) 34vw, 210px" priority alt="Reflexe Master : jeux de mémoire et de réflexes" /></a>
          <a className="hero-screen hero-screen-right" href="#app-6" aria-label="Découvrir Archidex"><Image src="/screenshots/archidex1.png" width={1284} height={2778} sizes="(max-width: 600px) 34vw, 210px" priority alt="Archidex : explorer et collectionner l’architecture" /></a>
          <a className="hero-screen hero-screen-center" href="#app-1" aria-label="Découvrir Pawder"><Image src="/screenshots/pawder1.jpeg" width={1125} height={2436} sizes="(max-width: 600px) 42vw, 250px" priority alt="Pawder : les animaux à l’honneur" /></a>
        </div>
        <div className="showcase-bottomline"><span>Des univers différents.<br /><strong>La même envie de créer.</strong></span><span className="showcase-platform">À découvrir<br />sur l’App Store</span></div>
      </div>
    </section>
  )
}
