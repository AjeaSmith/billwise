import { useQuery } from '@tanstack/vue-query'
import supabase from '@/lib/supabase'
import { useAuth } from '../auth/useAuth'
import type { Bill } from '@/types'

export function useFetchBills() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['bills', () => user.value?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.value?.id)
        .order('next_due_date', { ascending: true })

      if (error) {
        throw error
      }
      return data as Bill[]
    },
    staleTime: 1000 * 60 * 5,
    enabled: () => !!user.value?.id,
  })
}
