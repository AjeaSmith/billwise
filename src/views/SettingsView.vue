<script setup lang="ts">
import { Share2, Plus, ArrowDownToLine, CircleCheck } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/composables/pwa/usePWA'

const { isInstallable, isInstalled, isIOS, promptInstall } = usePWA()
</script>

<template>
  <div class="py-4 space-y-4">
    <h1 class="text-lg font-semibold text-neutral-900">Settings</h1>
    <!-- Already installed -->
    <div
      v-if="isInstalled"
      class="flex items-center gap-3 bg-white rounded-xl px-4 py-4 border border-gray-200"
    >
      <CircleCheck class="w-5 h-5 text-green-500 shrink-0" />
      <div>
        <p class="text-sm font-semibold text-neutral-900">App installed</p>
        <p class="text-xs text-neutral-400 mt-0.5">You're using the installed version of Billwise</p>
      </div>
    </div>

    <!-- Android: native install prompt -->
    <div
      v-else-if="isInstallable"
      class="bg-white rounded-xl px-4 py-4 border border-gray-200 space-y-3"
    >
      <div>
        <p class="text-sm font-semibold text-neutral-900">Install Billwise</p>
        <p class="text-xs text-neutral-400 mt-0.5">Add to your home screen for the best experience</p>
      </div>
      <Button
        type="button"
        @click="promptInstall"
        class="w-full bg-[#534AB7] hover:bg-[#4339a8] text-white cursor-pointer"
      >
        Add to Home Screen
      </Button>
    </div>

    <!-- iOS: step-by-step instructions -->
    <div
      v-else-if="isIOS"
      class="bg-white rounded-xl px-4 py-4 border border-gray-200 space-y-4"
    >
      <div>
        <p class="text-sm font-semibold text-neutral-900">Install Billwise</p>
        <p class="text-xs text-neutral-400 mt-0.5">Add to your home screen to enable push notifications</p>
      </div>

      <ol class="space-y-3">
        <li class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
          <div class="flex items-center gap-2">
            <Share2 class="w-4 h-4 text-[#534AB7] shrink-0" />
            <span class="text-sm text-neutral-700">Tap the <strong>Share</strong> button in Safari's toolbar</span>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
          <div class="flex items-center gap-2">
            <ArrowDownToLine class="w-4 h-4 text-[#534AB7] shrink-0" />
            <span class="text-sm text-neutral-700">Scroll down and tap <strong>Add to Home Screen</strong></span>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
          <div class="flex items-center gap-2">
            <Plus class="w-4 h-4 text-[#534AB7] shrink-0" />
            <span class="text-sm text-neutral-700">Tap <strong>Add</strong> to confirm</span>
          </div>
        </li>
      </ol>

      <p class="text-xs text-neutral-400 pt-1">
        Make sure you're using <strong>Safari</strong> — this option is not available in Chrome for iOS.
      </p>
    </div>
  </div>
</template>
