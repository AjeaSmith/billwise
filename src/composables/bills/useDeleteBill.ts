import { useMutation, useQueryClient } from '@tanstack/vue-query'
import supabase from '@/lib/supabase'
import type { Bill } from '@/types'

export function useDeleteBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data, error } = await supabase.from('bills').delete().eq('id', id).select().single()

      if (error) {
        throw error
      }
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['bills', data.user_id],
        (old: Bill[] | undefined) => old?.filter((b) => b.id !== data.id) ?? [],
      )
      queryClient.invalidateQueries({ queryKey: ['bills', data.user_id] })
    },
  })
}
