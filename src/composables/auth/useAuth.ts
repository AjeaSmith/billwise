import { ref, shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import supabase from '@/lib/supabase'

interface UseAuth {
  user: ShallowRef<User | null>
  session: ShallowRef<Session | null>
  loading: Ref<boolean>
  signOut: () => Promise<void>
}

const user = shallowRef<User | null>(null)
const session = shallowRef<Session | null>(null)
const loading = ref(true)

supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) console.error(error)
    session.value = data.session
    user.value = data.session?.user ?? null
  })
  .catch((err) => console.error('getSession failed:', err))
  .finally(() => {
    loading.value = false
  })

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession
  user.value = newSession?.user ?? null
  loading.value = false
})

export function useAuth(): UseAuth {
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    session.value = null
  }

  return { user, session, loading, signOut }
}
