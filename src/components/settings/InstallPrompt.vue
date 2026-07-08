<script setup lang="ts">
import { CheckCircle, Download, Smartphone } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { usePWA } from '@/composables/pwa/usePWA'
import InstallStatusCard from './InstallStatusCard.vue'

const steps = ['Tap the Share button in Safari', 'Tap "Add to Home Screen"', 'Tap "Add" to confirm']
const { isInstalled, isIOS, isInstallable, isCheckingInstallSupport, promptInstall } = usePWA() // eagerly registers beforeinstallprompt listener at app startup
</script>

<template>
  <section class="space-y-2">
    <h2 class="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">App</h2>

    <InstallStatusCard v-if="isInstalled" :icon="CheckCircle" heading="Already installed on your device." />

    <InstallStatusCard v-else-if="isInstallable" :icon="Download" heading="Installable">
      <p class="text-sm text-muted-foreground">
        Install this app on your device to receive push notifications and use it like a native
        app.
      </p>
      <Button @click="promptInstall">Install</Button>
    </InstallStatusCard>

    <InstallStatusCard v-else-if="isIOS" :icon="Smartphone" heading="Add to home screen">
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
    </InstallStatusCard>

    <InstallStatusCard v-else-if="isCheckingInstallSupport" :icon="Spinner" heading="Checking install availability…" />

    <InstallStatusCard v-else :icon="Smartphone" heading="Not available">
      <p class="text-sm text-muted-foreground">
        Please use a supported browser to install this app. Supported browsers: Safari on iOS,
        or Chrome/Edge.
      </p>
    </InstallStatusCard>
  </section>
</template>
