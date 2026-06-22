import { useMutation, useQueryClient } from '@tanstack/vue-query'
import supabase from '@/lib/supabase'
import type { Bill, EditBill } from '@/types'

export function useEditBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updatedBill }: { id: string; updatedBill: EditBill }) => {
      const { data, error } = await supabase
        .from('bills')
        .update(updatedBill)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }
      return data
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
