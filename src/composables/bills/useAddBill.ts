import { useMutation, useQueryClient } from '@tanstack/vue-query'
import supabase from '@/lib/supabase'
import type { NewBill, Bill } from '@/types'
import { useAuth } from './useAuth'

export function useAddBill() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (newBill: NewBill) => {
      const { data, error } = await supabase
        .from('bills')
        .insert({ ...newBill, user_id: user.value?.id })
        .select()
        .single()

      if (error) {
        throw error
      }
      return data as Bill
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['bills', data.user_id],
        (old: Bill[] | undefined) => old?.map((b) => (b.id === data.id ? data : b)) ?? [data],
      )
      queryClient.invalidateQueries({ queryKey: ['bills', data.user_id] })
    },
  })
}
