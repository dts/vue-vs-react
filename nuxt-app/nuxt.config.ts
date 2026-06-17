// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  // SPA mode: no SSR, pure client-rendered app
  ssr: false,

  sourcemap: { client: true },

  // base URL for GitHub Pages (NUXT_APP_BASE_URL is read automatically too)
  app: { baseURL: process.env.NUXT_APP_BASE_URL || '/' },

  // emit an index.html shell for each route so deep links work on a static host
  nitro: { prerender: { routes: ['/todo/1', '/todo/2', '/todo/3'] } },
})
