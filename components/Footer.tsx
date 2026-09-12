import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const links = [
  { label: 'Malt', href: 'https://www.malt.fr/profile/guillaumebourlart' },
  { label: 'Fiverr', href: 'https://fr.fiverr.com/s/wkjllxw' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/guillaume-bourlart-419103210' },
  { label: 'GitHub', href: 'https://github.com/guillaumebourlart' },
]

export default function Footer() {
  return (
    <footer className="site-footer site-container">
      <div className="footer-top">
        <Link href="/" className="footer-brand">mobiverse games<span>.</span></Link>
        <p>Applications & jeux mobiles.<br />Créés avec un esprit indépendant.</p>
        <nav aria-label="Retrouvez le studio" className="footer-socials">{links.map(link => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</nav>
      </div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} Mobiverse Games</p><nav aria-label="Informations"><Link href="/a-propos/">À propos</Link><Link href="/pawder/assistance/">Assistance Pawder</Link><Link href="/mentions-legales/">Mentions légales</Link><a href="mailto:contact@mobiversegames.com">Contact</a></nav><a href="#main-content">Retour en haut ↑</a></div>
    </footer>
  )
}
