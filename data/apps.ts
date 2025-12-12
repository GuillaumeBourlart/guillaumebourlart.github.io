export interface App {
  id: string
  name: string
  description: string
  appStoreUrl: string
  iconUrl?: string
  screenshots?: string[]
  category: string
  featured?: boolean
}

// Vos applications iOS
export const apps: App[] = [
  {
    id: '1',
    name: 'Pawder',
    description:
      'Application iOS de vote et classement d\'animaux.',
    appStoreUrl: 'https://apps.apple.com/app/pawder', // Remplacez par le vrai lien App Store
    category: 'Social',
    featured: true,
  },
  {
    id: '2',
    name: 'Reflexe Master',
    description:
      'Jeu mobile basé sur les réflexes et le scoring.',
    appStoreUrl: 'https://apps.apple.com/app/reflexe-master', // Remplacez par le vrai lien App Store
    category: 'Jeux',
    featured: true,
  },
]

