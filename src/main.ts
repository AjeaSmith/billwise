import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import OneSignalVuePlugin from '@onesignal/onesignal-vue3'
import './style.css'

const app = createApp(App)

app.use(router)
app.use(VueQueryPlugin)
app.use(OneSignalVuePlugin, {
  appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
})

app.mount('#app')
