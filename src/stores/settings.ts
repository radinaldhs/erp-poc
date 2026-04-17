import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Currency, Tax, User } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const currencies = useStorage<Currency[]>(STORAGE_KEYS.currencies, [])
  const taxes = useStorage<Tax[]>(STORAGE_KEYS.taxes, [])
  const users = useStorage<User[]>(STORAGE_KEYS.users, [])

  return { currencies, taxes, users }
})
