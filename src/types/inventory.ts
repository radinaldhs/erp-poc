import type { BaseEntity, ID, ISODate, Money } from './common'

export interface Product extends BaseEntity {
  sku: string
  name: string
  category: string
  unit: string
  purchasePrice: Money
  salePrice: Money
  reorderLevel: number
  description?: string
  status: 'active' | 'discontinued'
}

export interface Warehouse extends BaseEntity {
  code: string
  name: string
  location: string
  manager: string
}

export interface StockLevel {
  id: ID
  productId: ID
  warehouseId: ID
  quantity: number
  reservedQuantity: number
}

export interface StockMovement extends BaseEntity {
  productId: ID
  warehouseId: ID
  type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  reference: string
  date: ISODate
  notes?: string
}
