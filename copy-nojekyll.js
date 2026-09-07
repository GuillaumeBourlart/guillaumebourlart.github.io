const fs = require('fs');
const path = require('path');

// Copier .nojekyll dans le dossier out/ pour GitHub Pages
const outDir = path.join(__dirname, 'out');
const nojekyllSource = path.join(__dirname, '.nojekyll');
const nojekyllDest = path.join(outDir, '.nojekyll');

if (fs.existsSync(outDir) && fs.existsSync(nojekyllSource)) {
  fs.copyFileSync(nojekyllSource, nojekyllDest);
  console.log('✅ Fichier .nojekyll copié dans out/');
} else if (!fs.existsSync(outDir)) {
  console.error('❌ Le dossier out/ n\'existe pas. Exécutez "npm run build" d\'abord.');
  process.exit(1);
} else {
  console.log('⚠️  Fichier .nojekyll source introuvable');
}

