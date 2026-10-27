import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import ScreenshotFrame from '@/components/ScreenshotFrame'
import StoreLinks from '@/components/StoreLinks'
import { AppPlaceholder } from '@/components/AppCard'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { studioApps, findStudioApp } from '@/data/apps'

export function generateStaticParams() {
  return studioApps.map(app => ({ slug: app.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const app = findStudioApp(params.slug)
  if (!app) return {}
  return {
    title: `${app.name} — ${app.tagline}`,
    description: app.description,
    alternates: { canonical: `/apps/${app.slug}/` },
    openGraph: { title: `${app.name} — Mobiverse Games`, description: app.description, images: app.iconUrl ? [app.iconUrl] : undefined },
  }
}

export default function AppPage({ params }: { params: { slug: string } }) {
  const app = findStudioApp(params.slug)
  if (!app) notFound()
  const others = studioApps.filter(other => other.slug !== app.slug)
  const facts = [
    { label: 'Plateformes', value: app.platforms },
    { label: 'Prix', value: app.pricing },
    { label: 'Langue', value: app.languages },
    { label: 'Âge', value: app.ageRating },
    { label: 'Éditeur', value: 'Mobiverse Games — Guillaume Bourlart, entrepreneur individuel' },
  ]
  return (
    <>
      <Navigation />
      <main id="main-content" className="app-page" style={{ '--app-accent': app.accent } as React.CSSProperties}>
        <section className="app-hero site-container" aria-labelledby="app-page-title">
          <Link href="/#apps" className="app-back"><ArrowLeft size={16} aria-hidden="true" /> Toutes les applications</Link>
          <div className="app-hero-grid">
            <div className="app-hero-copy">
              <p className="eyebrow">{app.category}</p>
              <div className="app-hero-title">
                {app.iconUrl && <Image src={app.iconUrl} width={88} height={88} alt="" className="app-hero-icon" priority />}
                <h1 id="app-page-title">{app.name}</h1>
              </div>
              <p className="app-hero-tagline">{app.tagline}</p>
              <p className="app-hero-description">{app.description}</p>
              <StoreLinks app={app} />
            </div>
            <div className="app-hero-visual">{app.screenshots.length > 0 ? <div className={app.landscapeScreenshots ? 'app-hero-landscape' : 'app-hero-phone'}><ScreenshotFrame landscape={app.landscapeScreenshots} src={app.screenshots[0]} sizes={app.landscapeScreenshots ? '(max-width: 820px) 90vw, 560px' : '(max-width: 820px) 60vw, 260px'} priority alt={`${app.name} — écran principal`} /></div> : <AppPlaceholder app={app} />}</div>
          </div>
        </section>

        {app.screenshots.length > 1 && <section className="app-screens site-container" aria-labelledby="app-screens-title">
          <h2 id="app-screens-title" className="eyebrow">En images</h2>
          <ul className={app.landscapeScreenshots ? 'app-screens-row app-screens-row-landscape' : 'app-screens-row'}>{app.screenshots.map((src, index) => <li key={src}><ScreenshotFrame landscape={app.landscapeScreenshots} src={src} sizes={app.landscapeScreenshots ? '(max-width: 560px) 85vw, 420px' : '(max-width: 560px) 46vw, 200px'} alt={`${app.name} — capture ${index + 1} sur ${app.screenshots.length}`} /></li>)}</ul>
        </section>}

        <section className="app-info site-container" aria-labelledby="app-features-title">
          <div>
            <h2 id="app-features-title">Ce que propose {app.name}</h2>
            <ul className="app-features">{app.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
            {app.story && <div className="app-story">{app.story.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>}
          </div>
          <aside className="app-facts" aria-label={`Informations sur ${app.name}`}>
            <dl>{facts.filter(fact => fact.value).map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
            <h3>Liens utiles</h3>
            <ul className="app-useful-links">
              {app.links.map(link => <li key={link.href}><a href={link.href} target={link.href.startsWith('/') ? undefined : '_blank'} rel={link.href.startsWith('/') ? undefined : 'noopener noreferrer'}>{link.label}<ArrowUpRight size={14} aria-hidden="true" /></a></li>)}
              <li><a href={`mailto:contact@mobiversegames.com?subject=${encodeURIComponent(app.name)}`}>Nous écrire : contact@mobiversegames.com<ArrowUpRight size={14} aria-hidden="true" /></a></li>
            </ul>
          </aside>
        </section>

        <section className="app-others site-container" aria-labelledby="app-others-title">
          <h2 id="app-others-title" className="eyebrow">Les autres applications du studio</h2>
          <ul>{others.map(other => <li key={other.slug}><Link href={`/apps/${other.slug}/`}>{other.iconUrl && <Image src={other.iconUrl} width={56} height={56} alt="" />}<span>{other.name}</span></Link></li>)}</ul>
        </section>
        <Contact />
      </main>
      <Footer />
    </>
  )
}
