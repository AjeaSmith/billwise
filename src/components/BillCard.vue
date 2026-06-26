<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { CheckIcon } from '@lucide/vue'
import type { Bill } from '@/types'
import { daysUntil } from '@/lib/utils'
import { usePointerSwipe } from '@vueuse/core'

const props = defineProps<{ bill: Bill }>()
const emit = defineEmits(['edit', 'open-delete-dialog'])

const wasSwipedLeft = ref(false)
const el = useTemplateRef('el')

const { distanceX, isSwiping } = usePointerSwipe(el, {
  onSwipe() {
    wasSwipedLeft.value = distanceX.value > 5
  },
  onSwipeEnd() {
    setTimeout(() => {
      wasSwipedLeft.value = false
      emit('open-delete-dialog', props.bill)
    }, 300)
  },
})

const cardOffSet = computed(() =>
  isSwiping.value ? Math.min(Math.max(distanceX.value, 0), 80) : 0,
)
function openEditDrawer() {
  if (wasSwipedLeft.value) return
  else emit('edit', props.bill)
}
const borderClass = computed(() => {
  if (props.bill.is_paid) return 'rounded-xl border-l-transparent'
  if (!props.bill.next_due_date) return 'border-l-transparent'
  const days = daysUntil(props.bill.next_due_date)
  if (days <= 0) return 'border-l-4 border-l-red-500'
  if (days <= 7) return 'border-l-4 border-l-amber-500'
  return 'rounded-xl'
})

const dueDateClass = computed(() => {
  if (props.bill.is_paid) return 'text-gray-400'
  if (!props.bill.next_due_date) return 'text-gray-400'
  const days = daysUntil(props.bill.next_due_date)
  if (days <= 0) return 'text-red-500'
  if (days <= 7) return 'text-amber-500'
  return 'text-gray-400'
})

const dueDateText = computed(() => {
  if (!props.bill.next_due_date) return '—'
  const days = daysUntil(props.bill.next_due_date)
  if (days === 0) return 'Today'
  if (days > 0 && days <= 7) return `In ${days} day${days === 1 ? '' : 's'}`
  const [y, m, d] = props.bill.next_due_date.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

const amountText = computed(() =>
  props.bill.amount === 0 ? '—' : `$${Number(props.bill.amount).toLocaleString()}`,
)
</script>

<template>
  <div ref="el" class="relative overflow-hidden">
    <button class="absolute right-0 top-4 bg-red-500 text-white p-2">DELETE</button>
    <div
      :style="{ transform: `translateX(-${cardOffSet}px)` }"
      @click="openEditDrawer"
      :class="[
        'flex items-center gap-3 bg-white rounded-r-xl px-4 py-4 border border-gray-200',
        borderClass,
        bill.is_paid ? 'opacity-50' : '',
      ]"
    >
      <div
        :class="['w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-100']"
      >
        {{ bill.name.charAt(0).toUpperCase() }}
      </div>

      <div class="flex-1 min-w-0">
        <p
          class="font-semibold text-sm truncate"
          :class="bill.is_paid ? 'text-gray-400' : 'text-neutral-900'"
        >
          {{ bill.name }}
        </p>
        <p class="text-xs text-neutral-400 mt-0.5">
          {{ bill.recurrence ?? 'Monthly' }}
        </p>
      </div>

      <div class="text-right shrink-0">
        <p
          class="font-semibold text-sm"
          :class="bill.is_paid ? 'text-gray-400' : 'text-neutral-900'"
        >
          {{ amountText }}
        </p>
        <div class="flex items-center justify-end gap-1 mt-0.5">
          <span :class="['text-xs', dueDateClass]">{{ bill.is_paid ? 'Paid' : dueDateText }}</span>
          <CheckIcon v-if="bill.is_paid" class="w-3.5 h-3.5 text-green-500" />
        </div>
      </div>
    </div>
  </div>
</template>
