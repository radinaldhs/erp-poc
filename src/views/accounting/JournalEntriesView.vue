<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useAccountingStore } from '@/stores/accounting'
import { formatDate } from '@/composables/useFormat'
import type { JournalEntry, TableColumn } from '@/types'

const accounting = useAccountingStore()

const rows = computed(() =>
  accounting.journals.map((j) => ({
    ...j,
    totalDebit: j.lines.reduce((s, l) => s + l.debit, 0),
    totalCredit: j.lines.reduce((s, l) => s + l.credit, 0)
  }))
)

type Row = JournalEntry & { totalDebit: number; totalCredit: number }

const columns: TableColumn<Row>[] = [
  { key: 'number', label: 'Entry #', sortable: true },
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'reference', label: 'Reference' },
  { key: 'totalDebit', label: 'Debit', align: 'right' },
  { key: 'totalCredit', label: 'Credit', align: 'right' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Journal Entries" subtitle="Manual and system-posted ledger entries." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-totalDebit="{ row }">
      <CurrencyDisplay :value="row.totalDebit" />
    </template>
    <template #cell-totalCredit="{ row }">
      <CurrencyDisplay :value="row.totalCredit" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>
</template>
