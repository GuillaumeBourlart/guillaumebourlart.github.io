# Portfolio - Guillaume Bourlart

Portfolio moderne et stylé pour développeur iOS, créé avec Next.js, TypeScript et Tailwind CSS.

## 🚀 Fonctionnalités

- Design moderne et innovant avec animations fluides
- Section dédiée aux applications iOS avec liens App Store
- Interface responsive et optimisée
- Animations avec Framer Motion
- Navigation fluide entre les sections

## 📦 Installation

```bash
npm install
```

## 🏃 Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📝 Configuration des Apps

Pour ajouter vos applications iOS, éditez le fichier `data/apps.ts` :

```typescript
export const apps: App[] = [
  {
    id: '1',
    name: 'Nom de votre app',
    description: 'Description de votre app',
    appStoreUrl: 'https://apps.apple.com/app/votre-app',
    iconUrl: 'https://...', // Optionnel
    category: 'Productivité',
    featured: true, // Mettre en vedette
  },
]
```

## 🎨 Personnalisation

- **Couleurs** : Modifiez `tailwind.config.js` pour changer la palette de couleurs
- **Contenu** : Éditez les composants dans `components/` pour personnaliser le contenu
- **Styles** : Les styles globaux sont dans `app/globals.css`

## 🚢 Déploiement

Le site peut être déployé sur Vercel, Netlify ou tout autre hébergeur supportant Next.js.

```bash
npm run build
npm start
```

## 📄 Licence

MIT

