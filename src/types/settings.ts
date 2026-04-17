import type { Address, BaseEntity, ContactInfo } from './common'

export interface CompanyProfile {
  name: string
  legalName: string
  taxId: string
  address: Address
  contact: ContactInfo
  logoUrl?: string
  currency: string
  fiscalYearStart: string
}

export interface Currency extends BaseEntity {
  code: string
  name: string
  symbol: string
  rate: number
  isBase: boolean
}

export interface Tax extends BaseEntity {
  code: string
  name: string
  rate: number
  type: 'inclusive' | 'exclusive'
  isActive: boolean
}
