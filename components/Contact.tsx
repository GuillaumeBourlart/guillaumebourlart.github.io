import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function Contact() {
  return (
    <section id="contact" className="contact-section site-container" aria-labelledby="contact-title">
      <div className="contact-panel">
        <div><p className="eyebrow">Et si on créait la suite ensemble ?</p><h2 id="contact-title">Votre idée.<br />Le prochain écran.</h2></div>
        <div className="contact-copy"><p>Une application, un jeu mobile, un site web ou une collaboration : racontez votre projet à Mobiverse Games.</p>
          <a href="mailto:contact.gb.entreprise@gmail.com" className="button button-dark">Parlons-en par e-mail <ArrowUpRight size={18} aria-hidden="true" /></a>
          <Link href="/estimation/" className="text-link">Obtenir une première estimation <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  )
}
