import { useOneSignal } from '@onesignal/onesignal-vue3'
import { computed, ref } from 'vue'

const oneSignal = useOneSignal()
const permissionState = ref(oneSignal.Notifications.permissionNative)

oneSignal.Notifications.addEventListener('permissionChange', () => {
  permissionState.value = oneSignal.Notifications.permissionNative
})

const isDenied = computed(() => permissionState.value === 'denied')

const isExpired = computed(
  () => permissionState.value === 'granted' && !oneSignal.User.PushSubscription.optedIn,
)
export function usePushNotification() {
  async function requestPermission() {
    await oneSignal.Notifications.requestPermission()
    permissionState.value = oneSignal.Notifications.permissionNative
    return permissionState.value
  }
  async function oneSignalLogin(user: string) {
    await oneSignal.login(user)
  }
  async function reEnableNotifications() {
    await oneSignal.User.PushSubscription.optIn()
  }
  return { permissionState, isDenied, isExpired, requestPermission, oneSignalLogin, reEnableNotifications }
}
