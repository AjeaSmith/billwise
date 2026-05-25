<template>
  <div class="flex flex-col items-center justify-center gap-6 py-20 px-6 text-center">
    <!-- Illustration -->
    <div class="relative w-52 h-52">
      <!-- Circle background -->
      <div class="absolute inset-0 rounded-full bg-[#E8E6F8]"></div>

      <!-- Back card (rotated) -->
      <div
        class="absolute top-8 left-10 w-28 h-36 bg-white rounded-2xl shadow-sm"
        style="transform: rotate(-8deg)"
      >
        <div class="p-4 flex flex-col gap-2.5 mt-2">
          <div class="w-8 h-8 rounded-full bg-[#C5C1E8] mx-auto"></div>
          <div class="w-full h-2.5 rounded-full bg-[#C5C1E8]"></div>
          <div class="w-4/5 h-2.5 rounded-full bg-[#C5C1E8]"></div>
          <div class="w-3/5 h-2.5 rounded-full bg-[#C5C1E8]"></div>
        </div>
      </div>

      <!-- Front card -->
      <div class="absolute top-5 left-14 w-28 h-36 bg-white rounded-2xl shadow-md">
        <div class="p-4 flex flex-col gap-2.5 mt-2">
          <div class="w-8 h-8 rounded-full bg-[#C5C1E8] mx-auto"></div>
          <div class="w-full h-2.5 rounded-full bg-[#C5C1E8]"></div>
          <div class="w-4/5 h-2.5 rounded-full bg-[#C5C1E8]"></div>
          <div class="w-3/5 h-2.5 rounded-full bg-[#C5C1E8]"></div>
        </div>
      </div>

      <!-- Plus badge -->
      <div
        class="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-[#534AB7] flex items-center justify-center shadow-md z-10"
      >
        <span class="text-white text-2xl leading-none font-light">+</span>
      </div>
    </div>

    <!-- Text -->
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-bold text-neutral-900">No bills yet</h2>
      <p class="text-sm text-neutral-500 leading-relaxed max-w-xs">
        Add your first bill and we'll remind you before it's due.
      </p>
    </div>
  </div>
</template>
