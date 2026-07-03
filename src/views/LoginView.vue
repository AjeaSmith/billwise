<script setup lang="ts">
import { Receipt } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { ref } from 'vue'
import supabase from '@/lib/supabase'
import router from '@/router'

const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
// TODO: Login redirects to localhost:5173/confirmation?email={{email}} but this will be different in production. Need to figure out how to do this dynamically.
const login = async () => {
  if (!email.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const { error } = await supabase.auth.signInWithOtp({ email: email.value })
    if (error) throw error
    router.push({ name: 'confirmation', query: { email: email.value } })
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="min-h-screen bg-gray-50 px-6 pt-16">
    <form class="mx-auto max-w-2xl" @submit.prevent="login">
      <div class="mb-4 w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
        <Receipt class="w-8 h-8 text-[#534AB7]" />
      </div>
      <h1 class="text-3xl font-bold mb-1">
        <span class="text-gray-900">Bill</span><span class="text-[#534AB7]">wise</span>
      </h1>
      <p class="text-gray-500 text-sm mb-8">Never miss a payment</p>
      <p v-if="errorMessage" class="text-red-500 text-sm mb-4">{{ errorMessage }}</p>

      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
      <input
        id="email"
        v-model="email"
        type="email"
        placeholder="you@example.com"
        class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent mb-4"
      />

      <Button
        :disabled="loading"
        type="submit"
        class="w-full bg-[#534AB7] hover:bg-[#4740a0] text-white rounded-xl py-3 text-base font-medium disabled:opacity-50"
      >
        <span v-if="loading">Sending magic link...</span>
        <span v-else>Send magic link</span>
      </Button>

      <div class="border-t border-gray-200 my-6" />

      <p class="text-center text-sm text-gray-400">
        We'll email you a link to sign in — no password needed.
      </p>
    </form>
  </section>
</template>
