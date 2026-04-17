import type { Promo, PromoAuditEntry, PromoStatus, PromoType, UserRole } from '@/types'
import { nextInt, pastDateISO, pick, uid } from './prng'

const PROMO_TYPES: PromoType[] = ['Discount', 'Bundle', 'Cashback', 'Gift']
const REGIONS = ['Region A', 'Region B', 'Region C', 'Region D', 'Region E', 'Nationwide']
const SEGMENTS = ['Retail', 'Wholesale', 'Corporate', 'Online']
const SUBMITTERS = ['Alex Carter', 'Maya Patel', 'Jordan Lee', 'Riley Chen', 'Taylor Nguyen']

const STATUS_PLAN: PromoStatus[] = [
  'Draft',
  'Draft',
  'Draft',
  'Pending Area Manager',
  'Pending Area Manager',
  'Pending Regional Manager',
  'Pending Regional Manager',
  'Pending Finance Director',
  'Pending Finance Director',
  'Approved',
  'Approved',
  'Approved',
  'Approved',
  'Rejected',
  'Rejected'
]

const ROLE_FOR: Record<PromoStatus, UserRole | null> = {
  Draft: 'Sales',
  'Pending Area Manager': 'Area Manager',
  'Pending Regional Manager': 'Regional Manager',
  'Pending Finance Director': 'Finance Director',
  Approved: null,
  Rejected: null
}

function auditFor(status: PromoStatus, submitter: string): PromoAuditEntry[] {
  const base: PromoAuditEntry[] = []
  const submittedAt = pastDateISO(60)
  base.push({
    id: uid('al_'),
    actor: submitter,
    role: 'Sales',
    action: 'submit',
    timestamp: submittedAt,
    toStatus: status === 'Draft' ? 'Draft' : 'Pending Area Manager',
    comment: 'Submitted for approval'
  })
  const chain: PromoStatus[] = ['Pending Area Manager', 'Pending Regional Manager', 'Pending Finance Director']
  const reachedIndex = status === 'Approved' ? 3 : status === 'Rejected' ? nextInt(1, 3) : chain.indexOf(status)
  const rolesForStep: UserRole[] = ['Area Manager', 'Regional Manager', 'Finance Director']
  const steps = Math.max(0, reachedIndex)
  for (let i = 0; i < steps; i++) {
    base.push({
      id: uid('al_'),
      actor: pick(['Jamie Brooks', 'Parker Hayes', 'Hunter Gray']),
      role: rolesForStep[i],
      action: 'approve',
      timestamp: pastDateISO(Math.max(1, 50 - i * 10)),
      fromStatus: chain[i],
      toStatus: chain[i + 1] ?? 'Approved',
      comment: 'Approved - aligns with strategy.'
    })
  }
  if (status === 'Rejected') {
    base.push({
      id: uid('al_'),
      actor: pick(['Jamie Brooks', 'Parker Hayes', 'Hunter Gray']),
      role: rolesForStep[Math.min(reachedIndex, 2)],
      action: 'reject',
      timestamp: pastDateISO(5),
      toStatus: 'Rejected',
      comment: 'Revisit pricing assumptions.'
    })
  }
  return base
}

function buildPromo(index: number): Promo {
  const status = STATUS_PLAN[index % STATUS_PLAN.length]
  const submitter = pick(SUBMITTERS)
  const start = pastDateISO(30)
  const end = new Date(start)
  end.setDate(end.getDate() + nextInt(15, 60))
  const createdAt = pastDateISO(60)
  return {
    id: uid('p_'),
    promoName: `${pick(['Spring', 'Summer', 'Year-End', 'Launch', 'Clearance'])} ${pick(PROMO_TYPES)} ${index + 1}`,
    promoType: pick(PROMO_TYPES),
    targetRegion: pick(REGIONS),
    targetCustomerSegment: pick(SEGMENTS),
    startDate: start,
    endDate: end.toISOString(),
    discountPercent: nextInt(5, 40),
    estimatedBudget: nextInt(5, 75) * 1000,
    expectedRevenueUplift: nextInt(15, 250) * 1000,
    justification:
      'Drive channel activation and increase market share in the targeted region using a controlled discount window.',
    termsAndConditions:
      'Eligible for targeted customers only. Cannot be combined with other promotions. Subject to stock availability.',
    submittedBy: submitter,
    status,
    auditLog: auditFor(status, submitter),
    createdAt,
    updatedAt: createdAt
  }
}

export function buildPromos(count = 15): Promo[] {
  return Array.from({ length: count }, (_, i) => buildPromo(i))
}

export function statusRole(status: PromoStatus): UserRole | null {
  return ROLE_FOR[status]
}
