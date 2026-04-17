import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Product, StockLevel, StockMovement, Warehouse } from '@/types'

export const useInventoryStore = defineStore('inventory', () => {
  const products = useStorage<Product[]>(STORAGE_KEYS.products, [])
  const warehouses = useStorage<Warehouse[]>(STORAGE_KEYS.warehouses, [])
  const stockLevels = useStorage<StockLevel[]>(STORAGE_KEYS.stockLevels, [])
  const stockMovements = useStorage<StockMovement[]>(STORAGE_KEYS.stockMovements, [])

  const productById = (id: string) => products.value.find((p) => p.id === id)
  const warehouseById = (id: string) => warehouses.value.find((w) => w.id === id)

  const stockByProduct = computed(() => {
    const map: Record<string, number> = {}
    stockLevels.value.forEach((sl) => {
      map[sl.productId] = (map[sl.productId] ?? 0) + sl.quantity
    })
    return map
  })

  const lowStockCount = computed(() => {
    return products.value.filter((p) => (stockByProduct.value[p.id] ?? 0) < p.reorderLevel).length
  })

  return {
    products,
    warehouses,
    stockLevels,
    stockMovements,
    productById,
    warehouseById,
    stockByProduct,
    lowStockCount
  }
})
