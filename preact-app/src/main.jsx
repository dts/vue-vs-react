import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import TodoList from './views/TodoList.jsx'
import TodoDetail from './views/TodoDetail.jsx'

const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <TodoList /> },
      { path: 'todo/:id', element: <TodoDetail /> },
    ],
  },
]

// hash router on GitHub Pages so deep links survive a hard refresh
const router = import.meta.env.VITE_USE_HASH
  ? createHashRouter(routes)
  : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
