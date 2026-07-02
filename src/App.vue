<script setup lang="ts">
import { useAuth } from '@/composables/auth/useAuth'
import { usePWA } from '@/composables/pwa/usePWA'
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'

const { loading } = useAuth()
usePWA() // eagerly registers beforeinstallprompt listener at app startup
</script>

<template>
  <div v-if="loading" class="flex h-screen items-center justify-center">
    <span class="text-muted-foreground text-sm">Loading…</span>
  </div>
  <RouterView v-else />
  <Toaster />
</template>

<style scoped></style>
