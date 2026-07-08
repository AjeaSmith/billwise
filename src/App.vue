<script setup lang="ts">
import { useAuth } from '@/composables/auth/useAuth'
import { usePWA } from '@/composables/pwa/usePWA'
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import { watch } from 'vue'
import { useFetchBills } from './composables/bills/useFetchBills'
import { usePushNotification } from './composables/notification/usePushNotification'

const { requestPermission, permissionState, oneSignalLogin } = usePushNotification()
const { loading, user } = useAuth()
const { data } = useFetchBills()

usePWA() // eagerly registers beforeinstallprompt listener at app startup
watch(data, async (newBills) => {
  if (!newBills || newBills.length < 1) return
  if (permissionState.value !== 'default') return

  const result = await requestPermission()
  if (result === 'granted') {
    await oneSignalLogin(user.value!.id)
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
