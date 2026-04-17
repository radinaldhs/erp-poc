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
      <button class="hidden md:inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-border/40">
        <UserCog class="h-3.5 w-3.5" />
        <span class="text-text-muted">Role:</span>
        <span class="font-medium">{{ auth.currentRole }}</span>
      </button>
    </template>
    <div class="p-1">
      <p class="px-3 py-2 text-[11px] uppercase tracking-wide text-text-muted">Switch role (demo)</p>
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
