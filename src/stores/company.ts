import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { CompanyProfile } from '@/types'
import { buildCompanyProfile } from '@/data/seedSettings'

export const useCompanyStore = defineStore('company', () => {
  const profile = useStorage<CompanyProfile>(STORAGE_KEYS.company, buildCompanyProfile())

  const update = (patch: Partial<CompanyProfile>): void => {
    profile.value = { ...profile.value, ...patch }
  }

  return { profile, update }
})
