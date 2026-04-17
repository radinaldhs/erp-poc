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

  const addProduct = (x: Product): void => { products.value = [x, ...products.value] }
  const updateProduct = (x: Product): void => { products.value = products.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteProduct = (id: string): void => { products.value = products.value.filter((i) => i.id !== id) }

  const addWarehouse = (x: Warehouse): void => { warehouses.value = [x, ...warehouses.value] }
  const updateWarehouse = (x: Warehouse): void => { warehouses.value = warehouses.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteWarehouse = (id: string): void => { warehouses.value = warehouses.value.filter((i) => i.id !== id) }

  const addStockMovement = (x: StockMovement): void => { stockMovements.value = [x, ...stockMovements.value] }
  const updateStockMovement = (x: StockMovement): void => { stockMovements.value = stockMovements.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteStockMovement = (id: string): void => { stockMovements.value = stockMovements.value.filter((i) => i.id !== id) }

  return {
    products,
    warehouses,
    stockLevels,
    stockMovements,
    productById,
    warehouseById,
    stockByProduct,
    lowStockCount,
    addProduct,
    updateProduct,
    deleteProduct,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addStockMovement,
    updateStockMovement,
    deleteStockMovement
  }
})
