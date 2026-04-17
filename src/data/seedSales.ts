import type { Customer, FieldSalesRow, Invoice, LineItem, MarketplaceChannel, MarketplaceSalesRow, Quote, SalesOrder } from '@/types'
import { nextFloat, nextInt, pad, pastDateISO, pick, uid } from './prng'

const REGIONS = ['Region A', 'Region B', 'Region C', 'Region D', 'Region E']
const SALES_REPS = [
  'Alex Carter',
  'Maya Patel',
  'Jordan Lee',
  'Riley Chen',
  'Taylor Nguyen',
  'Morgan Davis',
  'Avery Silva',
  'Quinn Reyes'
]
const MARKETPLACES: MarketplaceChannel[] = [
  'Marketplace A',
  'Marketplace B',
  'Marketplace C',
  'Marketplace D',
  'Marketplace E'
]
const SEGMENTS = ['Retail', 'Wholesale', 'Corporate', 'Online']

export function buildCustomers(count: number): Customer[] {
  const out: Customer[] = []
  for (let i = 0; i < count; i++) {
    const code = `CUST-${pad(i + 1, 4)}`
    const name = `Customer ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`
    const createdAt = pastDateISO(540)
    out.push({
      id: uid('c_'),
      code,
      name,
      contact: {
        email: `contact${i + 1}@customer${i + 1}.example.com`,
        phone: `+1-555-${pad(nextInt(100, 999), 3)}-${pad(nextInt(1000, 9999), 4)}`
      },
      billingAddress: {
        line1: `${nextInt(10, 9999)} Market Street`,
        city: pick(['Springfield', 'Franklin', 'Greenville', 'Madison', 'Clinton']),
        state: pick(['CA', 'NY', 'TX', 'WA', 'IL']),
        postalCode: pad(nextInt(10000, 99999), 5),
        country: 'USA'
      },
      creditLimit: nextInt(5, 100) * 1000,
      balance: nextInt(0, 50) * 100,
      status: nextFloat() < 0.9 ? 'active' : 'inactive',
      segment: pick(SEGMENTS),
      createdAt,
      updatedAt: createdAt
    } as Customer & { segment: string })
  }
  return out
}

function buildLineItems(productIds: string[]): { items: LineItem[]; subtotal: number; tax: number; total: number } {
  const count = nextInt(3, 8)
  const items: LineItem[] = []
  let subtotal = 0
  for (let i = 0; i < count; i++) {
    const qty = nextInt(1, 20)
    const unit = nextInt(10, 500)
    const rate = 0.08
    items.push({
      id: uid('li_'),
      productId: pick(productIds),
      description: `SKU item ${pad(i + 1, 2)} description`,
      quantity: qty,
      unitPrice: unit,
      taxRate: rate
    })
    subtotal += qty * unit
  }
  const tax = +(subtotal * 0.08).toFixed(2)
  return { items, subtotal, tax, total: +(subtotal + tax).toFixed(2) }
}

function buildDoc(prefix: string, index: number, customerIds: string[], productIds: string[]) {
  const { items, subtotal, tax, total } = buildLineItems(productIds)
  const issueDate = pastDateISO(365)
  const due = new Date(issueDate)
  due.setDate(due.getDate() + 30)
  return {
    id: uid(`${prefix.toLowerCase()}_`),
    number: `${prefix}-${pad(index + 1, 5)}`,
    customerId: pick(customerIds),
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

export function buildQuotes(count: number, customerIds: string[], productIds: string[]): Quote[] {
  return Array.from({ length: count }, (_, i) => ({
    ...buildDoc('Q', i, customerIds, productIds),
    status: pick(['draft', 'sent', 'approved', 'rejected'] as const),
    notes: ''
  }))
}

export function buildSalesOrders(count: number, customerIds: string[], productIds: string[]): SalesOrder[] {
  return Array.from({ length: count }, (_, i) => ({
    ...buildDoc('SO', i, customerIds, productIds),
    status: pick(['draft', 'approved', 'sent', 'cancelled'] as const),
    notes: ''
  }))
}

export function buildInvoices(count: number, customerIds: string[], productIds: string[]): Invoice[] {
  return Array.from({ length: count }, (_, i) => {
    const base = buildDoc('INV', i, customerIds, productIds)
    const status = pick(['draft', 'sent', 'paid', 'overdue'] as const)
    const paid = status === 'paid' ? base.total : status === 'sent' ? base.total * nextFloat() : 0
    return {
      ...base,
      status,
      paidAmount: +paid.toFixed(2),
      balance: +(base.total - paid).toFixed(2),
      notes: ''
    }
  })
}

export function buildFieldSalesRows(count: number, productNames: string[], customerNames: string[]): FieldSalesRow[] {
  return Array.from({ length: count }, () => {
    const qty = nextInt(1, 50)
    const unit = nextInt(10, 300)
    return {
      id: uid('fs_'),
      date: pastDateISO(365),
      salesRep: pick(SALES_REPS),
      region: pick(REGIONS),
      customer: pick(customerNames),
      product: pick(productNames),
      quantity: qty,
      unitPrice: unit,
      total: qty * unit
    }
  })
}

export function buildMarketplaceSales(
  count: number,
  productNames: string[],
  customerNames: string[]
): MarketplaceSalesRow[] {
  const distribution: MarketplaceChannel[] = [
    'Marketplace A',
    'Marketplace A',
    'Marketplace A',
    'Marketplace B',
    'Marketplace B',
    'Marketplace C',
    'Marketplace C',
    'Marketplace D',
    'Marketplace E'
  ]
  return Array.from({ length: count }, (_, i) => {
    const qty = nextInt(1, 10)
    const unit = nextInt(15, 250)
    return {
      id: uid('mp_'),
      date: pastDateISO(365),
      marketplace: pick(distribution) ?? MARKETPLACES[0],
      orderNo: `MP-${pad(i + 1, 6)}`,
      customer: pick(customerNames),
      product: pick(productNames),
      quantity: qty,
      unitPrice: unit,
      total: qty * unit,
      status: pick(['completed', 'completed', 'completed', 'pending', 'cancelled', 'refunded'] as const)
    }
  })
}
