<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
const { loading } = useAuth()
</script>

<template>
  <div v-if="loading" class="flex h-screen items-center justify-center">
    <span class="text-muted-foreground text-sm">Loading…</span>
  </div>
  <RouterView v-else />
</template>

<style scoped></style>
