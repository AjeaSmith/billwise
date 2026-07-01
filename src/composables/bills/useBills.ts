import { daysUntil } from '@/lib/utils'
import type { Bill } from '@/types'
import { useNow } from '@vueuse/core'
import { computed, type Ref } from 'vue'

export function useBills(bills?: Ref<Bill[], Bill[]> | Ref<undefined, undefined>) {
  const now = useNow()
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

  const calculateNextMonth = computed(() => (dueDay: number) => {
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
  const calculateNextYear = computed(() => (dateStr: string) => {
    const [, m, d] = dateStr.split('-').map(Number)
    const today = new Date(now.value)
    today.setHours(0, 0, 0, 0)
    const currentYear = today.getFullYear()

    const lastDayThisYear = new Date(currentYear, m!, 0).getDate()
    const clampedDayThisYear = Math.min(d!, lastDayThisYear)
    const thisYearDate = new Date(currentYear, m! - 1, clampedDayThisYear)

    if (thisYearDate < today) {
      const nextYear = currentYear + 1
      const lastDayNextYear = new Date(nextYear, m!, 0).getDate()
      return `${nextYear}-${String(m).padStart(2, '0')}-${String(Math.min(d!, lastDayNextYear)).padStart(2, '0')}`
    }

    return `${currentYear}-${String(m).padStart(2, '0')}-${String(clampedDayThisYear).padStart(2, '0')}`
  })

  return { groupedBills, todaysDate, calculateNextMonth, calculateNextYear }
}
