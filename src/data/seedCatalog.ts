import type { Product, StockLevel, StockMovement, Warehouse } from '@/types'
import { nextInt, pad, pastDateISO, pick, uid } from './prng'

const CATEGORIES = ['Beverages', 'Snacks', 'Personal Care', 'Household', 'Dairy', 'Frozen', 'Bakery']

export function buildProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = pastDateISO(540)
    const cost = nextInt(5, 200)
    return {
      id: uid('pr_'),
      sku: `SKU-${pad(i + 1, 3)}`,
      name: `Product SKU-${pad(i + 1, 3)}`,
      category: pick(CATEGORIES),
      unit: pick(['pcs', 'box', 'kg', 'ltr', 'pack']),
      purchasePrice: cost,
      salePrice: Math.round(cost * (1 + nextInt(20, 80) / 100)),
      reorderLevel: nextInt(10, 100),
      description: `Description placeholder for SKU-${pad(i + 1, 3)}.`,
      status: 'active',
      createdAt,
      updatedAt: createdAt
    }
  })
}

export function buildWarehouses(count = 4): Warehouse[] {
  const locations = ['Los Angeles, CA', 'Chicago, IL', 'Dallas, TX', 'Newark, NJ']
  return Array.from({ length: count }, (_, i) => {
    const createdAt = pastDateISO(540)
    return {
      id: uid('wh_'),
      code: `WH-${pad(i + 1, 2)}`,
      name: `Warehouse ${String.fromCharCode(65 + i)}`,
      location: locations[i] ?? 'Regional Hub',
      manager: pick(['Parker Hayes', 'Taylor Nguyen', 'Jamie Brooks', 'Morgan Davis']),
      createdAt,
      updatedAt: createdAt
    }
  })
}

/**
 * Most product/warehouse lines carry healthy stock; a small, deterministic subset (5-15
 * lines) sit below reorder level so the "Low Stock" stat and table stay believable and
 * non-zero without flooding the demo with alerts.
 */
export function buildStockLevels(products: Product[], warehouses: Warehouse[]): StockLevel[] {
  const combos = products.flatMap((product) => warehouses.map((warehouse) => ({ product, warehouse })))

  const lowStockTarget = nextInt(5, 15)
  const lowStockIndices = new Set<number>()
  while (lowStockIndices.size < Math.min(lowStockTarget, combos.length)) {
    lowStockIndices.add(nextInt(0, combos.length - 1))
  }

  return combos.map(({ product, warehouse }, index) => {
    const isLow = lowStockIndices.has(index)
    const quantity = isLow
      ? Math.max(0, product.reorderLevel - nextInt(1, 20))
      : product.reorderLevel + nextInt(50, 400)
    return {
      id: uid('sl_'),
      productId: product.id,
      warehouseId: warehouse.id,
      quantity,
      reservedQuantity: nextInt(0, Math.min(20, quantity))
    }
  })
}

export function buildStockMovements(products: Product[], warehouses: Warehouse[], count = 60): StockMovement[] {
  return Array.from({ length: count }, () => {
    const createdAt = pastDateISO(120)
    return {
      id: uid('sm_'),
      productId: pick(products).id,
      warehouseId: pick(warehouses).id,
      type: pick(['in', 'out', 'transfer', 'adjustment'] as const),
      quantity: nextInt(1, 200),
      reference: `REF-${pad(nextInt(1, 99999), 5)}`,
      date: createdAt,
      notes: '',
      createdAt,
      updatedAt: createdAt
    }
  })
}
