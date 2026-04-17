import type { ActivityEntry, AppNotification, CompanyProfile, Currency, Tax, User } from '@/types'
import { pastDateISO, pick, uid } from './prng'

export function buildCompanyProfile(): CompanyProfile {
  return {
    name: 'Demo Company',
    legalName: 'Demo Company LLC',
    taxId: 'TAX-000-000-00',
    address: {
      line1: '100 Commerce Avenue',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA'
    },
    contact: {
      email: 'operations@democompany.example.com',
      phone: '+1-555-010-2000'
    },
    currency: 'USD',
    fiscalYearStart: '01-01'
  }
}

export function buildCurrencies(): Currency[] {
  const createdAt = pastDateISO(720)
  const base: Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1, isBase: true },
    { code: 'EUR', name: 'Euro', symbol: 'EUR', rate: 0.92, isBase: false },
    { code: 'GBP', name: 'British Pound', symbol: 'GBP', rate: 0.79, isBase: false },
    { code: 'JPY', name: 'Japanese Yen', symbol: 'JPY', rate: 148.5, isBase: false }
  ]
  return base.map((c) => ({ ...c, id: uid('cur_'), createdAt, updatedAt: createdAt }))
}

export function buildTaxes(): Tax[] {
  const createdAt = pastDateISO(720)
  return [
    { code: 'STD', name: 'Standard Sales Tax', rate: 8, type: 'exclusive' as const, isActive: true },
    { code: 'RED', name: 'Reduced Rate', rate: 4, type: 'exclusive' as const, isActive: true },
    { code: 'INC', name: 'Tax Inclusive', rate: 10, type: 'inclusive' as const, isActive: true },
    { code: 'EXM', name: 'Exempt', rate: 0, type: 'exclusive' as const, isActive: true }
  ].map((t) => ({ ...t, id: uid('tx_'), createdAt, updatedAt: createdAt }))
}

export function buildUsers(): User[] {
  return [
    { id: uid('u_'), name: 'Demo User', email: 'demo@democompany.example.com', role: 'Admin' },
    { id: uid('u_'), name: 'Alex Carter', email: 'alex@democompany.example.com', role: 'Sales' },
    { id: uid('u_'), name: 'Parker Hayes', email: 'parker@democompany.example.com', role: 'Area Manager' },
    { id: uid('u_'), name: 'Jamie Brooks', email: 'jamie@democompany.example.com', role: 'Regional Manager' },
    { id: uid('u_'), name: 'Hunter Gray', email: 'hunter@democompany.example.com', role: 'Finance Director' }
  ]
}

export function buildNotifications(): AppNotification[] {
  const modules = ['sales', 'promos', 'inventory', 'hr', 'projects']
  return Array.from({ length: 8 }, (_, i) => ({
    id: uid('nt_'),
    title: pick(['New promo submitted', 'Invoice overdue', 'Low stock alert', 'New lead assigned', 'Task due soon']),
    message: 'Review the item for the next action.',
    type: pick(['info', 'warning', 'success', 'error'] as const),
    read: i > 3,
    createdAt: pastDateISO(7),
    module: pick(modules)
  }))
}

export function buildActivity(): ActivityEntry[] {
  return Array.from({ length: 12 }, () => ({
    id: uid('av_'),
    module: pick(['sales', 'promos', 'crm', 'inventory', 'projects']),
    title: pick(['Created record', 'Updated status', 'Approved entry', 'Rejected entry', 'Submitted form']),
    description: 'Seeded demo activity entry.',
    timestamp: pastDateISO(10),
    actor: pick(['Alex Carter', 'Parker Hayes', 'Jamie Brooks', 'Taylor Nguyen'])
  }))
}
