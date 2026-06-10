import { daysUntil } from '@/lib/utils'
import type { Bill } from '@/types'
import { computed, type Ref } from 'vue'

export function useBillsSummary(bills?: Ref<Bill[], Bill[]> | Ref<undefined, undefined>) {
  const groupedBills = computed(() => {
    if (!bills?.value) return {}

    const grouped = Object.groupBy(bills?.value, ({ next_due_date, is_paid }) => {
      const daysLeft = daysUntil(next_due_date!)
      if (daysLeft < 0 && !is_paid) return 'Overdue'
      if (daysLeft <= 7 && !is_paid) return 'Due Soon'
      if (daysLeft > 7 && !is_paid) return 'Upcoming'
      if (is_paid) return 'Paid'
      return 'Unknown'
    })

    // 2. Define the exact layout order (Paid at the bottom)
    const order = ['Overdue', 'Due Soon', 'Upcoming', 'Paid']

    // 3. Return a new object sorted by that layout order
    return Object.fromEntries(
      Object.entries(grouped).sort(([keyA], [keyB]) => {
        return order.indexOf(keyA) - order.indexOf(keyB)
      }),
    )
  })

  const todaysDate = computed(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  )

  return { groupedBills, todaysDate }
}
