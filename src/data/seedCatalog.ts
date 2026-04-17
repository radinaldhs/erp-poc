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

export function buildStockLevels(products: Product[], warehouses: Warehouse[]): StockLevel[] {
  const out: StockLevel[] = []
  products.forEach((product) => {
    warehouses.forEach((wh) => {
      out.push({
        id: uid('sl_'),
        productId: product.id,
        warehouseId: wh.id,
        quantity: nextInt(0, 500),
        reservedQuantity: nextInt(0, 20)
      })
    })
  })
  return out
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
