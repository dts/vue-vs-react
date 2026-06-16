# Vue vs. React — bundle-size comparison (SPA + meta-frameworks)

Four functionally identical stub TODO apps (list view + detail view, a list query,
a detail query, an invalidating add-mutation, and an **optimistic toggle mutation
with rollback**). Same building blocks on each side, so the only variable is the
framework stack:

| App | Routing | Data layer | Build |
|---|---|---|---|
| **vue-app** | vue-router 5 | @dts/vue-uquery | Vite 8 (Rolldown/Oxc) |
| **react-app** | react-router 7 | @tanstack/react-query | Vite 8 (Rolldown/Oxc) |
| **nuxt-app** | Nuxt (vue-router 5) | @dts/vue-uquery | Nuxt 4 / Vite |
| **next-app** | Next App Router | @tanstack/react-query | Next 16 |

## Headline: total client JS shipped

Sum of **all** client JS chunks (`kB = 1000 bytes`; gzip = `gzip -9` of the
concatenated chunks):

| App | Raw | Gzip | vs. Vue SPA |
|---|---:|---:|---:|
| **Vue SPA** (vue + vue-router + uquery) | 100.1 kB | **38.1 kB** | 1.0× |
| **Nuxt** (vue + uquery) | 191.0 kB | **71.2 kB** | 1.9× |
| **React SPA** (react + react-router + react-query) | 322.8 kB | **100.2 kB** | 2.6× |
| **Next** (react + react-query) | 904.9 kB † | **274.1 kB** † | 7.2× |

> † Next numbers are from the **webpack** build, which emits complete vendor
> sourcemaps (needed for the breakdown below). Next 16's **default Turbopack**
> build is smaller — **691 kB raw / 201 kB gzip** total. Either way the
> composition is the same: React-DOM + the Next client runtime dominate.

**Caveats for an honest read:**
- The two **SPAs** ship a single chunk — the headline *is* the first load.
- The two **meta-frameworks** code-split per route and this total counts **every**
  route chunk plus, for Next, a **113 kB legacy core-js polyfill** chunk that
  modern (`type=module`) browsers don't download. So real first-load is lower than
  the totals above — but the core runtime still loads on first paint.

## Per-app breakdown

Bytes attributed to each package by walking the production **source maps** (raw,
pre-gzip bytes; share of mapped output). This is where the size actually goes.

### Vue SPA — 100.1 kB raw

| Package | Raw | Share |
|---|---:|---:|
| @vue/runtime-core | 40.8 kB | 41.0% |
| vue-router | 22.8 kB | 22.9% |
| @vue/reactivity | 15.9 kB | 15.9% |
| @vue/runtime-dom | 7.5 kB | 7.6% |
| **@dts/vue-uquery** | **6.8 kB** | **6.8%** |
| @vue/shared | 3.1 kB | 3.2% |
| app code | 2.5 kB | 2.5% |

### React SPA — 322.8 kB raw

| Package | Raw | Share |
|---|---:|---:|
| react-dom | 179.5 kB | 55.8% |
| react-router | 92.8 kB | 28.8% |
| @tanstack/query-core | 32.8 kB | 10.2% |
| react | 7.8 kB | 2.4% |
| scheduler | 3.5 kB | 1.1% |
| @tanstack/react-query | 2.6 kB | 0.8% |
| app code | 2.5 kB | 0.8% |

### Nuxt — 191.0 kB raw

| Package | Raw | Share | |
|---|---:|---:|---|
| @vue/runtime-core | 53.7 kB | 28.6% | Vue core |
| **nuxt** (client runtime) | 35.6 kB | 18.9% | meta-framework |
| vue-router | 23.3 kB | 12.4% | Vue core |
| @vue/reactivity | 17.2 kB | 9.1% | Vue core |
| **unhead** + @unhead/vue | 12.5 kB | 6.7% | head/meta mgmt |
| @vue/runtime-dom | 11.2 kB | 5.9% | Vue core |
| **@dts/vue-uquery** | **6.6 kB** | **3.5%** | data layer |
| **ofetch** | 5.6 kB | 3.0% | `$fetch` |
| **ufo** | 4.4 kB | 2.3% | URL utils |
| @vue/shared | 3.5 kB | 1.8% | Vue core |
| **devalue** | 3.4 kB | 1.8% | payload (de)serialize |
| **hookable** | 3.1 kB | 1.6% | plugin hooks |
| app code | 2.4 kB | 1.3% | |
| **h3 / unctx / destr / defu** | 4.6 kB | 2.5% | Nitro/runtime utils |
| nuxt/app glue | 1.1 kB | 0.6% | generated |

