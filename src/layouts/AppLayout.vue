<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Home, Settings, Plus } from '@lucide/vue'
import { Button } from '@/components/ui/button'

const route = useRoute()
</script>

<template>
  <div class="flex flex-col min-h-screen bg-neutral-100">
    <header
      class="fixed top-0 left-0 right-0 z-20 h-14 bg-white flex items-center justify-between px-4 shadow-sm"
    >
      <div>
        <span class="text-[#534AB7] font-normal text-xl">Bill</span>
        <span class="text-[#534AB7] font-bold text-xl">wise</span>
      </div>

      <div class="flex items-center gap-3">
        <div class="border-2 border-[#534AB7] size-8 flex items-center justify-center rounded-full">
          S
        </div>
        <Button variant="secondary" class="cursor-pointer hover:bg-gray-200">Log out</Button>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto pt-14 pb-28 px-4">
      <RouterView />
    </main>

    <button
      class="fixed z-30 bottom-20 right-5 size-13 flex items-center justify-center rounded-full bg-[#534AB7] text-white shadow-lg"
      @click="console.log('open add bill sheet')"
      aria-label="Add new bill"
    >
      <Plus :size="24" />
    </button>

    <nav
      class="fixed bottom-0 left-0 right-0 z-20 h-14 bg-white border-t border-neutral-200 pb-safe flex"
    >
      <RouterLink
        to="/app/bills"
        class="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-11"
        :class="route.path === '/app/bills' ? 'text-[#534AB7]' : 'text-neutral-400'"
      >
        <Home :size="22" />
        <span class="text-xs">Bills</span>
      </RouterLink>
      <RouterLink
        to="/app/settings"
        class="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-11"
        :class="route.path === '/app/settings' ? 'text-[#534AB7]' : 'text-neutral-400'"
      >
        <Settings :size="22" />
        <span class="text-xs">Settings</span>
      </RouterLink>
    </nav>
  </div>
</template>
