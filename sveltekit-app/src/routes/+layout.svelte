<script>
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'
  import { base } from '$app/paths'

  let { children } = $props()
  const queryClient = new QueryClient()
</script>

<QueryClientProvider client={queryClient}>
  <h1>Todos (SvelteKit)</h1>
  <nav><a href="{base}/">Home</a></nav>
  {@render children()}
</QueryClientProvider>
