import type { Account, AccountType, JournalEntry, JournalLine } from '@/types'
import { nextInt, pad, pastDateISO, pick, uid } from './prng'

interface AccountSeed {
  code: string
  name: string
  type: AccountType
}

const CHART: AccountSeed[] = [
  { code: '1000', name: 'Cash', type: 'asset' },
  { code: '1010', name: 'Bank Checking', type: 'asset' },
  { code: '1020', name: 'Bank Savings', type: 'asset' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset' },
  { code: '1200', name: 'Inventory', type: 'asset' },
  { code: '1300', name: 'Prepaid Expenses', type: 'asset' },
  { code: '1500', name: 'Equipment', type: 'asset' },
  { code: '1510', name: 'Furniture and Fixtures', type: 'asset' },
  { code: '1520', name: 'Vehicles', type: 'asset' },
  { code: '1600', name: 'Accumulated Depreciation', type: 'asset' },
  { code: '2000', name: 'Accounts Payable', type: 'liability' },
  { code: '2100', name: 'Sales Tax Payable', type: 'liability' },
  { code: '2200', name: 'Wages Payable', type: 'liability' },
  { code: '2300', name: 'Income Tax Payable', type: 'liability' },
  { code: '2500', name: 'Long-Term Debt', type: 'liability' },
  { code: '2600', name: 'Deferred Revenue', type: 'liability' },
  { code: '3000', name: 'Common Stock', type: 'equity' },
  { code: '3100', name: 'Retained Earnings', type: 'equity' },
  { code: '3200', name: 'Owner Draws', type: 'equity' },
  { code: '4000', name: 'Product Sales', type: 'revenue' },
  { code: '4010', name: 'Service Revenue', type: 'revenue' },
  { code: '4020', name: 'Marketplace Sales', type: 'revenue' },
  { code: '4030', name: 'Other Income', type: 'revenue' },
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
  { code: '5100', name: 'Freight In', type: 'expense' },
  { code: '6000', name: 'Salaries and Wages', type: 'expense' },
  { code: '6100', name: 'Rent Expense', type: 'expense' },
  { code: '6200', name: 'Utilities Expense', type: 'expense' },
  { code: '6300', name: 'Advertising Expense', type: 'expense' },
  { code: '6400', name: 'Office Supplies', type: 'expense' },
  { code: '6500', name: 'Travel Expense', type: 'expense' },
  { code: '6600', name: 'Professional Fees', type: 'expense' },
  { code: '6700', name: 'Insurance Expense', type: 'expense' },
  { code: '6800', name: 'Depreciation Expense', type: 'expense' },
  { code: '6900', name: 'Bank Charges', type: 'expense' },
  { code: '7000', name: 'Interest Expense', type: 'expense' },
  { code: '7100', name: 'Repairs and Maintenance', type: 'expense' },
  { code: '7200', name: 'Software Subscriptions', type: 'expense' },
  { code: '7300', name: 'Taxes - Other', type: 'expense' },
  { code: '7400', name: 'Miscellaneous', type: 'expense' }
]

export function buildAccounts(): Account[] {
  const createdAt = pastDateISO(540)
  return CHART.map((a) => ({
    id: uid('acc_'),
    code: a.code,
    name: a.name,
    type: a.type,
    balance: nextInt(0, 50000),
    isActive: true,
    createdAt,
    updatedAt: createdAt
  }))
}

export function buildJournalEntries(count: number, accounts: Account[]): JournalEntry[] {
  const pairs: [AccountType, AccountType][] = [
    ['asset', 'revenue'],
    ['expense', 'asset'],
    ['asset', 'liability'],
    ['expense', 'liability']
  ]
  return Array.from({ length: count }, (_, i) => {
    const pair = pick(pairs)
    const debit = accounts.find((a) => a.type === pair[0])
    const credit = accounts.find((a) => a.type === pair[1])
    const amount = nextInt(200, 20000)
    const date = pastDateISO(180)
    const lines: JournalLine[] = [
      {
        id: uid('jl_'),
        accountId: debit?.id ?? accounts[0].id,
        debit: amount,
        credit: 0,
        description: 'Debit leg'
      },
      {
        id: uid('jl_'),
        accountId: credit?.id ?? accounts[1].id,
        debit: 0,
        credit: amount,
        description: 'Credit leg'
      }
    ]
    return {
      id: uid('je_'),
      number: `JE-${pad(i + 1, 5)}`,
      date,
      description: `Auto-posted entry ${pad(i + 1, 4)}`,
      reference: `REF-${pad(nextInt(1, 9999), 4)}`,
      lines,
      status: 'posted',
      createdAt: date,
      updatedAt: date
    }
  })
}
