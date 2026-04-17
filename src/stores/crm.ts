import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Activity, Contact, Lead, Opportunity } from '@/types'

export const useCrmStore = defineStore('crm', () => {
  const leads = useStorage<Lead[]>(STORAGE_KEYS.leads, [])
  const opportunities = useStorage<Opportunity[]>(STORAGE_KEYS.opportunities, [])
  const contacts = useStorage<Contact[]>(STORAGE_KEYS.contacts, [])
  const activities = useStorage<Activity[]>(STORAGE_KEYS.activities, [])

  const addLead = (x: Lead): void => { leads.value = [x, ...leads.value] }
  const updateLead = (x: Lead): void => { leads.value = leads.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteLead = (id: string): void => { leads.value = leads.value.filter((i) => i.id !== id) }

  const addOpportunity = (x: Opportunity): void => { opportunities.value = [x, ...opportunities.value] }
  const updateOpportunity = (x: Opportunity): void => { opportunities.value = opportunities.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteOpportunity = (id: string): void => { opportunities.value = opportunities.value.filter((i) => i.id !== id) }

  const addContact = (x: Contact): void => { contacts.value = [x, ...contacts.value] }
  const updateContact = (x: Contact): void => { contacts.value = contacts.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteContact = (id: string): void => { contacts.value = contacts.value.filter((i) => i.id !== id) }

  const addActivity = (x: Activity): void => { activities.value = [x, ...activities.value] }
  const updateActivity = (x: Activity): void => { activities.value = activities.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteActivity = (id: string): void => { activities.value = activities.value.filter((i) => i.id !== id) }

  return {
    leads,
    opportunities,
    contacts,
    activities,
    addLead,
    updateLead,
    deleteLead,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    addContact,
    updateContact,
    deleteContact,
    addActivity,
    updateActivity,
    deleteActivity
  }
})
