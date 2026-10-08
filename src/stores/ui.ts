import { defineStore } from 'pinia'
import { ref } from 'vue'

const LG_BREAKPOINT = 1024

const isDesktop = (): boolean => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT

export const useUiStore = defineStore('ui', () => {
  // On phones and tablets the sidebar is an off-canvas drawer, so it starts closed.
  const sidebarCollapsed = ref(!isDesktop())

  const toggleSidebar = (): void => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const closeSidebarOnMobile = (): void => {
    if (!isDesktop()) sidebarCollapsed.value = true
  }

  return { sidebarCollapsed, toggleSidebar, closeSidebarOnMobile }
})
