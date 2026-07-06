import { ref } from 'vue'

const push_enabled = ref(true)
const send_hour = ref('09:00')
const reminder_day = ref('3')

export function useSettings() {
  return { push_enabled, send_hour, reminder_day }
}
