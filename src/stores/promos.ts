import { defineStore } from 'pinia'
import { computed } from 'vue'
import { v4 as uuid } from 'uuid'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Promo, PromoAuditEntry, PromoStatus, UserRole } from '@/types'
import { statusRole } from '@/data/seedPromos'

interface SubmitPayload {
  promoName: string
  promoType: Promo['promoType']
  targetRegion: string
  targetCustomerSegment: string
  startDate: string
  endDate: string
  discountPercent: number
  estimatedBudget: number
  expectedRevenueUplift: number
  justification: string
  termsAndConditions: string
  submittedBy: string
}

const NEXT_STATUS: Record<PromoStatus, PromoStatus> = {
  Draft: 'Pending Area Manager',
  'Pending Area Manager': 'Pending Regional Manager',
  'Pending Regional Manager': 'Pending Finance Director',
  'Pending Finance Director': 'Approved',
  Approved: 'Approved',
  Rejected: 'Rejected'
}

export const usePromoStore = defineStore('promos', () => {
  const items = useStorage<Promo[]>(STORAGE_KEYS.promos, [])

  const byId = (id: string): Promo | undefined => items.value.find((p) => p.id === id)
  const pendingForRole = (role: UserRole): Promo[] =>
    items.value.filter((p) => statusRole(p.status) === role)

  const counts = computed(() => {
    const map: Record<PromoStatus, number> = {
      Draft: 0,
      'Pending Area Manager': 0,
      'Pending Regional Manager': 0,
      'Pending Finance Director': 0,
      Approved: 0,
      Rejected: 0
    }
    items.value.forEach((p) => {
      map[p.status]++
    })
    return map
  })

  const submit = (payload: SubmitPayload): Promo => {
    const now = new Date().toISOString()
    const entry: PromoAuditEntry = {
      id: uuid(),
      actor: payload.submittedBy,
      role: 'Sales',
      action: 'submit',
      comment: 'Submitted for review',
      timestamp: now,
      toStatus: 'Pending Area Manager'
    }
    const promo: Promo = {
      id: uuid(),
      ...payload,
      status: 'Pending Area Manager',
      auditLog: [entry],
      createdAt: now,
      updatedAt: now
    }
    items.value = [promo, ...items.value]
    return promo
  }

  const canActOn = (p: Promo, role: UserRole): boolean => {
    if (role === 'Admin') return true
    const required = statusRole(p.status)
    return required !== null && required === role
  }

  const approve = (id: string, actor: string, role: UserRole, comment?: string): boolean => {
    const target = byId(id)
    if (!target || !canActOn(target, role)) return false
    items.value = items.value.map((p) => {
      if (p.id !== id) return p
      const from = p.status
      const to = NEXT_STATUS[from]
      const now = new Date().toISOString()
      const log: PromoAuditEntry = {
        id: uuid(),
        actor,
        role,
        action: 'approve',
        comment,
        timestamp: now,
        fromStatus: from,
        toStatus: to
      }
      return { ...p, status: to, auditLog: [...p.auditLog, log], updatedAt: now }
    })
    return true
  }

  const reject = (id: string, actor: string, role: UserRole, comment?: string): boolean => {
    const target = byId(id)
    if (!target || !canActOn(target, role)) return false
    items.value = items.value.map((p) => {
      if (p.id !== id) return p
      const from = p.status
      const now = new Date().toISOString()
      const log: PromoAuditEntry = {
        id: uuid(),
        actor,
        role,
        action: 'reject',
        comment,
        timestamp: now,
        fromStatus: from,
        toStatus: 'Rejected'
      }
      return { ...p, status: 'Rejected' as PromoStatus, auditLog: [...p.auditLog, log], updatedAt: now }
    })
    return true
  }

  const comment = (id: string, actor: string, role: UserRole, text: string): void => {
    items.value = items.value.map((p) => {
      if (p.id !== id) return p
      const now = new Date().toISOString()
      const log: PromoAuditEntry = {
        id: uuid(),
        actor,
        role,
        action: 'comment',
        comment: text,
        timestamp: now
      }
      return { ...p, auditLog: [...p.auditLog, log], updatedAt: now }
    })
  }

  return { items, counts, byId, pendingForRole, submit, approve, reject, comment }
})
