import type { Account, AccountType, JournalEntry, JournalLine } from '@/types'
import { nextFloat, nextInt, pad, pastDateISO, pick, uid } from './prng'

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

const ASSET_CODES = ['1000', '1010', '1020', '1100', '1200', '1300', '1500', '1510', '1520']
const ASSET_WEIGHTS = [0.08, 0.1, 0.05, 0.15, 0.2, 0.03, 0.2, 0.07, 0.12]
// Equipment, Furniture and Fixtures, Vehicles: the gross fixed-asset base that
// Accumulated Depreciation is a proportion of.
const FIXED_ASSET_CODES = ['1500', '1510', '1520']

const REVENUE_CODES = ['4000', '4010', '4020', '4030']
const REVENUE_WEIGHTS = [0.45, 0.25, 0.2, 0.1]
const EXPENSE_CODES = [
  '5000', '5100', '6000', '6100', '6200', '6300', '6400', '6500', '6600',
  '6700', '6800', '6900', '7000', '7100', '7200', '7300', '7400'
]
const EXPENSE_WEIGHTS = [
  0.35, 0.03, 0.25, 0.06, 0.02, 0.05, 0.02, 0.03, 0.04,
  0.02, 0.03, 0.01, 0.02, 0.02, 0.02, 0.02, 0.01
]
function jitteredWeights(weights: number[]): number[] {
  const jittered = weights.map((w) => w * (0.85 + nextFloat() * 0.3))
  const sum = jittered.reduce((s, w) => s + w, 0)
  return jittered.map((w) => w / sum)
}

/** Splits `total` across `weights` with realistic jitter while guaranteeing the parts sum exactly to `total`. */
function allocateWeighted(total: number, weights: number[]): number[] {
  const normalized = jitteredWeights(weights)
  let allocated = 0
  return normalized.map((w, i) => {
    if (i === normalized.length - 1) return total - allocated
    const amount = Math.round(total * w)
    allocated += amount
    return amount
  })
}

function applyByCode(accounts: Account[], codes: string[], amounts: number[]): void {
  codes.forEach((code, i) => {
    const account = accounts.find((a) => a.code === code)
    if (account) account.balance = amounts[i]
  })
}

function totalByType(accounts: Account[], type: AccountType): number {
  return accounts.filter((a) => a.type === type).reduce((sum, a) => sum + a.balance, 0)
}

/**
 * Books must balance by construction: Assets = Liabilities + Equity, and Trial Balance
 * debit/credit totals must tie out (the same accounting identity restated). Rather than
 * seed every account with an independent random balance, plug the difference into
 * Retained Earnings (3100), the standard bookkeeping technique for closing the books.
 */
function balanceBooks(accounts: Account[]): Account[] {
  const retainedEarnings = accounts.find((a) => a.code === '3100')
  if (!retainedEarnings) return accounts
  const totalAssets = totalByType(accounts, 'asset')
  const totalLiabilities = totalByType(accounts, 'liability')
  const totalRevenue = totalByType(accounts, 'revenue')
  const totalExpense = totalByType(accounts, 'expense')
  const equityExcludingRE = accounts
    .filter((a) => a.type === 'equity' && a.code !== '3100')
    .reduce((sum, a) => sum + a.balance, 0)
  retainedEarnings.balance = totalAssets - totalLiabilities - equityExcludingRE - (totalRevenue - totalExpense)
  return accounts
}

export function buildAccounts(): Account[] {
  const createdAt = pastDateISO(540)
  const accounts = CHART.map((a) => ({
    id: uid('acc_'),
    code: a.code,
    name: a.name,
    type: a.type,
    balance: nextInt(0, 50000),
    isActive: true,
    createdAt,
    updatedAt: createdAt
  }))

  // A demo company should read as profitable: revenue lands in a believable $1.2M-$1.6M
  // band, expenses run 75-85% of revenue, leaving a healthy net income.
  const revenueTotal = nextInt(1200000, 1600000)
  applyByCode(accounts, REVENUE_CODES, allocateWeighted(revenueTotal, REVENUE_WEIGHTS))

  const expenseTotal = Math.round(revenueTotal * (0.75 + nextFloat() * 0.1))
  applyByCode(accounts, EXPENSE_CODES, allocateWeighted(expenseTotal, EXPENSE_WEIGHTS))

  // Assets must be large enough, relative to the new revenue scale and the existing
  // liabilities (~$216k), to keep the Retained Earnings plug and total equity positive.
  // Accumulated Depreciation (a contra-asset) is carved out as a negative proportion of
  // gross fixed assets, so the gross total is inflated first to compensate before it nets
  // back down to the target net total.
  const netAssetsTarget = nextInt(900000, 1300000)
  const depreciationRatio = 0.2 + nextFloat() * 0.2
  const fixedAssetWeightShare = FIXED_ASSET_CODES.reduce(
    (sum, code) => sum + ASSET_WEIGHTS[ASSET_CODES.indexOf(code)],
    0
  )
  const grossAssetTotal = Math.round(netAssetsTarget / (1 - depreciationRatio * fixedAssetWeightShare))
  applyByCode(accounts, ASSET_CODES, allocateWeighted(grossAssetTotal, ASSET_WEIGHTS))

  const fixedAssetTotal = FIXED_ASSET_CODES.reduce(
    (sum, code) => sum + (accounts.find((a) => a.code === code)?.balance ?? 0),
    0
  )
  const accumulatedDepreciation = accounts.find((a) => a.code === '1600')
  if (accumulatedDepreciation) accumulatedDepreciation.balance = -Math.round(depreciationRatio * fixedAssetTotal)

  // Owner Draws (contra-equity) is a modest draw independent of the asset rescale.
  const ownerDraws = accounts.find((a) => a.code === '3200')
  if (ownerDraws) ownerDraws.balance = -nextInt(1000, 50000)

  return balanceBooks(accounts)
}

const JOURNAL_DESCRIPTIONS = [
  'Monthly payroll accrual',
  'Vendor payment - office supplies',
  'Depreciation - vehicles',
  'Bank fees',
  'Customer receipt applied',
  'Rent for period',
  'Inventory adjustment',
  'Utility bill payment',
  'Sales tax remittance',
  'Insurance premium accrual',
  'Loan interest accrual',
  'Marketing campaign spend'
]

export function buildJournalEntries(count: number, accounts: Account[]): JournalEntry[] {
  const pairs: [AccountType, AccountType][] = [
    ['asset', 'revenue'],
    ['expense', 'asset'],
    ['asset', 'liability'],
    ['expense', 'liability']
  ]
  // A handful of entries stay in draft so the Post workflow has something to demo.
  const draftCount = nextInt(6, 8)
  const draftIndices = new Set<number>()
  while (draftIndices.size < draftCount) {
    draftIndices.add(nextInt(0, count - 1))
  }
  return Array.from({ length: count }, (_, i) => {
    const pair = pick(pairs)
    const debit = accounts.find((a) => a.type === pair[0])
    const credit = accounts.find((a) => a.type === pair[1])
    const amount = nextInt(200, 20000)
    const date = pastDateISO(180)
    const description = pick(JOURNAL_DESCRIPTIONS)
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
      description,
      reference: `REF-${pad(nextInt(1, 9999), 4)}`,
      lines,
      status: draftIndices.has(i) ? 'draft' : 'posted',
      createdAt: date,
      updatedAt: date
    }
  })
}
