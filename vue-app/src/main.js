import { createApp } from 'vue'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { createQueryClient } from '@dts/vue-uquery'
import App from './App.vue'
import TodoList from './views/TodoList.vue'
import TodoDetail from './views/TodoDetail.vue'

const router = createRouter({
  // hash history on GitHub Pages so deep links survive a hard refresh
  history: import.meta.env.VITE_USE_HASH
    ? createWebHashHistory()
    : createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: TodoList },
    { path: '/todo/:id', component: TodoDetail },
  ],
})

const queryClient = createQueryClient()

const app = createApp(App)
app.use(router)
app.use(queryClient)
app.mount('#app')
