/** @type {import('next').NextConfig} */
const nextConfig = {
  // static export: SPA-style, no Node server needed (deployable to GitHub Pages)
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  productionBrowserSourceMaps: true,
  ...(process.env.NEXT_BASE_PATH
    ? { basePath: process.env.NEXT_BASE_PATH, assetPrefix: process.env.NEXT_BASE_PATH }
    : {}),
}

export default nextConfig
