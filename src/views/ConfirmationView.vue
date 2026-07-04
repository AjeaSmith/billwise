<script setup lang="ts">
import { Mail } from '@lucide/vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import supabase from '@/lib/supabase'
import router from '@/router'

const route = useRoute()
const email = route.query.email as string

const loading = ref(false)
const resent = ref(false)

const resendEmail = async () => {
  if (!email || loading.value) return
  loading.value = true
  resent.value = false
  await supabase.auth.signInWithOtp({ email })
  loading.value = false
  resent.value = true
}
onMounted(async () => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      router.push({ name: 'bills' })
    }
  })
  onUnmounted(() => {
    subscription?.unsubscribe()
  })
})
</script>

<template>
  <section class="min-h-screen bg-gray-50 px-6 pt-24">
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 w-14 h-14 rounded-full bg-[#EEE9FF] flex items-center justify-center">
        <Mail class="w-6 h-6 text-[#534AB7]" />
      </div>

      <h1 class="text-2xl font-bold text-gray-900 mb-3">Check your inbox</h1>

      <p class="text-gray-600 text-sm leading-relaxed mb-8">
        We sent a sign-in link to <span class="font-semibold text-gray-900">{{ email }}</span
        >. Tap the link to sign in — it expires in 10 minutes.
      </p>

      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-400">Didn't get it?</span>
        <button
          type="button"
          :disabled="loading"
          class="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          @click="resendEmail"
        >
          {{ loading ? 'Sending…' : resent ? 'Sent!' : 'Resend email' }}
        </button>
      </div>
    </div>
  </section>
</template>
