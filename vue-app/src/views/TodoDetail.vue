<template>
  <div>
    <RouterLink to="/">← Back</RouterLink>
    <h2>{{ query.data?.title }}</h2>
    <p>Status: {{ query.data?.done ? 'Done' : 'Open' }}</p>
    <button @click="toggle.mutate(query.data.id)">Toggle</button>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useQuery, useMutation } from '@dts/vue-uquery'
import { fetchTodo, toggleTodo } from '../api'

const route = useRoute()

const query = await useQuery({
  key: ['todo', route.params.id],
  fetcher: () => fetchTodo(route.params.id),
})

const toggle = useMutation({
  mutator: (id) => toggleTodo(id),
  onSuccess: () => query.refetch(),
})
</script>
