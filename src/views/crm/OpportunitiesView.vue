<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import KanbanBoard from '@/components/shared/KanbanBoard.vue'
import { Target, TrendingUp, DollarSign } from 'lucide-vue-next'
import { useCrmStore } from '@/stores/crm'
import { formatCurrency, formatDate, formatNumber } from '@/composables/useFormat'
import type { OpportunityStage } from '@/types'

const crm = useCrmStore()

const STAGES: { key: OpportunityStage; label: string }[] = [
  { key: 'prospecting', label: 'Prospecting' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed_won', label: 'Closed Won' },
  { key: 'closed_lost', label: 'Closed Lost' }
]

const columns = computed(() =>
  STAGES.map((s) => ({
    key: s.key,
    label: s.label,
    items: crm.opportunities.filter((o) => o.stage === s.key)
  }))
)

const totalPipeline = computed(() =>
  crm.opportunities.filter((o) => o.stage !== 'closed_lost').reduce((s, o) => s + o.amount, 0)
)
const wonAmount = computed(() =>
  crm.opportunities.filter((o) => o.stage === 'closed_won').reduce((s, o) => s + o.amount, 0)
)
const winRate = computed(() => {
  const won = crm.opportunities.filter((o) => o.stage === 'closed_won').length
  const closed = crm.opportunities.filter((o) => o.stage.startsWith('closed')).length
  return closed === 0 ? 0 : (won / closed) * 100
})
</script>

<template>
  <BasePageHeader title="Opportunities" subtitle="Pipeline view of active deals grouped by stage." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Pipeline Value" :value="formatCurrency(totalPipeline)" :icon="Target" tone="primary" />
    <BaseStatCard label="Won Amount" :value="formatCurrency(wonAmount)" :icon="DollarSign" tone="success" />
    <BaseStatCard label="Win Rate" :value="`${formatNumber(winRate, 1)}%`" :icon="TrendingUp" tone="info" />
  </div>
  <KanbanBoard :columns="columns">
    <template #card="{ item }">
      <div>
        <p class="text-sm font-medium truncate">{{ item.name }}</p>
        <p class="text-[11px] text-text-muted truncate">{{ item.accountName }}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs font-semibold">{{ formatCurrency(item.amount) }}</span>
          <span class="text-[11px] text-text-muted">{{ item.probability }}%</span>
        </div>
        <p class="text-[11px] text-text-muted mt-1">Close {{ formatDate(item.closeDate) }}</p>
      </div>
    </template>
  </KanbanBoard>
</template>
