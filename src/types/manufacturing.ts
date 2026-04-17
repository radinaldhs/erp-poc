import type { BaseEntity, ID, ISODate, Money } from './common'

export interface BomComponent {
  productId: ID
  quantity: number
  unit: string
}

export interface Bom extends BaseEntity {
  code: string
  productId: ID
  components: BomComponent[]
  yieldQuantity: number
  laborCost: Money
  notes?: string
}

export interface WorkOrder extends BaseEntity {
  number: string
  bomId: ID
  productId: ID
  targetQuantity: number
  producedQuantity: number
  startDate: ISODate
  dueDate: ISODate
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold'
  assignee: string
}
