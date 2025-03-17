/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Asegúrate de que las imágenes funcionen correctamente en la exportación estática
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig