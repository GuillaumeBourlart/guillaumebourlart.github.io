import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Roadmap from '@/components/Roadmap'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { studioApps } from '@/data/apps'

export const metadata: Metadata = {
  title: 'À propos du studio et de Guillaume Bourlart',
  description: 'Découvrez Guillaume Bourlart, créateur de Mobiverse Games, son parcours et son expérience dans le développement d’applications iOS et de jeux mobiles.',
  alternates: { canonical: '/a-propos/' },
}

export default function About() {
  return (
    <>
      <Navigation />
      <main id="main-content">
        <section className="about-hero site-container" aria-labelledby="about-title">
          <p className="eyebrow">À propos / Derrière Mobiverse Games</p>
          <h1 id="about-title">Une entreprise.<br />Un créateur <span>engagé.</span></h1>
          <div className="about-intro-grid">
            <div className="founder-card"><p className="eyebrow">Le créateur du studio</p><h2>Guillaume<br />Bourlart<span>.</span></h2><p>Développeur iOS indépendant<br />Créateur de Mobiverse Games</p><div className="founder-apps">{studioApps.map(app => <Link href={`/#app-${app.id}`} key={app.id} aria-label={`Découvrir ${app.name}`}><Image src={app.iconUrl!} width={52} height={52} alt={app.name} /></Link>)}</div></div>
            <div className="founder-bio"><p className="large-copy">Créer des applications, c’est donner une forme concrète aux idées que l’on a envie d’explorer.</p><p>Je suis Guillaume Bourlart, développeur iOS indépendant. Avec Mobiverse Games, je présente mes propres applications et jeux, ainsi que mon activité de développement pour des clients. Les réalisations clients sont identifiées séparément sur le site.</p><p>Du jeu de réflexes à la découverte de l’architecture, chaque projet est l’occasion de travailler un nouvel usage. Je développe principalement pour iOS et réalise également des sites web selon les besoins.</p><p>Vous avez un projet ? Vous échangez directement avec la personne qui le développe, de la première discussion à sa réalisation.</p><a href="mailto:contact.gb.entreprise@gmail.com" className="text-link">Échangeons sur votre projet <ArrowUpRight size={18} aria-hidden="true" /></a></div>
          </div>
        </section>
        <Roadmap />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
