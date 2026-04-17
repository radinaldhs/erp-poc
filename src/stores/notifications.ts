import { defineStore } from 'pinia'
import { computed } from 'vue'
import { v4 as uuid } from 'uuid'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { ActivityEntry, AppNotification } from '@/types'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = useStorage<AppNotification[]>(STORAGE_KEYS.notifications, [])
  const activity = useStorage<ActivityEntry[]>(STORAGE_KEYS.activity, [])

  const unreadCount = computed(() => items.value.filter((n) => !n.read).length)

  const markAllRead = (): void => {
    items.value = items.value.map((n) => ({ ...n, read: true }))
  }

  const markRead = (id: string): void => {
    items.value = items.value.map((n) => (n.id === id ? { ...n, read: true } : n))
  }

  const push = (entry: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): void => {
    const note: AppNotification = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      read: false,
      ...entry
    }
    items.value = [note, ...items.value]
  }

  const addActivity = (entry: Omit<ActivityEntry, 'id' | 'timestamp'>): void => {
    const record: ActivityEntry = {
      ...entry,
      id: uuid(),
      timestamp: new Date().toISOString()
    }
    activity.value = [record, ...activity.value].slice(0, 40)
  }

  return { items, activity, unreadCount, markAllRead, markRead, push, addActivity }
})
