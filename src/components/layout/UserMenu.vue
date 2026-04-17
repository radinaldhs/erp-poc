<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LogOut, User } from 'lucide-vue-next'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout(): void {
  auth.logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <BaseDropdown>
    <template #trigger>
      <button class="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-surface">
        <BaseAvatar :name="auth.user?.name ?? 'Demo User'" size="sm" />
        <div class="hidden sm:block text-left">
          <p class="text-sm font-medium leading-tight">{{ auth.user?.name ?? 'Demo User' }}</p>
          <p class="text-xs text-text-muted leading-tight">{{ auth.currentRole }}</p>
        </div>
      </button>
    </template>
    <div class="p-1">
      <button class="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-surface">
        <User class="h-4 w-4" /> Profile
      </button>
      <button class="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-surface text-danger" @click="logout">
        <LogOut class="h-4 w-4" /> Sign out
      </button>
    </div>
  </BaseDropdown>
</template>
