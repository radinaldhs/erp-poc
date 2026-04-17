import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Bom, WorkOrder } from '@/types'

export const useManufacturingStore = defineStore('manufacturing', () => {
  const boms = useStorage<Bom[]>(STORAGE_KEYS.boms, [])
  const workOrders = useStorage<WorkOrder[]>(STORAGE_KEYS.workOrders, [])

  const bomById = (id: string) => boms.value.find((b) => b.id === id)

  return { boms, workOrders, bomById }
})
