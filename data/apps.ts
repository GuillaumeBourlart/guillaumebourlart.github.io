export interface App {
  id: string
  name: string
  description: string
  appStoreUrl: string
  iconUrl?: string
  screenshots?: string[]
  category: string
  projectType: 'studio' | 'client'
  featured?: boolean
}

// Applications développées par Mobiverse Games
export const apps: App[] = [
  {
    id: '1',
    projectType: 'studio',
    name: 'Pawder',
    description:
      'Des animaux à découvrir, des votes et un classement. Faites une place à vos compagnons préférés.',
    appStoreUrl: 'https://apps.apple.com/us/app/pawder/id6748622816',
    iconUrl: '/icons/pawder.jpg',
    screenshots: ['/screenshots/pawder1.jpeg','/screenshots/pawder2.png','/screenshots/pawder3.png','/screenshots/pawder4.png'],
    category: 'Social',
    featured: true,
  },
  {
    id: '2',
    projectType: 'studio',
    name: 'Reflexe Master',
    description:
      'Mettez vos réflexes à l’épreuve et relevez le défi du meilleur score. À vous de jouer.',
    appStoreUrl: 'https://apps.apple.com/us/app/reflex-master/id6479819861',
    iconUrl: '/icons/reflexemaster.png',
    screenshots: ['/screenshots/reflexemaster1.png','/screenshots/reflexemaster2.png','/screenshots/reflexemaster3.png','/screenshots/reflexemaster4.png','/screenshots/reflexemaster5.png'],
    category: 'Jeux',
    featured: true,
  },
  {
    id: '3',
    projectType: 'studio',
    name: 'Do it fast!',
    description:
      'Faites deviner des mots à votre équipe. Un jeu à sortir en soirée pour partager un moment ensemble.',
    appStoreUrl: 'https://apps.apple.com/us/app/do-it-fast/id1660993592',
    iconUrl: '/icons/doitfast.png',
    screenshots: ['/screenshots/doitfast1.png','/screenshots/doitfast2.png','/screenshots/doitfast3.png'],
    category: 'Jeux',
    featured: false,
  },
  {
    id: '4',
    projectType: 'studio',
    name: 'Whose face',
    description:
      'Un visage connu, un nom qui vous échappe ? Retrouvez une célébrité à partir d’une photo.',
    appStoreUrl: 'https://apps.apple.com/us/app/whose-face/id6447752573',
    iconUrl: '/icons/whoseface.png',
    screenshots: ['/screenshots/whoseface1.png','/screenshots/whoseface2.png'],
    category: 'Utilitaire',
    featured: false,
  },
  {
    id: '5',
    projectType: 'client',
    name: 'Yams Love',
    description:
      'Le plaisir du yams sur mobile. Lancez les dés, composez vos combinaisons et tentez votre chance.',
    appStoreUrl: 'https://apps.apple.com/fr/app/yams-love/id6742028688',
    iconUrl: '/icons/yamslove.png',
    screenshots: ['/screenshots/yamslove1.png','/screenshots/yamslove2.png','/screenshots/yamslove3.png'],
    category: 'Jeux',
    featured: false,
  },
  {
    id: '6',
    projectType: 'client',
    name: 'Archidex',
    description:
      'Explorez l’architecture autour de vous et capturez vos découvertes. Une autre façon de regarder le monde.',
    appStoreUrl: 'https://apps.apple.com/us/app/archidex/id6736364342',
    iconUrl: '/icons/archidex.png',
    screenshots: ['/screenshots/archidex1.png','/screenshots/archidex2.png','/screenshots/archidex3.png','/screenshots/archidex4.png'],
    category: 'Exploration',
    featured: true,
  },
]

export const studioApps = apps.filter(app => app.projectType === 'studio')
export const clientApps = apps
  .filter(app => app.projectType === 'client')
  .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
