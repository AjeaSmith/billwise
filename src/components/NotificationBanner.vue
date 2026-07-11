<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BellOff } from '@lucide/vue'

defineProps<{
  type: 'denied' | 'expired'
}>()

const emit = defineEmits(['reEnable'])
</script>

<template>
  <Alert variant="destructive">
    <BellOff class="h-4 w-4" />
    <AlertTitle>
      {{ type === 'denied' ? 'Notifications disabled' : 'Subscription expired' }}
    </AlertTitle>
    <AlertDescription>
      <span v-if="type === 'denied'">
        Notifications are off —
        <a href="app-settings:" class="underline font-medium">go to Settings to enable</a>
      </span>
      <span v-else>
        Your notification subscription expired —
        <button class="underline font-medium" @click="emit('reEnable')">tap to re-enable</button>
      </span>
    </AlertDescription>
  </Alert>
</template>
