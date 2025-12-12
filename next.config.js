/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Pas de basePath pour les repos .github.io (accessible directement à la racine)
}

module.exports = nextConfig

