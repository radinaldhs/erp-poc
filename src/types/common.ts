export type ID = string
export type ISODate = string
export type Money = number
export type Percentage = number

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface ContactInfo {
  email: string
  phone: string
}

export interface Auditable {
  createdAt: ISODate
  updatedAt: ISODate
}

export interface BaseEntity extends Auditable {
  id: ID
}

export interface LineItem {
  id: ID
  productId: ID
  description: string
  quantity: number
  unitPrice: Money
  taxRate: Percentage
}

export type DocumentStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'received'
  | 'rejected'

export interface TotalsBreakdown {
  subtotal: Money
  tax: Money
  total: Money
}

export interface SelectOption<T = string> {
  value: T
  label: string
}

export interface TableColumn<T = unknown> {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  formatter?: (value: unknown, row: T) => string
  width?: string
}

export interface AppNotification {
  id: ID
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: ISODate
  module?: string
}

export interface ActivityEntry {
  id: ID
  module: string
  title: string
  description: string
  timestamp: ISODate
  actor: string
  icon?: string
}

export type UserRole = 'Admin' | 'Sales' | 'Area Manager' | 'Regional Manager' | 'Finance Director'

export interface User {
  id: ID
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}
