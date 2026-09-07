import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://mobiversegames.com'),
  title: {
    default: 'Mobiverse Games — Applications iOS & jeux mobiles',
    template: '%s | Mobiverse Games',
  },
  description: 'Mobiverse Games, studio indépendant de création d’applications iOS et de jeux mobiles. Découvrez Pawder, Reflexe Master, Archidex et les autres applications du studio.',
  keywords: ['Mobiverse Games', 'jeux mobiles', 'applications iOS', 'développement iOS', 'Swift', 'SwiftUI', 'studio indépendant'],
  authors: [{ name: 'Mobiverse Games' }],
  creator: 'Mobiverse Games',
  publisher: 'Mobiverse Games',
  openGraph: {
    title: 'Mobiverse Games — Applications iOS & jeux mobiles',
    description: 'Studio indépendant de création d’applications iOS et de jeux mobiles. Explorez les applications et les jeux créés par Mobiverse Games.',
    siteName: 'Mobiverse Games',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobiverse Games — Applications iOS & jeux mobiles',
    description: 'Studio indépendant de création d’applications iOS et de jeux mobiles. Explorez les applications et les jeux créés par Mobiverse Games.',
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
