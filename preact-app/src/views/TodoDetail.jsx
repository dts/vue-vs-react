import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchTodo, toggleTodo } from '../api'

export default function TodoDetail() {
  const { id } = useParams()

  const query = useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchTodo(id),
  })

  const toggle = useMutation({
    mutationFn: (todoId) => toggleTodo(todoId),
    onSuccess: () => query.refetch(),
  })

  if (query.isLoading) return <p>Loading…</p>

  return (
    <div>
      <Link to="/">← Back</Link>
      <h2>{query.data.title}</h2>
      <p>Status: {query.data.done ? 'Done' : 'Open'}</p>
      <button onClick={() => toggle.mutate(query.data.id)}>Toggle</button>
    </div>
  )
}
