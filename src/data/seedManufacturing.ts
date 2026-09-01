import type { Bom, Product, WorkOrder } from '@/types'
import { futureDateISO, nextInt, pad, pastDateISO, pick, uid } from './prng'

export function buildBoms(products: Product[], count = 15): Bom[] {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = pastDateISO(300)
    return {
      id: uid('bm_'),
      code: `BOM-${pad(i + 1, 3)}`,
      productId: pick(products).id,
      components: Array.from({ length: nextInt(2, 5) }, () => ({
        productId: pick(products).id,
        quantity: nextInt(1, 10),
        unit: 'pcs'
      })),
      yieldQuantity: nextInt(10, 200),
      laborCost: nextInt(100, 1500),
      notes: '',
      createdAt,
      updatedAt: createdAt
    }
  })
}

/** Produced quantity must be coherent with status: planned hasn't started, completed hits the target exactly, and in-flight statuses sit partway through. */
function producedQuantityFor(status: WorkOrder['status'], targetQuantity: number): number {
  if (status === 'planned') return 0
  if (status === 'completed') return targetQuantity
  const pct = nextInt(10, 90) / 100
  return Math.round(targetQuantity * pct)
}

export function buildWorkOrders(boms: Bom[], count = 20): WorkOrder[] {
  return Array.from({ length: count }, (_, i) => {
    const bom = pick(boms)
    const createdAt = pastDateISO(60)
    const targetQuantity = nextInt(50, 500)
    const status = pick(['planned', 'in_progress', 'completed', 'on_hold'] as const)
    return {
      id: uid('wo_'),
      number: `WO-${pad(i + 1, 5)}`,
      bomId: bom.id,
      productId: bom.productId,
      targetQuantity,
      producedQuantity: producedQuantityFor(status, targetQuantity),
      startDate: pastDateISO(30),
      dueDate: futureDateISO(30),
      status,
      assignee: pick(['Parker Hayes', 'Taylor Nguyen', 'Morgan Davis', 'Jamie Brooks']),
      createdAt,
      updatedAt: createdAt
    }
  })
}
