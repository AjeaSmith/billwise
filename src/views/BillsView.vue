<script setup lang="ts">
import { ref } from 'vue'

import EmptyView from './EmptyView.vue'
import BillCard from '@/components/BillCard.vue'
import { Spinner } from '../components/ui/spinner'
import type { Bill } from '@/types'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useFetchBills } from '@/composables/bills/useFetchBills.ts'
import { useBills } from '@/composables/bills/useBills.ts'
import { Plus, X } from '@lucide/vue'
import AddBill from '@/components/AddBill.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import { Button } from '@/components/ui/button'
import EditBill from '@/components/EditBill.vue'
import { useDeleteBill } from '@/composables/bills/useDeleteBill.ts'
import { toast } from 'vue-sonner'

const { data, isPending, error } = useFetchBills()
const { mutate, isPending: isDeleting } = useDeleteBill()
const { groupedBills, todaysDate } = useBills(data)

const open = ref(false)
const openConfirm = ref(false)
const selectedBill = ref<Bill | null>(null)

function openEditDrawer(bill: Bill) {
  open.value = true
  selectedBill.value = bill
}
function openAddBillDrawer() {
  open.value = true
  selectedBill.value = null
}
function openDeleteDialog(bill: Bill) {
  selectedBill.value = bill
  openConfirm.value = true
}
function handleDelete() {
  mutate(
    { id: selectedBill.value!.id },
    {
      onSuccess: () => {
        openConfirm.value = false
        open.value = false
        toast.success('Bill deleted successfully!')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    },
  )
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
          @edit="openEditDrawer(bill)"
        />
      </div>
      <button
        class="cursor-pointer fixed z-30 bottom-20 right-5 size-13 flex items-center justify-center rounded-full bg-[#534AB7] text-white shadow-lg"
        @click="openAddBillDrawer"
      >
        <Plus :size="24" />
      </button>
      <Drawer v-model:open="open">
        <DrawerContent>
          <DrawerHeader class="flex flex-row items-center justify-between">
            <DrawerTitle class="text-xl">{{ selectedBill ? 'Edit Bill' : 'Add Bill' }}</DrawerTitle>
            <Button variant="outline" @click="open = false" class="size-10.5 border-2 shadow-none">
              <X :size="20" />
            </Button>
          </DrawerHeader>
          <Separator class="mb-3" />
          <EditBill
            v-if="selectedBill"
            :bill="selectedBill"
            @success="open = false"
            @open-delete-dialog="openDeleteDialog"
          />
          <AddBill v-else @success="open = false" />
        </DrawerContent>
      </Drawer>
      <AlertDialog v-model:open="openConfirm">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="handleDelete">
              <span v-if="isDeleting" class="flex gap-2 items-center justify-center">
                <Spinner class="size-5" />
                Deleting...
              </span>
              <span v-else>Delete </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </section>
</template>
