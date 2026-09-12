# Mobiverse Games

Code source du site de présentation de Mobiverse Games : applications et jeux mobiles, studio, page À propos de Guillaume Bourlart, estimation de projets et pages Pawder. Le site utilise Next.js, TypeScript et Tailwind CSS.

## Où est la version complète ?

- Dépôt : https://github.com/GuillaumeBourlart/guillaumebourlart.github.io
- Branche `main` : projet source complet, images, documents et configuration pour reconstruire et publier le site.

Le code source était auparavant conservé sur le Mac, tandis que les fichiers du dossier `out/` étaient envoyés sur GitHub. Le dépôt conserve désormais les deux historiques Git : celui du projet local et celui du site publié.

## Récupérer le projet sur un autre ordinateur

Installer Git et Node.js 22 (version de validation indiquée dans `.nvmrc`), puis :

```bash
git clone https://github.com/GuillaumeBourlart/guillaumebourlart.github.io.git mobiverse-games
cd mobiverse-games
npm ci
npm run dev
```

Le site de développement est accessible sur http://localhost:3000.

## Reconstruire le site publié

```bash
npm run build
```

Le résultat se trouve dans `out/`. Pour le consulter, avec Python 3 installé :

```bash
python3 -m http.server 3000 --directory out
```

La compilation récupère la police Inter auprès de Google Fonts ; une connexion Internet est nécessaire. Aucun fichier `.env` ni secret applicatif n'est nécessaire pour cette version statique. `node_modules/`, `.next/` et `out/` sont recréés par les commandes ci-dessus et ne sont pas sauvegardés dans Git.

## Fichiers à conserver

- `app/`, `components/`, `data/` : pages, composants et contenu.
- `public/` : images, captures, `app-ads.txt` et `CNAME`.
- `package.json`, `package-lock.json` et les fichiers de configuration : compilation reproductible.
- Les documents Markdown Pawder : textes source conservés avec le projet.
- `.nojekyll` et `copy-nojekyll.js` : prise en charge des fichiers Next.js par GitHub Pages.

`public/CNAME` contient `mobiversegames.com`. `public/app-ads.txt` et la capture supplémentaire ont été récupérés depuis la version publiée, puis réintégrés au projet source.

## Publication

GitHub Pages utilise **GitHub Actions**. Chaque push sur `main` lance le workflow `.github/workflows/deploy.yml`, qui installe les dépendances avec `npm ci`, compile le site et publie le contenu de `out/`.

Pour publier une nouvelle version, modifier les sources, vérifier `npm run build`, puis créer un commit et le pousser sur `main`. Il n'est plus nécessaire d'envoyer manuellement les fichiers générés.

Le workflow utilise la version de Node.js indiquée dans `.nvmrc`. Il peut aussi être relancé depuis l'onglet **Actions → Deploy to GitHub Pages → Run workflow**. Le domaine personnalisé reste configuré dans **Settings → Pages → Custom domain**.

## Domaine personnalisé

Voir [docs/DOMAINE.md](docs/DOMAINE.md) pour le diagnostic DNS et les valeurs nécessaires à GitHub Pages. Le domaine et les e-mails se configurent chez le fournisseur DNS ; supprimer la copie locale du projet ne change pas ces services.

## Organisation du contenu

- `/` : quatre applications du studio, deux réalisations clients (Archidex et Yams Love), leurs galeries de captures, les services et le contact.
- `/a-propos/` : présentation de Guillaume Bourlart et de son parcours.
- `/estimation/` : questionnaire de budget et de délai, conservé avec ses règles de calcul.
- `/mentions-legales/` : identité de l’entrepreneur individuel, nom commercial, hébergeur et information sur les données personnelles.
- `/pawder/` : assistance et documents légaux de l’application.

Les applications et leurs liens App Store se modifient dans `data/apps.ts`. Le champ `projectType` distingue les applications du studio (`studio`) des développements réalisés pour des clients (`client`). La charte du site (ivoire, vert profond et citron) se trouve dans `app/globals.css`. Les captures restent dans `public/screenshots/`. Le composant `components/IPhoneMockup.tsx` les présente dans le cadre transparent `public/mockup_iphone.png`, aussi bien sur l’accueil que dans les galeries.

## Supprimer la copie locale

Le site publié fonctionne sur GitHub Pages, indépendamment de ce dossier. Après un push réussi sur `main` et un déploiement confirmé, la copie locale peut être supprimée si aucune modification ni fichier personnel non sauvegardé ne subsiste. Pour retravailler sur le site, utiliser les commandes de récupération ci-dessus.

Git conserve les sources, les ressources et la configuration. Les dossiers `node_modules/`, `.next/` et `out/`, ainsi que `next-env.d.ts`, sont générés à nouveau par l’installation et la compilation. Les fichiers `.DS_Store` sont des métadonnées du Finder.

Les avis administratifs PDF, les captures de travail dans `Claude outputs/` et les fichiers temporaires dans `_to_delete/` sont exclus du dépôt public. Toute pièce personnelle à conserver doit être sauvegardée séparément, hors du dossier du projet, avant de supprimer celui-ci.
