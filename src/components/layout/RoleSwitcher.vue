<script setup lang="ts">
import { UserCog } from 'lucide-vue-next'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

const auth = useAuthStore()

const roles: UserRole[] = ['Admin', 'Sales', 'Area Manager', 'Regional Manager', 'Finance Director']

function setRole(role: UserRole): void {
  auth.setRole(role)
}
</script>

<template>
  <BaseDropdown width="w-56">
    <template #trigger>
      <button
        class="inline-flex items-center gap-2 rounded-md border border-border bg-surface h-9 w-9 justify-center md:h-auto md:w-auto md:px-2.5 md:py-1.5 text-xs text-text hover:bg-border/40"
        :aria-label="`Switch role (current: ${auth.currentRole})`"
      >
        <UserCog class="h-4 w-4 md:h-3.5 md:w-3.5" />
        <span class="hidden md:inline text-text-muted">Role:</span>
        <span class="hidden md:inline font-medium">{{ auth.currentRole }}</span>
      </button>
    </template>
    <div class="p-1">
      <p class="px-3 py-2 text-[11px] uppercase tracking-wide text-text-muted">Switch role (demo): {{ auth.currentRole }}</p>
      <button
        v-for="role in roles"
        :key="role"
        :class="[
          'w-full text-left px-3 py-2 text-sm rounded-md hover:bg-surface',
          role === auth.currentRole && 'bg-primary/10 text-primary font-medium'
        ]"
        @click="setRole(role)"
      >
        {{ role }}
      </button>
    </div>
  </BaseDropdown>
</template>
