<script>
  import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { base } from '$app/paths'
  import { fetchTodos, addTodo, toggleTodo } from '$lib/api'

  const client = useQueryClient()
  let title = $state('')

  const query = createQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(),
  }))

  const add = createMutation(() => ({
    mutationFn: (t) => addTodo(t),
    onSuccess: () => client.invalidateQueries({ queryKey: ['todos'] }),
  }))

  const toggle = createMutation(() => ({
    mutationFn: (id) => toggleTodo(id),
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: ['todos'] })
      const prev = client.getQueryData(['todos'])
      client.setQueryData(['todos'], (old) =>
        old.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      client.setQueryData(['todos'], ctx.prev)
    },
  }))

  function onAdd(e) {
    e.preventDefault()
    if (!title) return
    add.mutate(title)
    title = ''
  }
</script>

{#if query.isLoading}
  <p>Loading…</p>
{:else}
  <form onsubmit={onAdd}>
    <input bind:value={title} placeholder="New todo" />
    <button type="submit" disabled={add.status === 'pending'}>Add</button>
  </form>

  {#if query.isFetching}<p>Refreshing…</p>{/if}
  <ul>
    {#each query.data as todo (todo.id)}
      <li>
        <input
          type="checkbox"
          checked={todo.done}
          onchange={() => toggle.mutate(todo.id)}
        />
        <a href="{base}/todo/{todo.id}">{todo.title}</a>
      </li>
    {/each}
  </ul>
{/if}
