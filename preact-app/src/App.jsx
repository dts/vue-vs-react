import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <h1>Todos (Preact)</h1>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Outlet />
    </div>
  )
}
