import type { BaseEntity, ID, ISODate, Money, Percentage, UserRole } from './common'

export type PromoType = 'Discount' | 'Bundle' | 'Cashback' | 'Gift'

export type PromoStatus =
  | 'Draft'
  | 'Pending Area Manager'
  | 'Pending Regional Manager'
  | 'Pending Finance Director'
  | 'Approved'
  | 'Rejected'

export interface PromoAuditEntry {
  id: ID
  actor: string
  role: UserRole
  action: 'submit' | 'approve' | 'reject' | 'comment'
  comment?: string
  timestamp: ISODate
  fromStatus?: PromoStatus
  toStatus?: PromoStatus
}

export interface Promo extends BaseEntity {
  promoName: string
  promoType: PromoType
  targetRegion: string
  targetCustomerSegment: string
  startDate: ISODate
  endDate: ISODate
  discountPercent: Percentage
  estimatedBudget: Money
  expectedRevenueUplift: Money
  justification: string
  termsAndConditions: string
  submittedBy: string
  status: PromoStatus
  auditLog: PromoAuditEntry[]
}
