import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Guillaume Bourlart - Développeur iOS',
  description: 'Portfolio de Guillaume Bourlart, développeur iOS passionné. Découvrez mes applications iOS innovantes et élégantes.',
  keywords: ['iOS', 'développeur iOS', 'Swift', 'SwiftUI', 'applications iOS', 'Guillaume Bourlart'],
  authors: [{ name: 'Guillaume Bourlart' }],
  openGraph: {
    title: 'Guillaume Bourlart - Développeur iOS',
    description: 'Portfolio de Guillaume Bourlart, développeur iOS passionné',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guillaume Bourlart - Développeur iOS',
    description: 'Portfolio de Guillaume Bourlart, développeur iOS passionné',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

