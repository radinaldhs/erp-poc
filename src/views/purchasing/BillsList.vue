<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { usePurchasingStore } from '@/stores/purchasing'
import { formatDate } from '@/composables/useFormat'
import type { Bill, TableColumn } from '@/types'

const purchasing = usePurchasingStore()
const rows = computed(() => purchasing.bills)

const columns: TableColumn<Bill>[] = [
  { key: 'number', label: 'Bill #', sortable: true },
  { key: 'vendorId', label: 'Vendor', formatter: (v) => purchasing.vendorById(String(v))?.name ?? '-' },
  { key: 'issueDate', label: 'Issued', formatter: (v) => formatDate(String(v)) },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Bills" subtitle="Vendor invoices awaiting payment." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-total="{ row }">
      <CurrencyDisplay :value="row.total" />
    </template>
    <template #cell-balance="{ row }">
      <CurrencyDisplay :value="row.balance" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>
</template>
