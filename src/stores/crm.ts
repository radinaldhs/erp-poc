import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Activity, Contact, Lead, Opportunity } from '@/types'

export const useCrmStore = defineStore('crm', () => {
  const leads = useStorage<Lead[]>(STORAGE_KEYS.leads, [])
  const opportunities = useStorage<Opportunity[]>(STORAGE_KEYS.opportunities, [])
  const contacts = useStorage<Contact[]>(STORAGE_KEYS.contacts, [])
  const activities = useStorage<Activity[]>(STORAGE_KEYS.activities, [])

  return { leads, opportunities, contacts, activities }
})
