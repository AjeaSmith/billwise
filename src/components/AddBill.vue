<script setup lang="ts">
import { z } from 'zod'
import { useForm, type AnyFieldApi } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { fromDate, getLocalTimeZone, type DateValue } from '@internationalized/date'
import { Calendar } from '@/components/ui/calendar'
import { ref, type Ref } from 'vue'
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'

import { Separator } from './ui/separator'
import { CalendarIcon } from '@lucide/vue'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

import { useAddBill } from '@/composables/bills/useAddBill'
import { Spinner } from './ui/spinner'
import { useBills } from '@/composables/bills/useBills'
import type { Recurrence } from '@/types'
import { dateFormatter } from '@/lib/utils'

const emit = defineEmits<{ success: [] }>()

// ─── Constants ───────────────────────────────────────────────────────────────
const recurrenceOptions: { value: Recurrence; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

// ─── Schema ───────────────────────────────────────────────────────────────
const formSchema = z.object({
  name: z.string().min(1, 'Field is required.').max(32, 'name must be at most 32 characters.'),

  amount: z.coerce.number(),
  recurrence: z.enum(['monthly', 'yearly'], { message: 'Select a recurrence.' }),
})

// ─── Form ───────────────────────────────────────────────────────────────
const date = ref(fromDate(new Date(), getLocalTimeZone())) as Ref<DateValue>

const { calculateNextMonth, calculateNextYear } = useBills()
const { isPending, isError, error, mutate } = useAddBill()

const form = useForm({
  defaultValues: {
    name: '',
    amount: 0,
    recurrence: 'monthly',
  },
  validators: {
    onSubmit: formSchema,
  },
  onSubmit: ({ value: { name, amount, recurrence } }) => {
    if (!date.value) {
      return toast.error('Please select a due date.')
    }
    const dateStr = dateFormatter(date)
    mutate(
      {
        name,
        amount,
        due_date: dateStr,
        recurrence,
        next_due_date:
          recurrence === 'monthly'
            ? calculateNextMonth.value(date.value!.day).toISOString()
            : calculateNextYear.value(dateStr),
      },
      {
        onSuccess: () => {
          toast.success('Bill added successfully!')
          emit('success')
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  },
})
function isInvalid(field: AnyFieldApi): boolean {
  return field.state.meta.isTouched && !field.state.meta.isValid
}
</script>

<template>
  <section class="overflow-y-auto px-5">
    <form @submit.prevent="form.handleSubmit" class="text-neutral-800 space-y-5">
      <p v-if="isError" class="text-red-500 font-semibold">{{ error?.message }}</p>
      <FieldGroup class="flex flex-col gap-4">
        <form.Field v-slot="{ field }" name="name">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name">Name</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :aria-invalid="isInvalid(field)"
              placeholder="e.g. Netflix"
              autocomplete="off"
              @blur="field.handleBlur"
              @input="field.handleChange(($event.target as HTMLInputElement).value)"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <form.Field v-slot="{ field }" name="amount">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name"
              >Amount <small class="text-gray-400">(optional)</small></FieldLabel
            >
            <div class="relative">
              <span
                class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm select-none"
              >
                $
              </span>
              <Input
                :id="field.name"
                :name="field.name"
                type="number"
                placeholder="0.00"
                class="pl-7"
                :model-value="field.state.value"
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @change="field.handleChange(parseFloat(($event.target as HTMLInputElement).value))"
              />
            </div>
            <FieldDescription class="text-gray-400">
              Leave blank for bills that don't have a fixed amount.
            </FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <div>
          <FieldLabel for="dueDate" class="mb-3">Due date</FieldLabel>
          <div class="border border-[#534AB7] shadow-sm rounded-md">
            <p class="flex justify-between p-3">
              <span class="text-gray-400">Select a day</span>
              <CalendarIcon id="dueDate" class="text-[#534AB7] size-5" />
            </p>
            <Separator />
            <Calendar v-model="date" :default-placeholder="date" />
          </div>
        </div>

        <form.Field v-slot="{ field }" name="recurrence">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel>Recurrence</FieldLabel>
            <ToggleGroup
              type="single"
              class="space-x-3"
              :model-value="field.state.value"
              @update:model-value="
                (v) => {
                  if (v) field.handleChange(v as Recurrence)
                }
              "
              @blur="field.handleBlur"
            >
              <ToggleGroupItem
                v-for="option in recurrenceOptions"
                :key="option.value"
                :value="option.value"
                :aria-label="option.label"
              >
                {{ option.label }}
              </ToggleGroupItem>
            </ToggleGroup>
            <FieldDescription>How often this bill repeats.</FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
      </FieldGroup>
      <Button class="w-full mb-3 py-6" type="submit" :disabled="!date || isPending">
        <span v-if="isPending" class="flex gap-2 items-center justify-center">
          <Spinner class="size-5" />
          Adding...
        </span>
        <span v-else>Add Bill</span>
      </Button>
    </form>
  </section>
</template>
