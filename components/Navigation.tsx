'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const links = [
    { href: '/#apps', label: 'Les applications' },
    { href: '/#studio', label: 'Le studio' },
    { href: '/a-propos/', label: 'À propos' },
  ]
  return (
    <header className="site-header">
      <a href="#main-content" className="skip-link">Aller au contenu</a>
      <div className="site-container header-inner">
        <Link href="/" className="wordmark" aria-label="Mobiverse Games — Accueil" onClick={() => setIsOpen(false)}>
          <span className="brand-mark" aria-hidden="true">m<span>.</span></span>
          <span>mobiverse<span className="wordmark-second">games</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname?.replace(/\/$/, '') === link.href.replace(/\/$/, '') ? 'page' : undefined}>{link.label}</Link>)}
        </nav>
        <Link href="/#contact" className="button button-dark header-contact">Parlons de votre projet <ArrowUpRight size={17} aria-hidden="true" /></Link>
        <button className="menu-toggle" aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={isOpen} aria-controls="mobile-menu" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isOpen && <nav id="mobile-menu" className="mobile-nav site-container" aria-label="Navigation mobile" onKeyDown={event => { if (event.key === 'Escape') setIsOpen(false) }}>
        {[...links, { href: '/#contact', label: 'Parlons de votre projet ↗' }].map(link => <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>{link.label}</Link>)}
      </nav>}
    </header>
  )
}
