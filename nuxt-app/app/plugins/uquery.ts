import { createQueryClient } from '@dts/vue-uquery'

export default defineNuxtPlugin((nuxtApp) => {
  const client = createQueryClient()
  nuxtApp.vueApp.use(client)
})
