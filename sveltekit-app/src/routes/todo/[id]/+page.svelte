<script>
  import { createQuery, createMutation } from '@tanstack/svelte-query'
  import { page } from '$app/state'
  import { base } from '$app/paths'
  import { fetchTodo, toggleTodo } from '$lib/api'

  const id = $derived(page.params.id)

  const query = createQuery(() => ({
    queryKey: ['todo', id],
    queryFn: () => fetchTodo(id),
  }))

  const toggle = createMutation(() => ({
    mutationFn: (todoId) => toggleTodo(todoId),
    onSuccess: () => query.refetch(),
  }))
</script>

{#if query.isLoading}
  <p>Loading…</p>
{:else}
  <a href="{base}/">← Back</a>
  <h2>{query.data.title}</h2>
  <p>Status: {query.data.done ? 'Done' : 'Open'}</p>
  <button onclick={() => toggle.mutate(query.data.id)}>Toggle</button>
{/if}
