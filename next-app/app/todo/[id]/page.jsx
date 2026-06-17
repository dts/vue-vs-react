// Server component: enumerate which ids to pre-render for static export.
import TodoDetail from './todo-detail'

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }]
}

export const dynamicParams = false

export default function Page() {
  return <TodoDetail />
}
