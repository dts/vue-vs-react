<script>
  import { createQuery, createMutation } from '@tanstack/svelte-query'
  import { fetchTodo, toggleTodo } from '../api'

  let { params } = $props()

  const query = createQuery(() => ({
    queryKey: ['todo', params.id],
    queryFn: () => fetchTodo(params.id),
  }))

  const toggle = createMutation(() => ({
    mutationFn: (id) => toggleTodo(id),
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
