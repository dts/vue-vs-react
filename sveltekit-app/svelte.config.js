import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    // static site (prerendered), deployable to GitHub Pages
    adapter: adapter({ fallback: '404.html' }),
    paths: { base: process.env.BASE_PATH || '' },
  },
}
