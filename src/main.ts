import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'

const app = createApp(App)

app.use(router)
app.use(VueQueryPlugin)

app.mount('#app')

