<script setup lang="ts">
import { Smartphone } from '@lucide/vue'
import { Card, CardContent } from '@/components/ui/card'

const steps = ['Tap the Share button in Safari', 'Tap "Add to Home Screen"', 'Tap "Add" to confirm']
</script>

<template>
  <section class="space-y-2">
    <h2 class="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">App</h2>
    <Card class="p-5">
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
  </section>
</template>
