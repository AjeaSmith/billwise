<script setup lang="ts">
import { Bell, Clock, Globe } from '@lucide/vue'

import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useSettings } from '@/composables/settings/useSettings'
import Input from '../ui/input/Input.vue'
defineProps<{
  timezone: string
}>()
const { push_enabled, send_hour } = useSettings()
</script>

<template>
  <section class="space-y-2">
    <h2 class="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      Notifications
    </h2>
    <Card class="gap-0 overflow-hidden p-0">
      <CardContent class="divide-y divide-border p-0">
        <div class="flex items-center gap-3 p-4">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
          >
            <Bell class="size-4" />
          </div>
          <div class="flex-1">
            <p class="text-sm leading-none font-medium">Push notifications</p>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ push_enabled ? 'Enabled' : 'Disabled' }}
            </p>
          </div>
          <Switch v-model="push_enabled" />
        </div>

        <div class="flex cursor-pointer items-center gap-3 p-4">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          >
            <Clock class="size-4" />
          </div>
          <div class="flex-1">
            <p class="text-sm leading-none font-medium">Send time</p>
            <p class="mt-1 text-sm text-muted-foreground">Minutes are ignored — set the hour</p>
          </div>
          <Input v-model="send_hour" type="time" class="w-32 text-muted-foreground" />
        </div>
        <div class="flex cursor-pointer items-center gap-3 p-4">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
          >
            <Globe class="size-4" />
          </div>
          <div class="flex-1">
            <p class="text-sm leading-none font-medium">Timezone</p>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ timezone }}
            </p>
          </div>
          <p class="text-sm text-violet-800 bg-violet-100 px-2.5 py-0.5 rounded-full">Auto</p>
        </div>
      </CardContent>
    </Card>
    <p class="px-1 text-xs text-muted-foreground">Timezone detected from your device.</p>
  </section>
</template>
