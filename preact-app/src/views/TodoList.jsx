import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTodos, addTodo, toggleTodo } from '../api'

export default function TodoList() {
  const client = useQueryClient()
  const [title, setTitle] = useState('')

  const query = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(),
  })

  const add = useMutation({
    mutationFn: (t) => addTodo(t),
    onSuccess: () => client.invalidateQueries({ queryKey: ['todos'] }),
  })

  const toggle = useMutation({
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
  })

  if (query.isLoading) return <p>Loading…</p>

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!title) return
          add.mutate(title)
          setTitle('')
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New todo"
        />
        <button type="submit" disabled={add.status === 'pending'}>
          Add
        </button>
      </form>

      {query.isFetching && <p>Refreshing…</p>}
      <ul>
        {query.data.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggle.mutate(todo.id)}
            />
            <Link to={`/todo/${todo.id}`}>{todo.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
