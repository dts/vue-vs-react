<script>
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'
  import Router from 'svelte-spa-router'
  import TodoList from './views/TodoList.svelte'
  import TodoDetail from './views/TodoDetail.svelte'

  const queryClient = new QueryClient()
  const routes = {
    '/': TodoList,
    '/todo/:id': TodoDetail,
  }
</script>

<QueryClientProvider client={queryClient}>
  <h1>Todos (Svelte)</h1>
  <nav><a href="#/">Home</a></nav>
  <Router {routes} />
</QueryClientProvider>
