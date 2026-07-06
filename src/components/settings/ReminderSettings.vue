<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useSettings } from '@/composables/settings/useSettings'

const reminderOptions = [
  { value: '7', label: '7 days before' },
  { value: '3', label: '3 days before' },
  { value: '0', label: 'Day of' },
]
const { reminder_day } = useSettings()

</script>

<template>
  <section class="space-y-2">
    <h2 class="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      Remind me
    </h2>
    <Card class="gap-0 overflow-hidden p-0">
      <CardContent class="p-0">
        <RadioGroup v-model="reminder_day" class="gap-0 divide-y divide-border">
          <label
            v-for="option in reminderOptions"
            :key="option.value"
            :for="option.value"
            class="flex cursor-pointer items-center justify-between p-4"
          >
            <span class="text-sm font-medium">{{ option.label }}</span>
            <RadioGroupItem :id="option.value" :value="option.value" />
          </label>
        </RadioGroup>
      </CardContent>
    </Card>
    <p class="px-1 text-xs text-muted-foreground">Reminders only send for unpaid bills.</p>
  </section>
</template>
