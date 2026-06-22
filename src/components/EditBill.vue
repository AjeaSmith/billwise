<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Bill, Recurrence } from '@/types'
import { Calendar } from './ui/calendar'
import { ref, type Ref } from 'vue'
import { useBills } from '@/composables/bills/useBills'
import { CalendarIcon } from '@lucide/vue'
import { Separator } from './ui/separator'
import { Spinner } from './ui/spinner'
import { useEditBill } from '@/composables/bills/useEditBill'
import { toast } from 'vue-sonner'

// ─── Props & Emits ───────────────────────────────────────────────────────────
const props = defineProps<{
  bill: Bill
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [values: Bill]
  success: []
}>()

// ─── Constants ───────────────────────────────────────────────────────────────

const recurrenceOptions: { value: Recurrence; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

// ─── Schema ──────────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100, 'Name must be under 100 characters.'),
  amount: z.coerce.number().multipleOf(0.01, 'Max 2 decimal places.'),
  recurrence: z.enum(['monthly', 'yearly'], { message: 'Select a recurrence.' }),
})

// ─── Form ────────────────────────────────────────────────────────────────────
const { mutate, isPending, isError, error } = useEditBill()
const { calculateNextMonth, calculateNextYear } = useBills()

function isoToCalendarDate(iso: string): CalendarDate {
  const [year, month, day] = iso.split('-').map(Number)
  return new CalendarDate(year!, month!, day!)
}

const dueDate = ref(isoToCalendarDate(props.bill.due_date)) as Ref<DateValue | undefined>

const form = useForm({
  defaultValues: {
    name: props.bill.name,
    amount: props.bill.amount,
    recurrence: props.bill.recurrence,
  },
  validators: {
    onSubmit: formSchema,
  },
  onSubmit: ({ value: { name, amount, recurrence } }) => {
    console.log(dueDate.value!.toString())
    mutate(
      {
        id: props.bill.id,
        updatedBill: {
          name,
          amount,
          due_date: dueDate.value!.toString().split('T')[0]!,
          recurrence,
          next_due_date:
            recurrence === 'monthly'
              ? calculateNextMonth.value(dueDate.value!.day).toISOString()
              : calculateNextYear.value(dueDate.value!.toString()),
        },
      },
      {
        onSuccess: () => {
          toast.success('Changes saved successfully!')
          emit('success')
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  },
})

function isInvalid(field: any): boolean {
  return field.state.meta.isTouched && !field.state.meta.isValid
}
</script>

<template>
  <section class="overflow-y-auto px-5">
    <p v-if="isError" class="text-red-500 font-semibold">{{ error?.message }}></p>
    <form @submit.prevent="form.handleSubmit">
      <FieldGroup>
        <!-- Name -->
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

        <!-- Amount -->
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
          <p class="mb-3 text-sm font-medium">Due date</p>
          <div class="border border-[#534AB7] shadow-sm rounded-md">
            <p class="flex justify-between p-3">
              <span class="text-gray-400">Select a day</span>
              <CalendarIcon class="text-[#534AB7] size-5" />
            </p>
            <Separator />
            <Calendar v-model="dueDate" :default-placeholder="dueDate" />
          </div>
        </div>
        <!-- Recurrence -->
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

      <!-- Actions -->
      <Field orientation="horizontal" class="my-4">
        <Button type="submit" :disabled="isPending" class="w-full">
          <span v-if="isPending" class="flex gap-2 items-center justify-center">
            <Spinner class="size-5" />
            Saving…
          </span>
          <span v-else>Save changes</span>
        </Button>
      </Field>
    </form>
  </section>
</template>
