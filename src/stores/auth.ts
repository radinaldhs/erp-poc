import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { User, UserRole } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = useStorage<User | null>(STORAGE_KEYS.auth, null)
  const currentRole = useStorage<UserRole>(STORAGE_KEYS.role, 'Admin')

  const isAuthenticated = computed(() => user.value !== null)

  const login = (email: string, _password: string): User => {
    const account: User = {
      id: 'u_demo',
      name: 'Demo User',
      email,
      role: 'Admin'
    }
    user.value = account
    currentRole.value = 'Admin'
    return account
  }

  const logout = (): void => {
    user.value = null
  }

  const setRole = (role: UserRole): void => {
    currentRole.value = role
  }

  return { user, currentRole, isAuthenticated, login, logout, setRole }
})
