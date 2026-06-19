# Vue vs. React vs. Svelte vs. Preact — bundle-size comparison

Seven functionally identical stub TODO apps (list view + detail view, a list query,
a detail query, an invalidating add-mutation, and an **optimistic toggle mutation
with rollback**). Same building blocks on each side, so the only variable is the
framework stack:

| App | Routing | Data layer | Build |
|---|---|---|---|
| **svelte-app** | svelte-spa-router | @tanstack/svelte-query | Vite 8 |
| **vue-app** | vue-router 5 | @dts/vue-uquery | Vite 8 (Rolldown/Oxc) |
| **preact-app** | react-router 7 | @tanstack/react-query | Vite 8 + `preact/compat` |
| **react-app** | react-router 7 | @tanstack/react-query | Vite 8 (Rolldown/Oxc) |
| **sveltekit-app** | SvelteKit | @tanstack/svelte-query | SvelteKit — static (prerendered) |
| **nuxt-app** | Nuxt (vue-router 5) | @dts/vue-uquery | Nuxt 4 — **SPA mode** (`ssr:false`) |
| **next-app** | Next App Router | @tanstack/react-query | Next 16 — **static export** (`output:'export'`) |

All seven run **client-side** (no Node server) and deploy as static files. The
Preact app is the React app *verbatim* — same react-router + react-query source —
with `@preact/preset-vite` aliasing `react`/`react-dom` → `preact/compat`, so it
isolates the cost of the runtime swap.

> 🔗 **Live demo** (click around all four): https://dts.github.io/vue-vs-react/

## Headline: First Load JS for `/`

What a **modern browser actually downloads** to render the home route (gzip; for
the meta-frameworks this excludes the legacy `nomodule` polyfills and other route
chunks):

| App | Raw | Gzip | vs. lightest |
|---|---:|---:|---:|
| **Svelte SPA** | 85.7 kB | **29.4 kB** | 1.0× |
| **Vue SPA** | 100.2 kB | **38.5 kB** | 1.3× |
| **SvelteKit** | 116.2 kB | **40.5 kB** | 1.4× |
| **Preact SPA** | 154.4 kB | **50.4 kB** | 1.7× |
| **Nuxt** (SPA) | 182.6 kB | **69.0 kB** | 2.3× |
| **React SPA** | 323.0 kB | **101.6 kB** | 3.5× |
| **Next** (export) | 561.2 kB | **157.1 kB** | 5.3× |

The pure SPAs ship a single chunk, so first-load *is* the whole app. The
meta-frameworks code-split; their numbers are the chunks the home route requests
on first paint.

### Total client JS (all chunks, every route)

For reference — sum of **all** emitted client chunks. Overstates first-load
because it counts every route plus (for Next) the legacy polyfill chunk:

| App | Raw | Gzip |
|---|---:|---:|
| Svelte SPA | 85.7 kB | 29.4 kB |
| Vue SPA | 100.2 kB | 38.5 kB |
| SvelteKit | 119.4 kB | 41.9 kB |
| Preact SPA | 154.4 kB | 50.4 kB |
| Nuxt (SPA) | 190.4 kB | 70.7 kB |
| React SPA | 323.0 kB | 101.6 kB |
| Next (export) | 690.4 kB | 200.9 kB (161.3 kB excl. legacy polyfills) |

> **SPA mode barely changes the meta-framework size.** Nuxt with `ssr:false` is
> within ~1 kB of the SSR build — the Nuxt client runtime (hydration, payload
> revival, plugins) ships either way; you only drop the server-rendered HTML, not
> client weight. The per-package breakdown below is from a Next **webpack** build
> (905 kB raw / 274 kB gz total) because it emits complete vendor sourcemaps; the
> composition is the same as the deployed export.

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

### Svelte SPA — 85.7 kB raw

| Package | Raw | Share |
|---|---:|---:|
| svelte (runtime) | 42.4 kB | 49.8% |
| @tanstack/query-core | 32.7 kB | 38.5% |
| svelte-spa-router | 4.1 kB | 4.9% |
| app code | 2.8 kB | 3.2% |
| @tanstack/svelte-query | 2.6 kB | 3.1% |
| regexparam | 0.4 kB | 0.5% |

