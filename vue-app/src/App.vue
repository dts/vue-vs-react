<template>
  <div>
    <h1>Todos (Vue)</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
    </nav>
    <Suspense>
      <RouterView />
      <template #fallback>Loading…</template>
    </Suspense>
  </div>
</template>

<script setup></script>
