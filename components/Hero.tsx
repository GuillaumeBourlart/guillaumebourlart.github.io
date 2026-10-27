import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { studioApps, findStudioApp } from '@/data/apps'
import IPhoneMockup from './IPhoneMockup'

const heroApps = [
  { slug: 'reflex-master', position: 'left', sizes: '(max-width: 600px) 34vw, 210px' },
  { slug: 'kulture-master', position: 'right', sizes: '(max-width: 600px) 34vw, 210px' },
  { slug: 'whose-face', position: 'center', sizes: '(max-width: 600px) 42vw, 250px' },
].flatMap(({ slug, ...rest }) => {
  const app = findStudioApp(slug)
  return app && app.screenshots.length > 0 ? [{ app, ...rest }] : []
})

export default function Hero() {
  return (
    <section className="hero site-container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" /> Studio indépendant · Applications & jeux mobiles</p>
        <h1 id="hero-title">De petits écrans.<br />De <span className="hero-highlight">grandes</span><br /> idées.</h1>
        <p className="hero-description">Jouer, découvrir, se retrouver. Mobiverse Games crée des applications qui donnent envie de toucher à tout.</p>
        <a href="#apps" className="button button-dark hero-cta">Explorez nos applications <ArrowDown size={19} aria-hidden="true" /></a>
        <div className="hero-proof">
          <div className="app-icon-stack" aria-hidden="true">{studioApps.filter(app => app.iconUrl).slice(0, 3).map(app => <Image key={app.slug} src={app.iconUrl!} width={40} height={40} alt="" />)}</div>
          <p><strong>{studioApps.length} applications du studio.</strong> Et des projets pour nos clients.</p>
        </div>
      </div>
      <div className="hero-showcase">
        <div className="showcase-topline"><span>Créées par Mobiverse Games</span><ArrowUpRight size={22} aria-hidden="true" /></div>
        <div className="hero-screens">
          {heroApps.map(({ app, position, sizes }) => <Link key={app.slug} className={`hero-screen hero-screen-${position}`} href={`/apps/${app.slug}/`} aria-label={`Découvrir ${app.name}`}><IPhoneMockup src={app.screenshots[0]} sizes={sizes} priority alt={`${app.name} : ${app.tagline}`} /></Link>)}
        </div>
        <div className="showcase-bottomline"><span>Des univers différents.<br /><strong>La même envie de créer.</strong></span><span className="showcase-platform">À découvrir sur<br />l’App Store et Google Play</span></div>
      </div>
    </section>
  )
}
