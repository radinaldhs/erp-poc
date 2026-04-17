import type { Address, BaseEntity, ContactInfo, DocumentStatus, ID, ISODate, LineItem, Money } from './common'

export interface Vendor extends BaseEntity {
  code: string
  name: string
  contact: ContactInfo
  address: Address
  balance: Money
  status: 'active' | 'inactive'
}

export interface PurchaseDocument extends BaseEntity {
  number: string
  vendorId: ID
  issueDate: ISODate
  dueDate: ISODate
  status: DocumentStatus
  lineItems: LineItem[]
  notes?: string
  subtotal: Money
  tax: Money
  total: Money
}

export type PurchaseOrder = PurchaseDocument

export interface Bill extends PurchaseDocument {
  paidAmount: Money
  balance: Money
}
