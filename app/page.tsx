import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import AppsSection from '@/components/AppsSection'
import Studio from '@/components/Studio'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export const metadata: Metadata = { alternates: { canonical: '/' } }

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main-content">
        <Hero />
        <AppsSection />
        <Studio />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
