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

// beforeinstallprompt fires asynchronously (and only on Chromium browsers), so
// there's a real "not yet known" state between page load and that event —
// distinct from browsers that will never fire it. isInstalled/isIOS don't
// depend on that event, so skip the wait entirely when either is already true.
const isCheckingInstallSupport = ref(!isInstalled.value && !isIOS.value)
if (isCheckingInstallSupport.value) {
  setTimeout(() => {
    isCheckingInstallSupport.value = false
  }, 2000)
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent
  isInstallable.value = true
  isCheckingInstallSupport.value = false
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

  return { isInstallable, isInstalled, isIOS, isCheckingInstallSupport, promptInstall }
}