### Preact SPA — 154.4 kB raw

The React app verbatim, on `preact/compat`. The 25 kB Preact runtime replaces
~191 kB of `react-dom` + `react` + `scheduler` — but react-router (unchanged) is
now 59% of the bundle:

| Package | Raw | Share |
|---|---:|---:|
| react-router | 90.7 kB | 59.0% |
| @tanstack/query-core | 32.8 kB | 21.3% |
| **preact** (+ compat) | 25.5 kB | 16.6% |
| @tanstack/react-query | 2.4 kB | 1.6% |
| app code | 2.3 kB | 1.5% |

### SvelteKit — 119.4 kB raw (all chunks, prerendered)

| Package | Raw | Share | |
|---|---:|---:|---|
| svelte (runtime) | 47.4 kB | 40.6% | Vue/Svelte core |
| @tanstack/query-core | 32.5 kB | 27.9% | data layer |
| @sveltejs/kit (client) | 27.3 kB | 23.4% | meta-framework |
| app code | 6.5 kB | 5.6% | |
| @tanstack/svelte-query | 2.8 kB | 2.4% | |

### Nuxt — 190.4 kB raw (all chunks, SPA mode)

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
| **h3 / unctx / destr / defu** | 4.6 kB | 2.5% | runtime utils |
| nuxt/app glue | 1.1 kB | 0.6% | generated |

### Next — 904.9 kB raw (all chunks, webpack build)

| Package | Raw | Share | |
|---|---:|---:|---|
| **next** (client runtime) | 568.6 kB | 62.9% | App Router, segment cache, router reducer, hydration, RSC payload |
| react-dom | 178.4 kB | 19.7% | React core |
| **polyfills (core-js)** | 112.6 kB | 12.5% | **legacy browsers only — see below** |
| @tanstack/query-core | 27.3 kB | 3.0% | data layer |
| react | 7.8 kB | 0.9% | |
| scheduler | 3.5 kB | 0.4% | |
| webpack runtime | 3.3 kB | 0.4% | |
| @swc/helpers | 1.8 kB | 0.2% | |
| @tanstack/react-query | 0.3 kB | 0.0% | |

## FAQ from reading the numbers

### "The data layer is the same everywhere — except Vue"

`@tanstack/query-core` is a near-constant **~33 kB raw** in every React, Preact,
and Svelte app (plus its thin per-framework adapter, ~2.5 kB). It's often the
single biggest dependency after the framework runtime. `@dts/vue-uquery`, by
contrast, is **6.6 kB** for the same query/mutation/optimistic-rollback surface —
~5× smaller — which is most of why the Vue SPA undercuts the React/Preact ones at
equivalent functionality.

### "Why are Svelte and Preact so small?"

Svelte compiles components to direct DOM operations, so there's no virtual-DOM
runtime to ship — its 42 kB runtime + 33 kB query-core is the whole story.
Preact's 25 kB runtime (incl. the `compat` shim) stands in for ~191 kB of
`react-dom` + `react` + `scheduler` at near-full React compatibility — the React
*app* runs unchanged on it. Note that in the Preact app **react-router becomes the
biggest single piece (59%)**: once you drop react-dom, the router is the weight.

### "Why is Nuxt ~2× a plain Vue SPA?"

It is **not** loading "unnecessary" stuff — it's loading the SSR/hydration
machinery that makes it a meta-framework, which a mount-into-a-div SPA doesn't
have. The Vue-core + router + uquery portion is essentially the *same* as the SPA
(`@vue/runtime-core` is only larger because Nuxt exercises Suspense / async
components / hydration / Teleport that the SPA tree-shakes away). On top of that
Nuxt adds ~70 kB raw (~30 kB gzip) the SPA has **zero** of: `nuxt` itself
(NuxtLink/NuxtPage, plugins, **client hydration + payload revival**), `unhead`
(head/meta), `devalue` (serialize the SSR payload), `ofetch` (`$fetch`),
`hookable`, plus `ufo`/`h3`/`unctx`/`destr`/`defu`. That's the price of SSR +
hydration + file-based routing. If you only need a client SPA, the plain Vue stack
is ~half the size; if you want SSR/SEO/streaming, ~30 kB gzip buys it.

