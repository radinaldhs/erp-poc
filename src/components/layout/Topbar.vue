<script setup lang="ts">
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
        <button class="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-surface lg:hidden" @click="ui.toggleSidebar">
          <Menu class="h-5 w-5" />
        </button>
        <Breadcrumbs class="hidden md:flex" />
      </div>
      <div class="flex items-center gap-2">
        <RoleSwitcher />
        <NotificationsMenu />
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  </header>
</template>
