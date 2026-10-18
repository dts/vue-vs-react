<script>
  import Router from 'svelte-spa-router'
  import { createQueryClient, setQueryClient } from './lib/uquery.svelte.js'
  import TodoList from './views/TodoList.svelte'
  import TodoDetail from './views/TodoDetail.svelte'

  // provide the client to the component tree (Vue's app.use(queryClient) / provide)
  setQueryClient(createQueryClient())

  const routes = {
    '/': TodoList,
    '/todo/:id': TodoDetail,
  }
</script>

<h1>Todos (Svelte + svelte-uquery)</h1>
<nav><a href="#/">Home</a></nav>
<Router {routes} />
