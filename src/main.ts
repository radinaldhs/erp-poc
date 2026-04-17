import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initializeSeedData } from './data/seed'
import './style.css'

initializeSeedData()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
