<script setup lang="ts">
import { ref } from 'vue'

import EmptyView from './EmptyView.vue'
import BillCard from '@/components/BillCard.vue'
import { Spinner } from '../components/ui/spinner'
import type { Bill } from '@/types'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

import { useFetchBills } from '@/composables/bills/useFetchBills.ts'
import { useBillsSummary } from '@/composables/bills/useBillsSummary.ts'
import { Plus, X } from '@lucide/vue'
import AddBill from '@/components/AddBill.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import { Button } from '@/components/ui/button'

const { data, isPending, error } = useFetchBills()
const { groupedBills, todaysDate } = useBillsSummary(data)

const open = ref(false)
const selectedBill = ref<Bill | null>(null)

function openDrawer(bill: Bill) {
  open.value = true
  selectedBill.value = bill
}
</script>

<template>
  <div v-if="error" class="flex items-center justify-center py-55">
    <p class="text-red-500">
      There was an error loading your bills, please try again later: {{ error }}
    </p>
  </div>
  <section v-else>
    <div v-if="isPending" class="flex items-center justify-center py-55">
      <Spinner class="size-8 text-[#534AB7]" />
    </div>
    <EmptyView v-else-if="data?.length === 0" />
    <div v-else class="flex flex-col gap-2 px-4 py-4">
      <h2 class="text-lg mb-2 font-semibold text-neutral-900 uppercase">
        {{ todaysDate }}
      </h2>
      <div v-for="(bills, group) in groupedBills" :key="group">
        <h2 class="text-xs font-semibold text-gray-400 mb-2 uppercase">{{ group }}</h2>
        <BillCard
          v-for="bill in bills"
          :key="bill.id"
          :bill="bill"
          class="mb-3 cursor-pointer"
          @edit="openDrawer"
        />
      </div>
      <button
        class="cursor-pointer fixed z-30 bottom-20 right-5 size-13 flex items-center justify-center rounded-full bg-[#534AB7] text-white shadow-lg"
        @click="open = true"
      >
        <Plus :size="24" />
      </button>
      <Drawer v-model:open="open">
        <DrawerContent>
          <DrawerHeader class="flex flex-row items-center justify-between">
            <DrawerTitle class="text-xl">Add a Bill</DrawerTitle>
            <Button variant="outline" @click="open = false" class="size-10.5 border-2 shadow-none">
              <X :size="20" />
            </Button>
          </DrawerHeader>
          <Separator class="mb-3" />
          <AddBill @success="open = false" />
        </DrawerContent>
      </Drawer>
    </div>
  </section>
</template>
