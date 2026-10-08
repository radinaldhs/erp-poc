<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const route = useRoute()

watch(
  () => route.fullPath,
  () => ui.closeSidebarOnMobile()
)
</script>

<template>
  <div class="min-h-screen flex">
    <Sidebar />
    <div v-if="!ui.sidebarCollapsed" class="lg:hidden fixed inset-0 bg-black/40 z-30" @click="ui.toggleSidebar" />
    <div class="flex-1 min-w-0 flex flex-col">
      <Topbar />
      <main class="flex-1 min-w-0 p-4 lg:p-6 pb-24 lg:pb-24 space-y-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
