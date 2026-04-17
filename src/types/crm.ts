import type { BaseEntity, ContactInfo, ID, ISODate, Money } from './common'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
export type OpportunityStage =
  | 'prospecting'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export interface Lead extends BaseEntity {
  name: string
  company: string
  contact: ContactInfo
  source: string
  status: LeadStatus
  owner: string
  notes?: string
}

export interface Opportunity extends BaseEntity {
  name: string
  accountName: string
  stage: OpportunityStage
  amount: Money
  probability: number
  closeDate: ISODate
  owner: string
  leadId?: ID
}

export interface Contact extends BaseEntity {
  firstName: string
  lastName: string
  company: string
  title: string
  contact: ContactInfo
}

export interface Activity extends BaseEntity {
  subject: string
  type: 'call' | 'email' | 'meeting' | 'task'
  dueDate: ISODate
  relatedTo: string
  owner: string
  status: 'open' | 'completed'
  notes?: string
}
