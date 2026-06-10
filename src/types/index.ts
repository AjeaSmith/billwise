export interface Bill {
  id?: string
  name: string
  amount?: number
  due_day?: number
  next_due_date?: string
  is_paid?: boolean
  recurrence?: string
  user_id?: string
  created_at?: string
}
