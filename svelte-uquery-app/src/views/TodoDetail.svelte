<script>
  import { useQuery, useMutation } from '../lib/uquery.svelte.js'
  import { fetchTodo, toggleTodo } from '../api'

  let { params } = $props()

  const query = useQuery(() => ({
    key: ['todo', params.id],
    fetcher: () => fetchTodo(params.id),
  }))

  const toggle = useMutation(() => ({
    mutator: (id) => toggleTodo(id),
    onSuccess: () => query.refetch(),
  }))
</script>

{#if query.isLoading}
  <p>Loading…</p>
{:else}
  <a href="#/">← Back</a>
  <h2>{query.data.title}</h2>
  <p>Status: {query.data.done ? 'Done' : 'Open'}</p>
  <button onclick={() => toggle.mutate(query.data.id)}>Toggle</button>
{/if}
