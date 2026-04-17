<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { formatRelative } from '@/composables/useFormat'

const notifications = useNotificationsStore()

function markAll(): void {
  notifications.markAllRead()
}
</script>

<template>
  <BaseDropdown width="w-80">
    <template #trigger>
      <button class="h-9 w-9 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-surface relative">
        <Bell class="h-4 w-4" />
        <span
          v-if="notifications.unreadCount > 0"
          class="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-danger text-white text-[10px] font-semibold inline-flex items-center justify-center"
        >
          {{ notifications.unreadCount }}
        </span>
      </button>
    </template>
    <div class="p-3 border-b border-border flex items-center justify-between">
      <span class="text-sm font-semibold">Notifications</span>
      <button class="text-xs text-primary" @click.stop="markAll">Mark all read</button>
    </div>
    <div class="max-h-80 overflow-y-auto scrollbar-thin">
      <div v-if="notifications.items.length === 0" class="p-4 text-center text-xs text-text-muted">
        No notifications
      </div>
      <div
        v-for="n in notifications.items"
        :key="n.id"
        class="px-4 py-3 border-b border-border last:border-0"
        :class="n.read ? 'opacity-70' : ''"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm font-medium">{{ n.title }}</p>
            <p class="text-xs text-text-muted mt-0.5">{{ n.message }}</p>
          </div>
          <BaseBadge :tone="n.type === 'error' ? 'danger' : (n.type === 'warning' ? 'warning' : (n.type === 'success' ? 'success' : 'info'))">
            {{ n.type }}
          </BaseBadge>
        </div>
        <p class="text-[11px] text-text-muted mt-1">{{ formatRelative(n.createdAt) }}</p>
      </div>
    </div>
  </BaseDropdown>
</template>
