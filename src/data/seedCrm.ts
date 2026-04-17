import type { Activity, Contact, Lead, Opportunity } from '@/types'
import { nextInt, pastDateISO, pick, uid, futureDateISO } from './prng'

const FIRST = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Quinn', 'Avery', 'Parker', 'Hunter']
const LAST = ['Carter', 'Reed', 'Brooks', 'Hayes', 'Gray', 'Owens', 'Rivers', 'Holt', 'Lane', 'Ford']
const COMPANIES = Array.from({ length: 40 }, (_, i) => `Customer ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`)
const SOURCES = ['Website', 'Referral', 'Event', 'Cold Outreach', 'Partner']

export function buildLeads(count: number): Lead[] {
  return Array.from({ length: count }, () => {
    const createdAt = pastDateISO(180)
    return {
      id: uid('ld_'),
      name: `${pick(FIRST)} ${pick(LAST)}`,
      company: pick(COMPANIES),
      contact: {
        email: `lead${nextInt(100, 999)}@example.com`,
        phone: `+1-555-${String(nextInt(1000, 9999)).padStart(4, '0')}`
      },
      source: pick(SOURCES),
      status: pick(['new', 'contacted', 'qualified', 'unqualified', 'converted'] as const),
      owner: `${pick(FIRST)} ${pick(LAST)}`,
      notes: '',
      createdAt,
      updatedAt: createdAt
    }
  })
}

export function buildOpportunities(count: number): Opportunity[] {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = pastDateISO(180)
    return {
      id: uid('op_'),
      name: `Opportunity ${i + 1}`,
      accountName: pick(COMPANIES),
      stage: pick(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const),
      amount: nextInt(5, 150) * 1000,
      probability: nextInt(10, 90),
      closeDate: futureDateISO(120),
      owner: `${pick(FIRST)} ${pick(LAST)}`,
      createdAt,
      updatedAt: createdAt
    }
  })
}

export function buildContacts(count: number): Contact[] {
  return Array.from({ length: count }, () => {
    const createdAt = pastDateISO(540)
    return {
      id: uid('ct_'),
      firstName: pick(FIRST),
      lastName: pick(LAST),
      company: pick(COMPANIES),
      title: pick(['Manager', 'Director', 'Coordinator', 'VP', 'Specialist']),
      contact: {
        email: `contact${nextInt(100, 999)}@example.com`,
        phone: `+1-555-${String(nextInt(1000, 9999)).padStart(4, '0')}`
      },
      createdAt,
      updatedAt: createdAt
    }
  })
}

export function buildActivities(count: number): Activity[] {
  return Array.from({ length: count }, () => {
    const createdAt = pastDateISO(60)
    return {
      id: uid('ac_'),
      subject: pick(['Follow-up call', 'Intro meeting', 'Send proposal', 'Review terms', 'Check-in']),
      type: pick(['call', 'email', 'meeting', 'task'] as const),
      dueDate: futureDateISO(14),
      relatedTo: pick(COMPANIES),
      owner: `${pick(FIRST)} ${pick(LAST)}`,
      status: pick(['open', 'completed'] as const),
      notes: '',
      createdAt,
      updatedAt: createdAt
    }
  })
}
