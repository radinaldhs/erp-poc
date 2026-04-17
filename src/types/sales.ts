import type { Address, BaseEntity, ContactInfo, DocumentStatus, ID, ISODate, LineItem, Money } from './common'

export interface Customer extends BaseEntity {
  code: string
  name: string
  contact: ContactInfo
  billingAddress: Address
  creditLimit: Money
  balance: Money
  status: 'active' | 'inactive'
  notes?: string
}

export interface SalesDocument extends BaseEntity {
  number: string
  customerId: ID
  issueDate: ISODate
  dueDate: ISODate
  status: DocumentStatus
  lineItems: LineItem[]
  notes?: string
  subtotal: Money
  tax: Money
  total: Money
}

export type Quote = SalesDocument
export type SalesOrder = SalesDocument

export interface Invoice extends SalesDocument {
  paidAmount: Money
  balance: Money
}

export interface FieldSalesRow {
  id: ID
  date: ISODate
  salesRep: string
  region: string
  customer: string
  product: string
  quantity: number
  unitPrice: Money
  total: Money
}

export interface FieldSalesUpload {
  id: ID
  filename: string
  uploader: string
  uploadedAt: ISODate
  rowCount: number
  status: 'processed' | 'failed' | 'pending'
  rows: FieldSalesRow[]
}

export type MarketplaceChannel = 'Marketplace A' | 'Marketplace B' | 'Marketplace C' | 'Marketplace D' | 'Marketplace E'

export interface MarketplaceSalesRow {
  id: ID
  date: ISODate
  marketplace: MarketplaceChannel
  orderNo: string
  customer: string
  product: string
  quantity: number
  unitPrice: Money
  total: Money
  status: 'completed' | 'pending' | 'cancelled' | 'refunded'
}