### "Are those 113 kB of legacy polyfills loaded in modern browsers?"

**No.** Next injects them as `<script src="…/polyfills-….js" noModule>`. Any
browser that understands `<script type="module">` ignores `nomodule` scripts, so
the core-js chunk is fetched *only* by browsers with no ES-module support
(IE11-era). That's why the **First Load JS** table above excludes it — a modern
browser never downloads those 113 kB.

### "Is Next-core really that big, and people are just… fine with it?"

The scary **569 kB "next"** in the breakdown is *raw, uncompressed, summed across
every chunk* — not what loads on a page. The honest number is the **First Load JS
for `/`: ~561 kB raw → 157 kB gzip**, of which the bulk is React-DOM plus the
App Router client runtime (segment cache, prefetch, router reducer, RSC payload
wiring). react-query and the app itself are a rounding error.

And yes — broadly, people accept it, because:
- It's **gzipped/brotli'd, code-split, and HTTP-cached**; after first load,
  client navigations are cheap.
- ~110–130 kB gzip is roughly the going rate for a React meta-framework, so it
  doesn't stand out *within the React ecosystem*.
- You're buying SSR/RSC/streaming/file-routing/image-opt, and most teams never
  measure the baseline.

But it is a **real, frequently-voiced criticism**: it's **4.1× the Vue SPA** and
**2.3× the Nuxt** first-load here, and lighter stacks (this Vue/Nuxt one, or
Solid/Qwik/Astro) exist substantially *because* of that React+Next floor.

## Optimistic updates + rollback

All toggle mutations are optimistic and roll back on failure — the difference is
the API, not the feature:

- **react-query** (react-app, next-app) — explicit: `onMutate` cancels in-flight
  queries, snapshots the previous cache, optimistically `setQueryData`; `onError`
  restores the snapshot.
- **vue-uquery** (vue-app, nuxt-app) — `onMutate` opens a `patchEach` draft and
  mutates it in place; the library **auto-commits on success and auto-reverts on
  error**, so there is no hand-written rollback path.

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
| svelte | 5.56.3 |
| svelte-spa-router | 5.1.0 |
| @tanstack/svelte-query | 6.1.34 |
| @sveltejs/kit | 2.66.0 |
| preact | 10.29.2 |
| vite | 8.0.16 (SPAs) |

## Run any of the four apps locally

```bash
cd vue-app       && npm install && npm run dev   # Vite  → http://localhost:5173
cd react-app     && npm install && npm run dev   # Vite  → http://localhost:5173
cd preact-app    && npm install && npm run dev   # Vite  → http://localhost:5173
cd svelte-app    && npm install && npm run dev   # Vite  → http://localhost:5173
cd nuxt-app      && npm install && npm run dev    # Nuxt  → http://localhost:3000
cd next-app      && npm install && npm run dev    # Next  → http://localhost:3000
cd sveltekit-app && npm install && npm run dev   # Kit   → http://localhost:5173
```

## Deployment

All seven are deployed as static files to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to
`main` → **https://dts.github.io/vue-vs-react/**. Each app is built under its own
base path (`/vue-vs-react/{vue,react,preact,svelte,nuxt,next,sveltekit}/`); the
Vite SPAs use a **hash router** so deep links survive a hard refresh on a static
host, and the meta-frameworks pre-render an HTML file per route. Every app was
verified end-to-end in headless Chrome (renders the list, navigates to a detail
page, no console errors) before deploy.

## Reproduce the measurements

```bash
cd vue-app && npm run build
f=dist/assets/*.js; wc -c < $f; gzip -9 -c $f | wc -c      # raw, gzip

# per-package breakdown via source maps (robust to Infinity-column maps
# that newer minifiers emit, which trip up source-map-explorer):
node analyze.mjs "<label>" '<app>/<glob to *.js>'
```
