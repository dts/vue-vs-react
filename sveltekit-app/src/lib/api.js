// Fake in-memory API so there are no network deps in the bundle.
let todos = [
  { id: 1, title: 'Learn SvelteKit', done: false },
  { id: 2, title: 'Try svelte-query', done: false },
  { id: 3, title: 'Compare bundle sizes', done: true },
]
let nextId = 4

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export async function fetchTodos() {
  await delay(100)
  return todos.map((t) => ({ ...t }))
}

export async function fetchTodo(id) {
  await delay(100)
  const t = todos.find((t) => t.id === Number(id))
  if (!t) throw new Error('Not found')
  return { ...t }
}

export async function addTodo(title) {
  await delay(100)
  const t = { id: nextId++, title, done: false }
  todos.push(t)
  return { ...t }
}

export async function toggleTodo(id) {
  await delay(100)
  const t = todos.find((t) => t.id === Number(id))
  t.done = !t.done
  return { ...t }
}
