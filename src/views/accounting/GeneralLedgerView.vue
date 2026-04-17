<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useAccountingStore } from '@/stores/accounting'
import { formatDate } from '@/composables/useFormat'
import type { TableColumn } from '@/types'

const accounting = useAccountingStore()

interface LedgerRow {
  id: string
  date: string
  entryNumber: string
  account: string
  description: string
  debit: number
  credit: number
}

const rows = computed<LedgerRow[]>(() => {
  const out: LedgerRow[] = []
  accounting.journals.forEach((j) => {
    j.lines.forEach((line) => {
      out.push({
        id: line.id,
        date: j.date,
        entryNumber: j.number,
        account: accounting.byId(line.accountId)?.name ?? '-',
        description: line.description || j.description,
        debit: line.debit,
        credit: line.credit
      })
    })
  })
  return out
})

const columns: TableColumn<LedgerRow>[] = [
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'entryNumber', label: 'Entry #' },
  { key: 'account', label: 'Account' },
  { key: 'description', label: 'Description' },
  { key: 'debit', label: 'Debit', align: 'right' },
  { key: 'credit', label: 'Credit', align: 'right' }
]
</script>

<template>
  <BasePageHeader title="General Ledger" subtitle="Every posted line across all accounts." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-debit="{ row }">
      <CurrencyDisplay v-if="row.debit" :value="row.debit" />
    </template>
    <template #cell-credit="{ row }">
      <CurrencyDisplay v-if="row.credit" :value="row.credit" />
    </template>
  </BaseTable>
</template>
