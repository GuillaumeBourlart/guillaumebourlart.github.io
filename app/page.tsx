'use client'

import { useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import AppsSection from '@/components/AppsSection'
import About from '@/components/About'
import Contact from '@/components/Contact'
import Navigation from '@/components/Navigation'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />
      <Hero />
      <About />
      <AppsSection />
      <Contact />
    </main>
  )
}

