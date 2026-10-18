// svelte-uquery — a ~vue-uquery-shaped micro query/mutation cache built directly
// on Svelte 5 runes (no @tanstack/query-core). Proof that Svelte's reactivity
// primitives cover what vue-uquery needs:
//   Vue reactive()  -> $state (deep proxy, mutate-in-place + reactive)
//   Vue ref/computed -> $state / $derived
//   Vue snapshot     -> $state.snapshot (for optimistic rollback)
//   Vue provide/inject -> setContext / getContext
//   effects outside a component -> $effect.pre / $effect.root
import { getContext, setContext } from 'svelte'

const KEY = Symbol('uquery')
const hashKey = (key) => JSON.stringify(key)
const PENDING = { data: undefined, error: undefined, status: 'pending', isFetching: true }

class QueryClient {
  // one big deeply-reactive object: hash -> entry. Like Vue's reactive() cache.
  cache = $state({})

  /** ensure an entry exists and kick off the initial fetch (called from an effect) */
  _activate(h, fetcher) {
    const e = this.cache[h]
    if (!e) {
      this.cache[h] = { data: undefined, error: undefined, status: 'pending', isFetching: false, fetcher }
      this._fetch(h, fetcher)
    } else {
      e.fetcher = fetcher
    }
  }

  async _fetch(h, fetcher) {
    const e = this.cache[h]
    e.isFetching = true
    try {
      e.data = await fetcher()
      e.error = undefined
      e.status = 'success'
    } catch (err) {
      e.error = err
      e.status = 'error'
    } finally {
      e.isFetching = false
    }
    return this.cache[h].data
  }

  getQueryData(key) {
    return this.cache[hashKey(key)]?.data
  }

  setQueryData(key, updater) {
    const h = hashKey(key)
    const e = this.cache[h]
    if (!e) return
    e.data = typeof updater === 'function' ? updater($state.snapshot(e.data)) : updater
  }

  async invalidateQueries(key) {
    const e = this.cache[hashKey(key)]
    if (e?.fetcher) await this._fetch(hashKey(key), e.fetcher)
  }

  /** optimistic edit: snapshot, mutate the live $state draft in place (views
   *  update reactively), return a handle whose revert() restores the snapshot. */
  patch(key, recipe) {
    const e = this.cache[hashKey(key)]
    if (!e || e.data == null) return null
    const snapshot = $state.snapshot(e.data)
    recipe(e.data)
    return { revert: () => { e.data = snapshot } }
  }
}

export function createQueryClient() {
  return new QueryClient()
}

export function setQueryClient(client) {
  setContext(KEY, client)
}

export function useQueryClient() {
  const client = getContext(KEY)
  if (!client) throw new Error('No QueryClient in context — call setQueryClient() in a parent.')
  return client
}

/** useQuery(() => ({ key, fetcher })) — accessor for reactive keys, like
 *  vue-uquery's MaybeRefOrGetter. Returns a reactive result read via getters. */
export function useQuery(optionsAccessor) {
  const client = useQueryClient()
  const opts = $derived(optionsAccessor())
  const h = $derived(hashKey(opts.key))

  $effect.pre(() => {
    client._activate(h, opts.fetcher)
  })

  const entry = $derived(client.cache[h] ?? PENDING)

  return {
    get data() { return entry.data },
    get error() { return entry.error },
    get status() { return entry.status },
    get isLoading() { return entry.status === 'pending' },
    get isFetching() { return entry.isFetching ?? false },
    refetch: () => client._fetch(h, opts.fetcher),
  }
}

/** useMutation(() => ({ mutator, onMutate, onSuccess, onError })) — onMutate gets
 *  a { patch } helper; patches auto-revert on error, auto-keep on success. */
export function useMutation(optionsAccessor) {
  const client = useQueryClient()
  const opts = $derived(optionsAccessor())

  let status = $state('idle')
  let data = $state(undefined)
  let error = $state(undefined)

  async function mutate(vars) {
    status = 'pending'
    error = undefined
    const patches = []
    const helpers = {
      patch: (key, recipe) => {
        const p = client.patch(key, recipe)
        if (p) patches.push(p)
      },
    }
    let ctx
    try {
      ctx = await opts.onMutate?.(vars, helpers)
      const result = await opts.mutator(vars)
      data = result
      status = 'success'
      await opts.onSuccess?.(result, vars, ctx)
      return result
    } catch (err) {
      patches.forEach((p) => p.revert()) // auto-rollback
      error = err
      status = 'error'
      await opts.onError?.(err, vars, ctx)
      throw err
    }
  }

  return {
    mutate,
    get status() { return status },
    get data() { return data },
    get error() { return error },
  }
}
