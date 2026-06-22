export interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  next_due_date: string
  is_paid: boolean
  recurrence: string
  user_id: string
  created_at: string
}

export type EditBill = Omit<Bill, 'id' | 'user_id' | 'created_at' | 'is_paid'>
export type NewBill = Omit<Bill, 'id' | 'user_id' | 'created_at' | 'is_paid'>
export type Recurrence = 'monthly' | 'yearly'
