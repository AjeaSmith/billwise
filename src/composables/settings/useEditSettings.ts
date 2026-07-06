import { useMutation, useQueryClient } from '@tanstack/vue-query'
import supabase from '@/lib/supabase'
import type { EditSettings } from '@/types'
import { useAuth } from '../auth/useAuth'

export function useEditSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ updatedSettings }: { updatedSettings: EditSettings }) => {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updatedSettings)
        .eq('user_id', user?.value?.id)
        .select()
        .single()

      if (error) {
        throw error
      }
      return data
    },
    onSuccess: (data) => {
      // queryClient.setQueryData(
      //   ['bills', data.user_id],
      //   (old: Bill[] | undefined) => old?.map((b) => (b.id === data.id ? data : b)) ?? [data],
      // )
      queryClient.invalidateQueries({ queryKey: ['user_settings', data.user_id] })
    },
  })
}
