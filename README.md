# Vue + vue-uquery vs. React + react-query — bundle size

Two functionally identical stub TODO apps (list view + detail view, a query, an
add mutation, and an optimistic toggle mutation), built with the **same toolchain**
(Vite 6 + esbuild minify, single chunk, production mode) so the only variable is
the framework stack.

## Results

Bundled application JS (one chunk, `kB = 1000 bytes`):

| Stack | Raw | Gzip | Brotli |
|---|---:|---:|---:|
| **Vue 3** + vue-router 4 + @dts/vue-uquery | 105.9 kB | **40.8 kB** | 36.9 kB |
| **Vue 3** + vue-router 5 + @dts/vue-uquery | 103.6 kB | **40.2 kB** | 36.4 kB |
| **React 19** + react-router 7 + @tanstack/react-query | 331.0 kB | **104.4 kB** | 90.9 kB |

**The React stack ships ~2.6× the gzipped JS of the Vue stack** (~104 kB vs ~41 kB
gzip; ~3.1× raw). Choice of vue-router 4 vs 5 is within noise (~0.6 kB gzip).

### Per-library size (reference only)

Each library bundled alone importing its full namespace — **no tree-shaking**, so
these over-count what the apps actually use (e.g. the apps use Vue's runtime-only
build, not the full compiler-included number below). Useful only as a relative
sense of weight.

| Library | Raw | Gzip |
|---|---:|---:|
| vue (full, incl. compiler) | 123.7 kB | 48.3 kB |
| vue-router 4 | 61.3 kB | 23.4 kB |
| @dts/vue-uquery | 28.7 kB | 10.8 kB |
| react | 8.4 kB | 3.3 kB |
| react-dom/client | 193.5 kB | 60.2 kB |
| react-router-dom 7 | 212.6 kB | 69.1 kB |
| @tanstack/react-query | 55.9 kB | 17.0 kB |

> `@dts/vue-uquery` advertises ~4 kB gz for its core query/mutation composables;
> the 10.8 kB above is the **entire** package namespace (infinite query, SSR
> hydrate/dehydrate, extras, etc.) with nothing shaken out.

## Notes on fairness

- **Same build pipeline** for both: Vite 6, esbuild minifier, `manualChunks:
  undefined` (one file), production mode.
- **vue-router 5** is the current `latest`. Its Pinia / `@pinia/colada` peer deps
  are `peerOptional` — they are **not** pulled into the bundle (the v5 build is
  actually marginally *smaller* than v4). Both are shown above.
- **Equivalent features** on both sides: 2 routes, a list query, a detail query,
  an invalidating add-mutation, and an optimistic toggle (cache patch + rollback).
- React Router 7 is used in library/`createBrowserRouter` mode (no framework /
  SSR runtime).

## Versions

| | version |
|---|---|
| vue | 3.5.38 |
| vue-router | 4.6.4 / 5.1.0 |
| @dts/vue-uquery | 0.1.6 |
| react / react-dom | 19.2.7 |
| react-router-dom | 7.18.0 |
| @tanstack/react-query | 5.101.0 |
| vite | 6.x |

## Reproduce

```bash
cd vue-app        && npm install && npx vite build   # vue-router 4
cd vue-app-router5 && npm install --legacy-peer-deps && npx vite build  # vue-router 5
cd react-app      && npm install && npx vite build
```

Built JS lands in each app's `dist/assets/*.js`. Measure with:

```bash
f=dist/assets/*.js
wc -c < $f                 # raw bytes
gzip -9 -c $f | wc -c      # gzip bytes
```
