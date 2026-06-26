<script setup lang="ts">
import { useAuth } from '@/composables/auth/useAuth'
const { loading } = useAuth()
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div v-if="loading" class="flex h-screen items-center justify-center">
    <span class="text-muted-foreground text-sm">Loading…</span>
  </div>
  <RouterView v-else />
  <Toaster />
</template>

<style scoped></style>
