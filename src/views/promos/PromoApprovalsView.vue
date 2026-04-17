<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { usePromoStore } from '@/stores/promos'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/composables/useFormat'
import type { Promo, TableColumn } from '@/types'

const promos = usePromoStore()
const auth = useAuthStore()
const router = useRouter()

const queue = computed<Promo[]>(() => {
  if (auth.currentRole === 'Admin') {
    return promos.items.filter((p) =>
      ['Pending Area Manager', 'Pending Regional Manager', 'Pending Finance Director'].includes(p.status)
    )
  }
  return promos.pendingForRole(auth.currentRole)
})

const columns: TableColumn<Promo>[] = [
  { key: 'promoName', label: 'Promo Name', sortable: true },
  { key: 'promoType', label: 'Type' },
  { key: 'submittedBy', label: 'Submitted By' },
  { key: 'targetRegion', label: 'Region' },
  { key: 'startDate', label: 'Start', formatter: (v) => formatDate(String(v)) },
  { key: 'estimatedBudget', label: 'Budget', align: 'right' },
  { key: 'status', label: 'Status' }
]

function openDetail(row: Promo): void {
  router.push({ name: 'promo-detail', params: { id: row.id } })
}
</script>

<template>
  <BasePageHeader
    :title="`Approval Queue — ${auth.currentRole}`"
    subtitle="Promos awaiting action from the current role. Use the role switcher in the top bar to try a different tier."
  />

  <BaseCard>
    <div class="flex items-center gap-2 text-sm">
      <span class="text-text-muted">Viewing queue for:</span>
      <BaseBadge tone="primary">{{ auth.currentRole }}</BaseBadge>
      <span class="text-text-muted">— {{ queue.length }} pending</span>
    </div>
  </BaseCard>

  <BaseTable
    :columns="columns"
    :rows="queue"
    empty-message="Nothing to approve at this level. Switch roles to try another tier."
    clickable
    row-key="id"
    :page-size="10"
    @row-click="openDetail"
  >
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
    <template #cell-estimatedBudget="{ row }">
      <CurrencyDisplay :value="row.estimatedBudget" />
    </template>
  </BaseTable>
</template>
