<script setup lang="ts">
import { useAuth } from '@/composables/auth/useAuth'
import { usePWA } from '@/composables/pwa/usePWA'
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import { watch } from 'vue'
import { useFetchBills } from './composables/bills/useFetchBills'
import { useOneSignal } from '@onesignal/onesignal-vue3'

const oneSignal = useOneSignal()
const { loading, user } = useAuth()
const { data } = useFetchBills()

usePWA() // eagerly registers beforeinstallprompt listener at app startup
watch(data, async (newBills) => {
  if (!newBills || newBills.length < 1) return
  if (oneSignal.Notifications.permission) return

  const granted = await oneSignal.Notifications.requestPermission()

  if (granted) {
    await oneSignal.login(user.value!.id)
  }
})
</script>

<template>
  <div v-if="loading" class="flex h-screen items-center justify-center">
    <span class="text-muted-foreground text-sm">Loading…</span>
  </div>
  <RouterView v-else />
  <Toaster />
</template>

<style scoped></style>
