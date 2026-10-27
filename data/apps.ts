export interface AppLink {
  label: string
  href: string
}

export interface App {
  slug: string
  name: string
  /** One line under the name, on the card and the app page. */
  tagline: string
  description: string
  category: string
  projectType: 'studio' | 'client'
  /** Background of the app's visuals. */
  accent: string
  iconUrl?: string
  screenshots: string[]
  /** Screenshots of a game played sideways, shown in a landscape frame instead of the iPhone. */
  landscapeScreenshots?: boolean
  appStoreUrl?: string
  googlePlayUrl?: string
  /** Shows « Bientôt sur … » while the store version is in review or in preparation. */
  appStoreSoon?: boolean
  googlePlaySoon?: boolean
  platforms?: string
  pricing?: string
  languages?: string
  ageRating?: string
  features: string[]
  story?: string[]
  links: AppLink[]
}

const shots = (slug: string, count: number) => Array.from({ length: count }, (_, index) => `/screenshots/${slug}/${String(index + 1).padStart(2, '0')}.jpg`)
const appStore = (id: string) => `https://apps.apple.com/fr/app/id${id}`
const googlePlay = (packageName: string) => `https://play.google.com/store/apps/details?id=${packageName}`
const googleDoc = (id: string) => `https://docs.google.com/document/d/${id}/preview`

