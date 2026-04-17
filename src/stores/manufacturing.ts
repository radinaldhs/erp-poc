import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Bom, WorkOrder } from '@/types'

export const useManufacturingStore = defineStore('manufacturing', () => {
  const boms = useStorage<Bom[]>(STORAGE_KEYS.boms, [])
  const workOrders = useStorage<WorkOrder[]>(STORAGE_KEYS.workOrders, [])

  const bomById = (id: string) => boms.value.find((b) => b.id === id)

  const addBom = (x: Bom): void => { boms.value = [x, ...boms.value] }
  const updateBom = (x: Bom): void => { boms.value = boms.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteBom = (id: string): void => { boms.value = boms.value.filter((i) => i.id !== id) }

  const addWorkOrder = (x: WorkOrder): void => { workOrders.value = [x, ...workOrders.value] }
  const updateWorkOrder = (x: WorkOrder): void => { workOrders.value = workOrders.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteWorkOrder = (id: string): void => { workOrders.value = workOrders.value.filter((i) => i.id !== id) }

  return {
    boms,
    workOrders,
    bomById,
    addBom,
    updateBom,
    deleteBom,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder
  }
})
