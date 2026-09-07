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
  description: 'Mobiverse Games, studio indépendant d’applications iOS et de jeux mobiles. Découvrez ses applications et ses réalisations en développement pour des clients.',
  keywords: ['Mobiverse Games', 'jeux mobiles', 'applications iOS', 'développement iOS', 'Swift', 'SwiftUI', 'studio indépendant'],
  authors: [{ name: 'Mobiverse Games' }],
  creator: 'Mobiverse Games',
  publisher: 'Mobiverse Games',
  openGraph: {
    title: 'Mobiverse Games — Applications iOS & jeux mobiles',
    description: 'Découvrez les applications de Mobiverse Games et ses prestations de développement iOS pour des clients.',
    siteName: 'Mobiverse Games',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobiverse Games — Applications iOS & jeux mobiles',
    description: 'Découvrez les applications de Mobiverse Games et ses prestations de développement iOS pour des clients.',
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