// Applications développées par Mobiverse Games
export const apps: App[] = [
  {
    slug: 'whose-face',
    projectType: 'studio',
    name: 'Whose Face',
    tagline: 'Qui est cette célébrité ?',
    description: 'Un visage connu, un nom qui vous échappe ? Prenez une photo ou choisissez une image : Whose Face retrouve la célébrité et indique son niveau de confiance.',
    category: 'Utilitaire',
    accent: '#e9e6e0',
    iconUrl: '/icons/whose-face.png',
    screenshots: shots('whose-face', 4),
    appStoreUrl: appStore('6447752573'),
    googlePlayUrl: googlePlay('com.mobiversegames.whoseface'),
    platforms: 'iPhone et Android',
    pricing: 'Gratuit, avec une bannière publicitaire',
    languages: 'Français et anglais',
    ageRating: '16+',
    features: [
      'Une photo ou une image de la galerie, et le nom de la célébrité s’affiche avec un niveau de confiance',
      'Photos de groupe : chaque visage est encadré et numéroté',
      'Un score faible est signalé comme « identification incertaine »',
      'Des conseils quand la photo est floue ou trop sombre',
      'Aucun compte et aucun historique : l’analyse se fait en Europe',
    ],
    links: [
      { label: 'Assistance', href: 'https://whose-face.web.app/support/' },
      { label: 'Politique de confidentialité', href: 'https://whose-face.web.app/privacy/' },
      { label: 'Mentions légales', href: 'https://whose-face.web.app/legal/' },
    ],
  },
  {
    slug: 'reflex-master',
    projectType: 'studio',
    name: 'Reflex Master',
    tagline: 'Six modes pour tester tes réflexes',
    description: 'Vise, mémorise, esquive les bombes : six modes de jeu pour mettre tes réflexes à l’épreuve et battre ton meilleur score.',
    category: 'Jeux',
    accent: '#e4e0f0',
    iconUrl: '/icons/reflex-master.png',
    screenshots: shots('reflex-master', 3),
    appStoreUrl: appStore('6479819861'),
    googlePlayUrl: googlePlay('com.guillaume.reflexemaster'),
    platforms: 'iPhone et Android',
    pricing: 'Gratuit, avec publicité ; achats facultatifs (balles, suppression de la publicité)',
    languages: 'Français',
    features: [
      'Six modes : Échauffement, Concentration, Furie, Skyfall, Memory et Réaction',
      'De l’XP, des niveaux et des balles à débloquer',
      'Un classement pour chaque mode',
      'Jouable sans inscription',
    ],
    links: [
      { label: 'Assistance', href: 'https://reflexe-master-ae24e.web.app/assistance' },
      { label: 'Politique de confidentialité', href: 'https://reflexe-master-ae24e.web.app/confidentialite' },
      { label: 'Conditions d’utilisation', href: 'https://reflexe-master-ae24e.web.app/conditions' },
      { label: 'Supprimer son compte', href: 'https://reflexe-master-ae24e.web.app/suppression-compte' },
    ],
  },
  {
    slug: 'kulture-master',
    projectType: 'studio',
    name: 'Kulture Master',
    tagline: 'Le quiz de culture générale en duel',
    description: 'Affrontez la communauté en duel : six questions pour déterminer le vainqueur, et un classement pour grimper de Plastic à Légende.',
    category: 'Jeux · Quiz',
    accent: '#f3ead6',
    iconUrl: '/icons/kulture-master.png',
    screenshots: shots('kulture-master', 6),
    appStoreUrl: appStore('6736508352'),
    googlePlayUrl: googlePlay('com.guillaume.kulturemaster'),
    platforms: 'iPhone et Android',
    pricing: 'Gratuit, avec publicité',
    languages: 'Français',
    ageRating: '16+',
    features: [
      'Des duels en temps réel contre un joueur de votre niveau, en six questions',
      'Un mode classé avec ELO et rangs, de Plastic à Légende',
      'Des défis entre amis grâce au code ami',
      'Un entraînement solo avec XP et anecdotes',
      'Plus de 10 000 questions de culture générale',
    ],
    links: [
      { label: 'Assistance', href: 'https://culture-master-d3f7f.web.app/support.html' },
      { label: 'Politique de confidentialité', href: 'https://culture-master-d3f7f.web.app/confidentialite.html' },
      { label: 'Conditions d’utilisation', href: 'https://culture-master-d3f7f.web.app/conditions.html' },
      { label: 'Supprimer son compte', href: 'https://culture-master-d3f7f.web.app/suppression-compte.html' },
      { label: 'Sources et licences des questions', href: 'https://culture-master-d3f7f.web.app/sources-et-licences.html' },
    ],
  },
  {
    slug: 'ca-compte',
    projectType: 'studio',
    name: 'Ça compte',
    tagline: 'Un petit mouvement par jour',
    description: 'Trois petits défis pour bouger et prendre soin de toi chaque jour : 1 000 pas, un réflexe de 90 secondes et une information santé.',
    category: 'Forme et santé',
    accent: '#dff2ee',
    iconUrl: '/icons/ca-compte.png',
    screenshots: shots('ca-compte', 5),
    appStoreUrl: appStore('6804838830'),
    googlePlayUrl: googlePlay('fr.cacompte.app'),
    platforms: 'iPhone et Android, en France, Belgique, Suisse et au Luxembourg',
    pricing: 'Gratuit, sans publicité ni achat',
    languages: 'Français',
    ageRating: '9+',
    features: [
      'Le Flash : 1 000 pas comptés automatiquement',
      'Le Réflexe : 90 secondes de mouvement guidé, à glisser dans ta routine',
      'Le Déclic du jour : une information utile pour ta santé',
      'Une progression visible : missions du jour, séries et historique',
      'Mode invité, ou connexion avec Google ou Apple',
    ],
    links: [
      { label: 'Assistance', href: 'https://ca-compte-prod.web.app/support' },
      { label: 'Politique de confidentialité', href: 'https://ca-compte-prod.web.app/privacy' },
      { label: 'Conditions d’utilisation', href: 'https://ca-compte-prod.web.app/terms' },
      { label: 'Supprimer son compte', href: 'https://ca-compte-prod.web.app/delete-account' },
    ],
  },
  {
    slug: 'pawder',
    projectType: 'studio',
    name: 'Pawder',
    tagline: 'Le concours de mignonnerie animale',
    description: 'Vote, classe et fais briller tes animaux : chaque jour un classement, des duels et un Top 100 de la semaine.',
    category: 'Social',
    accent: '#e6ebd6',
    iconUrl: '/icons/pawder.png',
    screenshots: shots('pawder', 5),
    appStoreUrl: appStore('6748622816'),
    googlePlayUrl: googlePlay('com.pawder.app'),
    platforms: 'iPhone et Android',
    pricing: 'Gratuit, sans publicité ni achat',
    languages: 'Français et anglais',
    ageRating: '16+',
    features: [
      'Classe 5 animaux par jour et distribue des points d’aura',
      'Inscris jusqu’à 5 animaux',
      'Lance un duel quotidien qui dure 24 heures',
      'Grimpe dans le Top 100 de la semaine',
      'Trouve des compagnons de balade près de chez toi',
    ],
    links: [
      { label: 'Assistance', href: 'https://pawder-a3ea7.web.app/support/' },
      { label: 'Politique de confidentialité', href: 'https://pawder-a3ea7.web.app/politique-de-confidentialite/' },
      { label: 'Conditions d’utilisation', href: 'https://pawder-a3ea7.web.app/CGU/' },
      { label: 'Supprimer son compte', href: 'https://pawder-a3ea7.web.app/suppression-compte/' },
      { label: 'Mentions légales', href: 'https://pawder-a3ea7.web.app/mentions-legales/' },
    ],
  },
  {
    slug: 'block-slam',
    projectType: 'studio',
    name: 'Block Slam',
    tagline: 'Le puzzle de blocs 8×8',
    description: 'Place tes pièces, complète des lignes et des colonnes : un mode Classique sans chrono et 100 niveaux Expédition.',
    category: 'Jeux · Puzzle',
    accent: '#e3e1f3',
    iconUrl: '/icons/block-slam.png',
    screenshots: shots('block-slam', 4),
    appStoreUrl: appStore('6758675483'),
    googlePlaySoon: true,
    platforms: 'iPhone ; Android bientôt',
    pricing: 'Gratuit, avec publicité',
    languages: 'Français et anglais',
    ageRating: '4+',
    features: [
      'Mode Classique : sans limite de temps, pour battre ton meilleur score',
      'Mode Expédition : 100 niveaux avec des objectifs de score et de gemmes',
      'Jouable hors connexion, sans compte',
      'Son et vibrations réglables',
    ],
    links: [
      { label: 'Politique de confidentialité', href: googleDoc('1WcvB2pH7_Ws1JfcrTlAJrwo56QVmDNDCd5rxUFEecpI') },
      { label: 'Conditions d’utilisation', href: googleDoc('11GuR7FjX-REmQMOVMWPnbAlZclSCw_DMi2ncpaofIrE') },
      { label: 'Mentions légales', href: googleDoc('1Z6Ok7bz8-BsOvK9aEAJB4zd4JoeUrtPkYvZlqsmmIHQ') },
    ],
  },
  {
    slug: 'do-it-fast',
    projectType: 'studio',
    name: 'Do it fast!',
    tagline: 'Le jeu d’ambiance à partager entre amis',
    description: 'Formez deux équipes autour d’un seul téléphone et faites deviner un maximum de mots avant la fin du chrono.',
    category: 'Jeux · Soirée',
    accent: '#e1eaf0',
    iconUrl: '/icons/do-it-fast.png',
    screenshots: shots('do-it-fast', 5),
    appStoreUrl: appStore('1660993592'),
    googlePlaySoon: true,
    platforms: 'iPhone ; Android bientôt',
    pricing: 'Gratuit, avec publicité ; catégories à débloquer à 0,99 €',
    languages: 'Français',
    ageRating: '4+',
    features: [
      'Deux équipes réunies autour du même téléphone',
      'Un chrono de 10, 20 ou 30 secondes par équipe',
      'Des catégories gratuites et d’autres à débloquer',
      'Pause à tout moment, musique et bruitages réglables',
    ],
    links: [
      { label: 'Politique de confidentialité', href: googleDoc('1azR3kvdbAuTBg5y2xaALlxL9dD2K8LzEHaWDWTfGac0') },
      { label: 'Conditions d’utilisation', href: googleDoc('1GZvx_w4grOtKPPDZwO6m6Pr_jkfsccZTSx1uMsTKNV4') },
    ],
  },
  {
    slug: 'tripli',
    projectType: 'studio',
    name: 'Tripli',
    tagline: 'Le jeu de cartes qui rapproche',
    description: 'Un jeu de cartes, de mémoire et de stratégie, en solo contre des bots ou entre amis, de 3 à 6 joueurs.',
    category: 'Jeux · Cartes',
    accent: '#e6e3f0',
    iconUrl: '/icons/tripli.png',
    screenshots: shots('tripli', 4),
    googlePlayUrl: googlePlay('com.guillaumebourlart.tripli'),
    appStoreSoon: true,
    platforms: 'Android ; iPhone bientôt',
    pricing: 'Gratuit, avec publicité ; éclats en achat facultatif, pour des objets cosmétiques',
    languages: 'Français',
    ageRating: 'PEGI 3',
    features: [
      'En solo contre des bots, avec un tutoriel',
      'Des parties publiques en mode Détente ou Classé',
      'Des salons privés pour jouer entre amis',
      'Amis, historique, classement et défi du jour',
      'Pour gagner : trois sets… ou les trois 7',
    ],
    links: [
      { label: 'Assistance', href: 'https://tripli-mobiverse.web.app/contact' },
      { label: 'Politique de confidentialité', href: 'https://tripli-mobiverse.web.app/confidentialite' },
      { label: 'Conditions d’utilisation', href: 'https://tripli-mobiverse.web.app/conditions' },
      { label: 'Achats et remboursements', href: 'https://tripli-mobiverse.web.app/achats' },
      { label: 'Supprimer son compte', href: 'https://tripli-mobiverse.web.app/suppression-compte' },
      { label: 'Mentions légales', href: 'https://tripli-mobiverse.web.app/mentions-legales' },
    ],
  },
  {
    slug: 'tv-mark',
    projectType: 'studio',
    name: 'TV Mark',
    tagline: 'Le suivi de vos séries et de vos films',
    description: 'Suivez vos séries et vos films : rappels d’épisodes, statistiques et une communauté sans spoilers.',
    category: 'Divertissement',
    accent: '#e8e1ec',
    iconUrl: '/icons/tv-mark.png',
    screenshots: shots('tv-mark', 3),
    googlePlayUrl: googlePlay('com.tvmark.app'),
    appStoreSoon: true,
    platforms: 'Android ; iPhone bientôt',
    pricing: 'Gratuit, avec publicité ; abonnement premium facultatif',
    ageRating: 'PEGI 3',
    features: [
      'Des rappels pour ne manquer aucun épisode',
      'Des statistiques sur ce que vous regardez',
      'Une communauté sans spoilers',
    ],
    links: [
      { label: 'Assistance', href: 'https://tv-mark.web.app/fr/support.html' },
      { label: 'Politique de confidentialité', href: 'https://tv-mark.web.app/legal/privacy.html' },
    ],
  },
  {
    slug: 'arena-legends',
    projectType: 'studio',
    name: 'Arena Legends',
    tagline: 'Des duels médiévaux physiques',
    description: 'Des duels médiévaux physiques, une campagne hors ligne et des combats en ligne.',
    category: 'Jeux · Combat',
    accent: '#ece3d6',
    iconUrl: '/icons/arena-legends.png',
    screenshots: shots('arena-legends', 3),
    landscapeScreenshots: true,
    googlePlayUrl: googlePlay('com.arenalegends.arena_legends'),
    appStoreSoon: true,
    platforms: 'Android ; iPhone bientôt',
    pricing: 'Gratuit, avec publicité ; pièces d’or en achat facultatif',
    ageRating: 'PEGI 18',
    features: [
      'Des combats médiévaux au corps à corps, portés par la physique',
      'Une campagne jouable hors ligne',
      'Des duels en ligne contre d’autres joueurs',
    ],
    links: [
      { label: 'Assistance', href: '/arena-legends/support.html' },
      { label: 'Politique de confidentialité', href: '/arena-legends/privacy.html' },
      { label: 'Conditions d’utilisation', href: '/arena-legends/terms.html' },
      { label: 'Supprimer son compte', href: '/arena-legends/delete-account.html' },
      { label: 'Mentions légales', href: '/arena-legends/legal.html' },
    ],
  },
  {
    slug: 'archidex',
    projectType: 'client',
    name: 'Archidex',
    tagline: 'L’architecture autour de vous',
    description: 'Explorez l’architecture autour de vous et capturez vos découvertes. Une autre façon de regarder le monde.',
    category: 'Exploration',
    accent: '#f1e1ca',
    iconUrl: '/icons/archidex.png',
    screenshots: ['/screenshots/archidex1.png', '/screenshots/archidex2.png', '/screenshots/archidex3.png', '/screenshots/archidex4.png'],
    appStoreUrl: 'https://apps.apple.com/us/app/archidex/id6736364342',
    features: [],
    links: [],
  },
  {
    slug: 'yams-love',
    projectType: 'client',
    name: 'Yams Love',
    tagline: 'Le yams sur mobile',
    description: 'Le plaisir du yams sur mobile. Lancez les dés, composez vos combinaisons et tentez votre chance.',
    category: 'Jeux',
    accent: '#f2dedf',
    iconUrl: '/icons/yamslove.png',
    screenshots: ['/screenshots/yamslove1.png', '/screenshots/yamslove2.png', '/screenshots/yamslove3.png'],
    appStoreUrl: 'https://apps.apple.com/fr/app/yams-love/id6742028688',
    features: [],
    links: [],
  },
]

export const studioApps = apps.filter(app => app.projectType === 'studio')
export const clientApps = apps.filter(app => app.projectType === 'client')
export const findStudioApp = (slug: string) => studioApps.find(app => app.slug === slug)
