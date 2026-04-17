import type { Bill, LineItem, PurchaseOrder, Vendor } from '@/types'
import { nextFloat, nextInt, pad, pastDateISO, pick, uid } from './prng'

export function buildVendors(count: number): Vendor[] {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = pastDateISO(540)
    return {
      id: uid('v_'),
      code: `V-${pad(i + 1, 3)}`,
      name: `Vendor V-${pad(i + 1, 3)}`,
      contact: {
        email: `vendor${i + 1}@vendor${i + 1}.example.com`,
        phone: `+1-555-${pad(nextInt(100, 999), 3)}-${pad(nextInt(1000, 9999), 4)}`
      },
      address: {
        line1: `${nextInt(10, 9999)} Industry Way`,
        city: pick(['Phoenix', 'Denver', 'Atlanta', 'Boston', 'Seattle']),
        state: pick(['AZ', 'CO', 'GA', 'MA', 'WA']),
        postalCode: pad(nextInt(10000, 99999), 5),
        country: 'USA'
      },
      balance: nextInt(0, 60) * 100,
      status: nextFloat() < 0.9 ? 'active' : 'inactive',
      createdAt,
      updatedAt: createdAt
    }
  })
}

function buildLines(productIds: string[]): { items: LineItem[]; subtotal: number; tax: number; total: number } {
  const count = nextInt(3, 8)
  const items: LineItem[] = []
  let subtotal = 0
  for (let i = 0; i < count; i++) {
    const qty = nextInt(1, 50)
    const unit = nextInt(5, 300)
    items.push({
      id: uid('pli_'),
      productId: pick(productIds),
      description: `Line item ${pad(i + 1, 2)}`,
      quantity: qty,
      unitPrice: unit,
      taxRate: 0.08
    })
    subtotal += qty * unit
  }
  const tax = +(subtotal * 0.08).toFixed(2)
  return { items, subtotal, tax, total: +(subtotal + tax).toFixed(2) }
}

function buildPurchaseDoc(prefix: string, index: number, vendorIds: string[], productIds: string[]) {
  const { items, subtotal, tax, total } = buildLines(productIds)
  const issueDate = pastDateISO(365)
  const due = new Date(issueDate)
  due.setDate(due.getDate() + 30)
  return {
    id: uid(`${prefix.toLowerCase()}_`),
    number: `${prefix}-${pad(index + 1, 5)}`,
    vendorId: pick(vendorIds),
    issueDate,
    dueDate: due.toISOString(),
    lineItems: items,
    subtotal,
    tax,
    total,
    createdAt: issueDate,
    updatedAt: issueDate
  }
}

export function buildPurchaseOrders(count: number, vendorIds: string[], productIds: string[]): PurchaseOrder[] {
  return Array.from({ length: count }, (_, i) => ({
    ...buildPurchaseDoc('PO', i, vendorIds, productIds),
    status: pick(['draft', 'approved', 'sent', 'received', 'cancelled'] as const),
    notes: ''
  }))
}

export function buildBills(count: number, vendorIds: string[], productIds: string[]): Bill[] {
  return Array.from({ length: count }, (_, i) => {
    const base = buildPurchaseDoc('BILL', i, vendorIds, productIds)
    const status = pick(['draft', 'approved', 'paid', 'overdue'] as const)
    const paid = status === 'paid' ? base.total : status === 'approved' ? base.total * nextFloat() : 0
    return {
      ...base,
      status,
      paidAmount: +paid.toFixed(2),
      balance: +(base.total - paid).toFixed(2),
      notes: ''
    }
  })
}
