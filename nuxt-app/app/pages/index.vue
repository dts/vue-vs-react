<template>
  <div>
    <form @submit.prevent="onAdd">
      <input v-model="title" placeholder="New todo" />
      <button type="submit" :disabled="add.status === 'pending'">Add</button>
    </form>

    <p v-if="query.isFetching">Refreshing…</p>
    <ul>
      <li v-for="todo in query.data" :key="todo.id">
        <input
          type="checkbox"
          :checked="todo.done"
          @change="toggle.mutate(todo.id)"
        />
        <NuxtLink :to="`/todo/${todo.id}`">{{ todo.title }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@dts/vue-uquery'
import { fetchTodos, addTodo, toggleTodo } from '../lib/api'

const client = useQueryClient()
const title = ref('')

const query = await useQuery({
  key: ['todos'],
  fetcher: () => fetchTodos(),
})

const add = useMutation({
  mutator: (t) => addTodo(t),
  onSuccess: () => client.invalidateQueries(['todos']),
})

const toggle = useMutation({
  mutator: (id) => toggleTodo(id),
  onMutate: (id, { patchEach }) => {
    patchEach(['todos'], (draft) => {
      const item = draft.find((t) => t.id === id)
      if (item) item.done = !item.done
    })
  },
})

async function onAdd() {
  if (!title.value) return
  await add.mutate(title.value)
  title.value = ''
}
</script>
