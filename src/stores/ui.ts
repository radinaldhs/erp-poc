import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const phase2Collapsed = ref(true)

  const toggleSidebar = (): void => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  const togglePhase2 = (): void => {
    phase2Collapsed.value = !phase2Collapsed.value
  }

  return { sidebarCollapsed, phase2Collapsed, toggleSidebar, togglePhase2 }
})
