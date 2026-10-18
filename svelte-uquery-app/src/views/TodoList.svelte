<script>
  import { useQuery, useMutation, useQueryClient } from '../lib/uquery.svelte.js'
  import { fetchTodos, addTodo, toggleTodo } from '../api'

  const client = useQueryClient()
  let title = $state('')

  const query = useQuery(() => ({
    key: ['todos'],
    fetcher: () => fetchTodos(),
  }))

  const add = useMutation(() => ({
    mutator: (t) => addTodo(t),
    onSuccess: () => client.invalidateQueries(['todos']),
  }))

  const toggle = useMutation(() => ({
    mutator: (id) => toggleTodo(id),
    onMutate: (id, { patch }) => {
      patch(['todos'], (draft) => {
        const item = draft.find((t) => t.id === id)
        if (item) item.done = !item.done
      })
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
        <a href={`#/todo/${todo.id}`}>{todo.title}</a>
      </li>
    {/each}
  </ul>
{/if}
