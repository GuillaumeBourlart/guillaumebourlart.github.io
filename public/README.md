# Dossier Public - Images et Assets

Ce dossier contient tous les fichiers statiques qui seront servis directement par Next.js.

## Structure

```
public/
├── icons/              # Icônes des applications (512x512 px recommandé)
│   ├── pawder-icon.png
│   └── reflexe-master-icon.png
└── screenshots/        # Captures d'écran des apps (format iPhone)
    ├── pawder-1.png
    └── reflexe-master-1.png
```

## Comment ajouter vos images

### 1. Icônes d'apps
- Placez vos icônes dans `public/icons/`
- Format recommandé : PNG, 512x512 px minimum
- Nommez-les : `nom-de-lapp-icon.png`

### 2. Captures d'écran
- Placez vos captures dans `public/screenshots/`
- Format recommandé : PNG ou JPG
- Taille recommandée : 1170x2532 px (iPhone 14 Pro) ou similaire
- Nommez-les : `nom-de-lapp-1.png`, `nom-de-lapp-2.png`, etc.

### 3. Mise à jour dans `data/apps.ts`

Une fois les images ajoutées, mettez à jour les chemins dans `data/apps.ts` :

```typescript
{
  id: '1',
  name: 'Pawder',
  iconUrl: '/icons/pawder-icon.png',
  screenshots: ['/screenshots/pawder-1.png'],
  // ...
}
```

**Note** : Les chemins commencent toujours par `/` et pointent vers le dossier `public/`.

## Exemple

Si vous placez `pawder-icon.png` dans `public/icons/`, le chemin sera `/icons/pawder-icon.png`.

