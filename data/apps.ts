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
      'App de vote et classement d\'animaux.',
    appStoreUrl: 'https://apps.apple.com/us/app/pawder/id6748622816', // Remplacez par le vrai lien App Store
    iconUrl: '/icons/pawder.jpg', // Chemin depuis public/
    screenshots: ['/screenshots/pawder1.jpeg','/screenshots/pawder2.png','/screenshots/pawder3.png','/screenshots/pawder4.png'], // Première capture d'écran
    category: 'Social',
    featured: true,
  },
  {
    id: '2',
    name: 'Reflexe Master',
    description:
      'Jeu mobile basé sur les réflexes et le scoring.',
    appStoreUrl: 'https://apps.apple.com/us/app/reflex-master/id6479819861', // Remplacez par le vrai lien App Store
    iconUrl: '/icons/reflexemaster.png',
    screenshots: ['/screenshots/reflexemaster1.png','/screenshots/reflexemaster2.png','/screenshots/reflexemaster3.png','/screenshots/reflexemaster4.png','/screenshots/reflexemaster5.png'],
    category: 'Jeux',
    featured: true,
  },
  {
    id: '3',
    name: 'Do it fast!',
    description:
      'Jeu pour faire deviner des mot à son équipe en soirée',
    appStoreUrl: 'https://apps.apple.com/us/app/do-it-fast/id1660993592', // Remplacez par le vrai lien App Store
    iconUrl: '/icons/doitfast.png',
    screenshots: ['/screenshots/doitfast1.png','/screenshots/doitfast2.png','/screenshots/doitfast3.png'],
    category: 'Jeux',
    featured: false,
  },
  {
    id: '4',
    name: 'Whose face',
    description:
      'App pour trouver le nom d\'une célbrité a partir d\'une photo',
    appStoreUrl: 'https://apps.apple.com/us/app/whose-face/id6447752573', // Remplacez par le vrai lien App Store
    iconUrl: '/icons/whoseface.png',
    screenshots: ['/screenshots/whoseface1.png','/screenshots/whoseface2.png'],
    category: 'Utilitaire',
    featured: false,
  },
  {
    id: '5',
    name: 'Yams Love',
    description:
      'Jeu de yams mobile.',
    appStoreUrl: 'https://apps.apple.com/fr/app/yams-love/id6742028688', // Remplacez par le vrai lien App Store
    iconUrl: '/icons/yamslove.png',
    screenshots: ['/screenshots/yamslove1.png','/screenshots/yamslove2.png','/screenshots/yamslove3.png'],
    category: 'Jeux',
    featured: false,
  },
  {
    id: '6',
    name: 'Archidex',
    description:
      'App d\'exploration et de capture des architectures à travers le monde.',
    appStoreUrl: 'https://apps.apple.com/us/app/archidex/id6736364342', // Remplacez par le vrai lien App Store
    iconUrl: '/icons/archidex.png',
    screenshots: ['/screenshots/archidex1.png','/screenshots/archidex2.png','/screenshots/archidex3.png','/screenshots/archidex4.png'],
    category: 'Jeux',
    featured: true,
  },
]

