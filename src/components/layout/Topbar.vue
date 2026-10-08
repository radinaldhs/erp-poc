<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Menu } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import ThemeToggle from './ThemeToggle.vue'
import UserMenu from './UserMenu.vue'
import NotificationsMenu from './NotificationsMenu.vue'
import RoleSwitcher from './RoleSwitcher.vue'
import Breadcrumbs from './Breadcrumbs.vue'

const ui = useUiStore()
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
    <div class="flex items-center justify-between gap-3 px-4 lg:px-6 h-14">
      <div class="flex items-center gap-3 min-w-0">
        <button class="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-surface lg:hidden" aria-label="Open menu" @click="ui.toggleSidebar">
          <Menu class="h-5 w-5" />
        </button>
        <RouterLink to="/dashboard" class="md:hidden inline-flex items-center gap-2 font-semibold text-sm min-w-0">
          <span class="h-7 w-7 shrink-0 rounded-md bg-primary text-primary-foreground inline-flex items-center justify-center text-xs font-bold">R</span>
          <span class="truncate">Radinal ERP</span>
        </RouterLink>
        <Breadcrumbs class="hidden md:flex" />
      </div>
      <div class="flex items-center gap-1 sm:gap-2 shrink-0">
        <RoleSwitcher />
        <NotificationsMenu />
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  </header>
</template>
