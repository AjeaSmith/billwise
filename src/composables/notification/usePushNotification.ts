import { useOneSignal } from '@onesignal/onesignal-vue3'
import { ref } from 'vue'

const oneSignal = useOneSignal()
const permissionState = ref(oneSignal.Notifications.permissionNative)

oneSignal.Notifications.addEventListener('permissionChange', () => {
  permissionState.value = oneSignal.Notifications.permissionNative
})
export function usePushNotification() {
  async function requestPermission() {
    await oneSignal.Notifications.requestPermission()
    permissionState.value = oneSignal.Notifications.permissionNative
    return permissionState.value
  }
  async function oneSignalLogin(user: string) {
    await oneSignal.login(user)
  }
  return { permissionState, requestPermission, oneSignalLogin }
}
