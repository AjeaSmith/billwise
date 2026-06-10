<script lang="ts" setup>
import type { CalendarCellTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { CalendarCellTrigger, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const props = withDefaults(
  defineProps<CalendarCellTriggerProps & { class?: HTMLAttributes['class'] }>(),
  {
    as: 'button',
  },
)

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarCellTrigger
    data-slot="calendar-cell-trigger"
    :class="
      cn(
        buttonVariants({ variant: 'ghost' }),
        'size-8 p-0 font-normal aria-selected:opacity-100 cursor-default',
        '[&[data-today]:not([data-selected])]:bg-none [&[data-today]:not([data-selected])]:text-[#685ce6]',
        '[&[data-today]:not([data-selected])]:font-semibold',
        // Selected
        'data-selected:bg-[#534AB7] data-selected:text-primary-foreground data-selected:opacity-100 [&[data-selected]:hover]:bg-[#534AB7] data-selected:hover:text-primary-foreground data-selected:focus:bg-[#534AB7] data-selected:focus:text-primary-foreground',
        // Disabled
        'data-disabled:text-muted-foreground data-disabled:opacity-50',
        // Unavailable
        'data-unavailable:text-destructive-foreground data-unavailable:line-through',
        // Outside months
        'data-outside-view:text-muted-foreground',
        props.class,
      )
    "
    type="button"
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarCellTrigger>
</template>
