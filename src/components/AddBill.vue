<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useForm, Field as VeeField } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { type DateValue } from '@internationalized/date'
import { Calendar } from '@/components/ui/calendar'
import { computed, ref, type Ref } from 'vue'
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './ui/input-group'
import { Separator } from './ui/separator'
import { CalendarIcon } from '@lucide/vue'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { useNow } from '@vueuse/core'

import { useAddBill } from '@/composables/bills/useAddBill'
import { Spinner } from './ui/spinner'

const now = useNow()
const emit = defineEmits<{ success: [] }>()
const formSchema = z.object({
  name: z.string().min(1, 'Field is required.').max(32, 'name must be at most 32 characters.'),

  amount: z.coerce.number(),
  recurrence: z.enum(['weekly', 'monthly', 'yearly']),
})
const defaultDate = ref<DateValue | null>(null) as Ref<DateValue>

const { handleSubmit, meta, resetForm } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    name: '',
    amount: 0,
    recurrence: 'monthly',
  },
})
const { isPending, isError, error, mutate } = useAddBill()

const calculateNextDueDate = computed(() => (dueDay: number) => {
  const today = new Date(now.value)
  today.setHours(0, 0, 0, 0)
  const year = today.getFullYear()
  const month = today.getMonth()

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
  const clampedDay = Math.min(dueDay, lastDayOfMonth)
  const clamped = new Date(year, month, clampedDay)

  if (clamped < today) {
    const nextMonth = month + 1
    const lastDayOfNext = new Date(year, nextMonth + 1, 0).getDate()
    return new Date(year, nextMonth, Math.min(dueDay, lastDayOfNext))
  }

  return clamped
})

const onSubmit = handleSubmit(({ name, amount, recurrence }) => {
  if (!defaultDate.value) {
    return toast.error('Please select a due date.')
  }
  const nextDueDate = calculateNextDueDate.value(defaultDate.value.day)

  mutate(
    {
      name,
      amount,
      due_day: defaultDate.value.day,
      recurrence,
      next_due_date: nextDueDate.toISOString(),
    },
    {
      onSuccess: () => {
        toast.success('Bill added successfully!')
        emit('success')
        resetForm()
        // defaultDate.value = null
      },
    },
  )
  // console.log('submitting', { name, amount, recurrence, defaultDate: defaultDate.value.day })
})
</script>

<template>
  <section class="overflow-y-auto px-5">
    <form @submit="onSubmit" class="text-neutral-800 space-y-5">
      <p v-if="isError" class="text-red-500 font-semibold">{{ error?.message }}</p>
      <FieldGroup class="flex flex-col gap-4">
        <VeeField v-slot="{ field, errors }" name="name">
          <Field :data-invalid="!!errors.length" class="flex flex-col gap-1">
            <FieldLabel for="name"> NAME </FieldLabel>
            <Input
              id="name"
              v-bind="field"
              placeholder="e.g. Rent, Netflix"
              autocomplete="off"
              :aria-invalid="!!errors.length"
            />
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>
        <VeeField v-slot="{ field, errors }" name="amount">
          <Field :data-invalid="!!errors.length" class="flex flex-col gap-1">
            <FieldLabel for="amount"
              >AMOUNT <small class="text-gray-400">(optional)</small></FieldLabel
            >
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="amount"
                v-bind="field"
                placeholder="0.00"
                type="number"
                autocomplete="off"
              />
            </InputGroup>
            <FieldDescription class="text-gray-400">
              Leave blank for bills that don't have a fixed amount.
            </FieldDescription>

            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>

        <div class="grid w-full items-center gap-1.5">
          <FieldLabel for="dueDate">DUE DATE</FieldLabel>
          <div class="border border-[#534AB7] shadow-sm rounded-md" id="dueDate">
            <p class="flex justify-between p-3">
              <span class="text-gray-400">Select a day</span>
              <CalendarIcon class="text-[#534AB7] size-5" />
            </p>
            <Separator />
            <Calendar calendarLabel="Select a due date" v-model="defaultDate" />
          </div>
        </div>
        <VeeField v-slot="{ field, errors }" name="recurrence">
          <Field :data-invalid="!!errors.length" class="flex flex-col gap-1">
            <FieldLabel for="recurrence">RECURRENCE</FieldLabel>

            <ToggleGroup
              type="single"
              :model-value="field.value"
              @update:model-value="field.onChange"
              id="recurrence"
              class="flex gap-2"
            >
              <ToggleGroupItem value="weekly" aria-label="weekly"> Weekly </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="monthly"> Monthly </ToggleGroupItem>
              <ToggleGroupItem value="yearly" aria-label="yearly"> Yearly </ToggleGroupItem>
            </ToggleGroup>

            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>
      </FieldGroup>
      <Button
        class="w-full mb-3 py-6"
        type="submit"
        :disabled="!meta.dirty || !defaultDate || isPending"
      >
        <span v-if="isPending" class="flex gap-2 items-center justify-center">
          <Spinner class="size-5" />
          Adding...
        </span>
        <span v-else>Add Bill</span>
      </Button>
    </form>
  </section>
</template>
