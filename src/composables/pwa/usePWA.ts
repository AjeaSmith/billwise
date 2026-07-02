import { ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectStandalone(): boolean {
  const mediaMatch = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return mediaMatch || iosStandalone
}

function detectIOS(): boolean {
  const ua = navigator.userAgent
  const isAppleDevice = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ reports as macOS — detect by touch points
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isAppleDevice || isIPadOS
}

// Module-level singletons so the beforeinstallprompt listener is registered once
const isInstallable = ref(false)
const isInstalled = ref(detectStandalone())
const isIOS = ref(detectIOS())
let deferredPrompt: BeforeInstallPromptEvent | null = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent
  isInstallable.value = true
})

window.addEventListener('appinstalled', () => {
  isInstallable.value = false
  isInstalled.value = true
  deferredPrompt = null
})

export function usePWA() {
  async function promptInstall() {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } finally {
      deferredPrompt = null
      isInstallable.value = false
    }
  }

  return { isInstallable, isInstalled, isIOS, promptInstall }
}
