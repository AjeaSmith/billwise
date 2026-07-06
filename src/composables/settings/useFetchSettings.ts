import { useQuery } from '@tanstack/vue-query'
import supabase from '@/lib/supabase'
import type { Settings } from '@/types'
import { useAuth } from '../auth/useAuth'

export function useFetchSettings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.value?.id)
        .single()
      if (error) throw error

      return data as Settings
    },
    staleTime: 1000 * 60 * 5,
    enabled: () => !!user.value?.id,
  })
}
