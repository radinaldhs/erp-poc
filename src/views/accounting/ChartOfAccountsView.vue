<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useAccountingStore } from '@/stores/accounting'
import type { Account, TableColumn } from '@/types'

const accounting = useAccountingStore()
const rows = computed(() => accounting.accounts)

const columns: TableColumn<Account>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'isActive', label: 'Active' }
]

const typeTone = (t: Account['type']): 'primary' | 'warning' | 'info' | 'success' | 'danger' => {
  const map = { asset: 'primary', liability: 'warning', equity: 'info', revenue: 'success', expense: 'danger' } as const
  return map[t]
}
</script>

<template>
  <BasePageHeader title="Chart of Accounts" subtitle="Financial categorization used for journal posting." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-type="{ row }">
      <BaseBadge :tone="typeTone(row.type)" class="capitalize">{{ row.type }}</BaseBadge>
    </template>
    <template #cell-balance="{ row }">
      <CurrencyDisplay :value="row.balance" />
    </template>
    <template #cell-isActive="{ row }">
      <BaseBadge :tone="row.isActive ? 'success' : 'neutral'">{{ row.isActive ? 'Active' : 'Inactive' }}</BaseBadge>
    </template>
  </BaseTable>
</template>
