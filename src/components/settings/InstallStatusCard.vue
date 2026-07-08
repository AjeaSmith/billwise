<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  icon: Component
  heading: string
}>()
</script>

<template>
  <Card class="p-5">
    <CardContent class="flex flex-col gap-4 p-0">
      <div class="flex items-center gap-2">
        <component :is="icon" class="size-5" />
        <h3 class="text-base font-semibold">{{ heading }}</h3>
      </div>
      <slot />
    </CardContent>
  </Card>
</template>
