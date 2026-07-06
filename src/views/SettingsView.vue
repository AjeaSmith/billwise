<script setup lang="ts">
import InstallPrompt from '@/components/settings/InstallPrompt.vue'
import NotificationSettings from '@/components/settings/NotificationSettings.vue'
import ReminderSettings from '@/components/settings/ReminderSettings.vue'
import Button from '@/components/ui/button/Button.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { useEditSettings } from '@/composables/settings/useEditSettings'
import { useFetchSettings } from '@/composables/settings/useFetchSettings'
import { useSettings } from '@/composables/settings/useSettings'
import { watch } from 'vue'
import { toast } from 'vue-sonner'

const { data, isPending: isFetching, error, isError } = useFetchSettings() // Fetch settings on component mount
const { mutate, isPending: isEditing } = useEditSettings()
const { push_enabled, send_hour, reminder_day } = useSettings()

function saveSettings() {
  mutate(
    {
      updatedSettings: {
        push_enabled: push_enabled.value,
        send_hour: parseInt(send_hour.value.split(':')[0]!, 10),
        reminder_day: parseInt(reminder_day.value, 10),
      },
    },
    {
      onSuccess: () => {
        toast.success('Settings saved successfully!')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    },
  )
}

watch(
  data,
  (newSettings) => {
    if (newSettings) {
      push_enabled.value = newSettings.push_enabled
      send_hour.value = `${String(newSettings.send_hour).padStart(2, '0')}:00`
      reminder_day.value = String(newSettings.reminder_day)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col">
    <header class="px-4 py-4">
      <h1 class="text-2xl font-medium">Settings</h1>
    </header>
    <p v-if="isError" class="text-red-500 font-semibold">{{ error?.message }}</p>
    <Spinner v-if="isFetching" class="mx-auto my-20" />
    <div v-else class="flex flex-col gap-6 p-4 pb-safe">
      <NotificationSettings :timezone="data!.timezone" />
      <ReminderSettings />
      <Button :disabled="isEditing" @click="saveSettings">
        <span v-if="isEditing">Saving...</span>
        <span v-else>Save changes</span>
      </Button>
      <InstallPrompt />
    </div>
  </div>
</template>