### Next — 904.9 kB raw (webpack build; Turbopack default is smaller)

| Package | Raw | Share | |
|---|---:|---:|---|
| **next** (client runtime) | 568.6 kB | 62.9% | App Router, segment cache, router reducer, hydration |
| react-dom | 178.4 kB | 19.7% | React core |
| **polyfills (core-js)** | 112.6 kB | 12.5% | legacy browsers only |
| @tanstack/query-core | 27.3 kB | 3.0% | data layer |
| react | 7.8 kB | 0.9% | |
| scheduler | 3.5 kB | 0.4% | |
| webpack runtime | 3.3 kB | 0.4% | |
| @swc/helpers | 1.8 kB | 0.2% | |
| @tanstack/react-query | 0.3 kB | 0.0% | |

## Why is Nuxt ~2× a plain Vue SPA?

It is **not** loading "unnecessary" stuff — it's loading the SSR/hydration
machinery that makes it a meta-framework, which a plain mount-into-a-div SPA
simply doesn't have. The breakdown shows it directly:

- The **Vue-core + router + uquery** portion is essentially the *same* as the SPA
  (the SPA's `@vue/*` + vue-router + uquery ≈ Nuxt's same packages). Nuxt's
  `@vue/runtime-core` is a bit *larger* (53.7 kB vs 40.8 kB) only because Nuxt
  exercises more of Vue's runtime — Suspense, async components, hydration,
  Teleport — that the SPA tree-shakes away.
- On top of that, Nuxt adds ~70 kB raw (~30 kB gzip) of framework runtime that
  the SPA has **zero** of: `nuxt` itself (NuxtLink/NuxtPage, plugin system, error
  handling, **client-side hydration + payload revival**), `unhead` (head/meta),
  `devalue` (serialize the SSR payload), `ofetch` (`$fetch`), `hookable` (hooks),
  plus `ufo`/`h3`/`unctx`/`destr`/`defu`.

That runtime is the price of SSR + hydration + file-based routing + the plugin
ecosystem. Nuxt does code-split per route, but this core loads on first paint
regardless. If you only need a client SPA, the plain Vue stack is ~half the size;
if you want SSR/SEO/streaming, the extra ~30 kB gzip is buying you those.

## Optimistic updates + rollback

All toggle mutations are optimistic and roll back on failure — the difference is
the API, not the feature:

- **react-query** (react-app, next-app) — explicit: `onMutate` cancels in-flight
  queries, snapshots the previous cache, optimistically `setQueryData`; `onError`
  restores the snapshot.
- **vue-uquery** (vue-app, nuxt-app) — `onMutate` opens a `patchEach` draft and
  mutates it in place; the library **auto-commits on success and auto-reverts on
  error**, so there is no hand-written rollback path.

See `*/views/TodoList.*` (Vue/React SPA), `next-app/app/page.jsx`,
`nuxt-app/app/pages/index.vue`.

## Versions

| | version |
|---|---|
| vue | 3.5.38 |
| vue-router | 5.1.0 |
| @dts/vue-uquery | 0.1.6 |
| react / react-dom | 19.2.7 |
| react-router-dom | 7.18.0 |
| @tanstack/react-query | 5.101.0 |
| nuxt | 4.4.8 |
| next | 16.2.9 |
| vite | 8.0.16 (SPAs) |

## Run any of the four apps

```bash
cd vue-app   && npm install && npm run dev     # http://localhost:5173
cd react-app && npm install && npm run dev     # http://localhost:5173
cd nuxt-app  && npm install && npm run dev      # http://localhost:3000
cd next-app  && npm install && npm run dev      # http://localhost:3000
```

Production build + preview (what the sizes above are measured from):

```bash
cd vue-app   && npm run build && npm run preview
cd react-app && npm run build && npm run preview
cd nuxt-app  && npm run build && npm run preview
cd next-app  && npm run build && npm start
```

## Reproduce the measurements

```bash
# SPAs: single chunk in dist/assets
cd vue-app && npm run build
f=dist/assets/*.js; wc -c < $f; gzip -9 -c $f | wc -c

# meta-frameworks: sum all client chunks
#   Next: .next/static/chunks/*.js   Nuxt: .output/public/_nuxt/*.js

# per-package breakdown (uses source maps):
node analyze.mjs "<label>" '<app>/<glob to *.js>'
```

`analyze.mjs` attributes every emitted byte to a package by walking the source
maps (robust to the Infinity-column maps that newer minifiers emit, which trip up
`source-map-explorer`).
