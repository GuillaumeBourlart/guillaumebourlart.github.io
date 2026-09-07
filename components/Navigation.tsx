'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Home, User, Mail } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isPawderPage = pathname?.startsWith('/pawder')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/#apps', label: 'Apps', icon: User },
    { href: '/#contact', label: 'Contact', icon: Mail },
  ]

  return (
    <>
      {/* Navigation fixe */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isPawderPage
              ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-purple-100'
              : 'bg-slate-900/90 backdrop-blur-md shadow-lg'
            : isPawderPage
              ? 'bg-white/80 backdrop-blur-sm'
              : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className={`text-xl font-bold transition-colors ${
                isPawderPage ? 'text-purple-600' : 'text-white'
              }`}
            >
              Mobiverse Games
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors duration-200 flex items-center gap-2 ${
                    isPawderPage
                      ? 'text-purple-600 hover:text-purple-700'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 transition-colors ${
                isPawderPage ? 'text-purple-600' : 'text-white'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden backdrop-blur-md border-t ${
              isPawderPage
                ? 'bg-white/95 border-purple-100'
                : 'bg-slate-900/95 border-slate-700'
            }`}
          >
            <div className="container mx-auto px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block transition-colors duration-200 py-2 flex items-center gap-2 ${
                    isPawderPage
                      ? 'text-purple-600 hover:text-purple-700'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Espace pour compenser la navigation fixe */}
      <div className="h-16" />
    </>
  )
}
