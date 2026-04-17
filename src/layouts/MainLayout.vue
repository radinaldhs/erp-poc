<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <div class="min-h-screen flex">
    <Sidebar />
    <div v-if="!ui.sidebarCollapsed" class="lg:hidden fixed inset-0 bg-black/40 z-30" @click="ui.toggleSidebar" />
    <div class="flex-1 min-w-0 flex flex-col">
      <Topbar />
      <main class="flex-1 p-4 lg:p-6 space-y-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
