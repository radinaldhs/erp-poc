import type { BaseEntity, ID, ISODate, Money } from './common'

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

export interface Account extends BaseEntity {
  code: string
  name: string
  type: AccountType
  parentId?: ID
  balance: Money
  isActive: boolean
}

export interface JournalLine {
  id: ID
  accountId: ID
  debit: Money
  credit: Money
  description?: string
}

export interface JournalEntry extends BaseEntity {
  number: string
  date: ISODate
  description: string
  reference?: string
  lines: JournalLine[]
  status: 'draft' | 'posted'
}
