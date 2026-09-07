# Portfolio de Guillaume Bourlart

Code source du portfolio Next.js, de la page d'estimation et des pages Pawder.

## Où est la version complète ?

- Dépôt : https://github.com/GuillaumeBourlart/guillaumebourlart.github.io
- Branche `codex/source-complete` : projet source complet, images, documents et configuration pour reconstruire le site.
- Branche `main` : fichiers statiques actuellement publiés par GitHub Pages depuis la racine.

Le code source était auparavant conservé sur le Mac, tandis que les fichiers du dossier `out/` étaient envoyés sur GitHub. La branche source conserve désormais les deux historiques Git : celui du projet local et celui du site publié.

## Récupérer le projet sur un autre ordinateur

Installer Git et Node.js 22 (version de validation indiquée dans `.nvmrc`), puis :

```bash
git clone --branch codex/source-complete https://github.com/GuillaumeBourlart/guillaumebourlart.github.io.git portfolio
cd portfolio
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

La compilation récupère la police Inter auprès de Google Fonts ; une connexion Internet est nécessaire. Aucun fichier `.env` ni secret applicatif n'est nécessaire pour cette version statique. `node_modules/`, `.next/` et `out/` sont recréés par les commandes ci-dessus et ne sont pas sauvegardés sur la branche source.

## Fichiers à conserver

- `app/`, `components/`, `data/` : pages, composants et contenu.
- `public/` : images, captures, `app-ads.txt` et `CNAME`.
- `package.json`, `package-lock.json` et les fichiers de configuration : compilation reproductible.
- Les documents Markdown Pawder : textes source conservés avec le projet.
- `.nojekyll` et `copy-nojekyll.js` : prise en charge des fichiers Next.js par GitHub Pages.

`public/CNAME` contient `mobiversegames.com`. `public/app-ads.txt` et la capture supplémentaire ont été récupérés depuis la version publiée, puis réintégrés au projet source.

## Publication

GitHub Pages est actuellement configuré sur **Deploy from a branch → main → / (root)**. Un envoi sur `codex/source-complete` sauvegarde le projet sans modifier le site publié.

Pour publier une nouvelle version avec cette configuration, compiler la branche source puis copier le contenu de `out/` dans un autre checkout de `main`, en conservant son dossier `.git`, avant de créer un commit et de le pousser. Ne pas remplacer `main` directement par les sources : cette branche sert actuellement des fichiers HTML statiques.

Le workflow `.github/workflows/deploy.yml` est conservé pour une éventuelle migration vers GitHub Actions. Il ne s'exécute pas lors d'un push sur `codex/source-complete`. Cette migration demandera de configurer Pages sur **GitHub Actions** et de choisir la branche source à déployer.

## Domaine personnalisé

Voir [docs/DOMAINE.md](docs/DOMAINE.md) pour le diagnostic DNS et les valeurs nécessaires à GitHub Pages. Le domaine et les e-mails se configurent chez le fournisseur DNS ; supprimer la copie locale du projet ne change pas ces services.
