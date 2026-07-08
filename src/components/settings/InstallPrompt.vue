<script setup lang="ts">
import { CheckCircle, Download, Smartphone } from '@lucide/vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/composables/pwa/usePWA'

const steps = ['Tap the Share button in Safari', 'Tap "Add to Home Screen"', 'Tap "Add" to confirm']
const { isInstalled, isIOS, isInstallable, promptInstall } = usePWA() // eagerly registers beforeinstallprompt listener at app startup
</script>

<template>
  <section class="space-y-2">
    <h2 class="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">App</h2>
    <Card v-if="isInstalled" class="p-5">
      <CardContent class="flex flex-col gap-4 p-0">
        <div class="flex items-center gap-2">
          <CheckCircle class="size-5" />
          <h3 class="text-base font-semibold">Already installed on your device.</h3>
        </div>
      </CardContent>
    </Card>
    <Card v-else-if="isInstallable" class="p-5">
      <CardContent class="flex flex-col gap-4 p-0">
        <div class="flex items-center gap-2">
          <Download class="size-5" />
          <h3 class="text-base font-semibold">Installable</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          Install this app on your device to receive push notifications and use it like a native
          app.
        </p>
        <Button @click="promptInstall">Install</Button>
      </CardContent>
    </Card>
    <Card v-else-if="isIOS" class="p-5">
      <CardContent class="flex flex-col gap-4 p-0">
        <div class="flex items-center gap-2">
          <Smartphone class="size-5" />
          <h3 class="text-base font-semibold">Add to home screen</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          Install this app on your iPhone to receive push notifications and use it like a native
          app.
        </p>
        <ol class="flex flex-col gap-3">
          <li v-for="(step, index) in steps" :key="step" class="flex items-center gap-3">
            <span
              class="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
            >
              {{ index + 1 }}
            </span>
            <span class="text-sm">{{ step }}</span>
          </li>
        </ol>
      </CardContent>
    </Card>
    <Card v-else class="p-5">
      <CardContent class="flex flex-col gap-4 p-0">
        <p class="text-sm text-muted-foreground">
         Please use a supported browser to install this app. Supported browsers include Chrome, Edge, and Safari.
        </p>
      </CardContent>
    </Card>
  </section>
</template>
