<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Download } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseDateRangePicker from '@/components/ui/BaseDateRangePicker.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useAccountingStore } from '@/stores/accounting'
import { formatDate } from '@/composables/useFormat'
import { downloadSheet } from '@/composables/useExcel'
import type { TableColumn } from '@/types'

const accounting = useAccountingStore()
const router = useRouter()

interface LedgerRow {
  id: string
  journalId: string
  date: string
  entryNumber: string
  account: string
  description: string
  debit: number
  credit: number
}

const today = new Date()
const start = new Date(today.getFullYear(), today.getMonth() - 2, 1)
const range = ref({
  start: start.toISOString().slice(0, 10),
  end: today.toISOString().slice(0, 10),
  preset: 'custom' as const
})

const allRows = computed<LedgerRow[]>(() => {
  const out: LedgerRow[] = []
  accounting.journals.forEach((j) => {
    j.lines.forEach((line) => {
      out.push({
        id: line.id,
        journalId: j.id,
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

const rows = computed(() => {
  const s = new Date(range.value.start).getTime()
  const e = new Date(range.value.end).getTime() + 86400000
  return allRows.value.filter((r) => {
    const t = new Date(r.date).getTime()
    return t >= s && t <= e
  })
})

const columns: TableColumn<LedgerRow>[] = [
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'entryNumber', label: 'Entry #' },
  { key: 'account', label: 'Account' },
  { key: 'description', label: 'Description' },
  { key: 'debit', label: 'Debit', align: 'right' },
  { key: 'credit', label: 'Credit', align: 'right' }
]

function openEntry(row: LedgerRow): void {
  router.push({ name: 'journal-detail', params: { id: row.journalId } })
}

function exportExcel(): void {
  downloadSheet('general-ledger.xlsx', rows.value.map(({ journalId: _journalId, ...rest }) => rest))
}
</script>

<template>
  <BasePageHeader title="General Ledger" subtitle="Every posted line across all accounts.">
    <template #actions>
      <BaseButton variant="secondary" @click="exportExcel">
        <Download class="h-4 w-4 mr-1" /> Export to Excel
      </BaseButton>
    </template>
  </BasePageHeader>
  <div class="flex justify-end">
    <BaseDateRangePicker v-model="range" />
  </div>
  <BaseTable :columns="columns" :rows="rows" row-key="id" clickable @row-click="openEntry">
    <template #cell-entryNumber="{ row }">
      <span class="text-primary hover:underline">{{ row.entryNumber }}</span>
    </template>
    <template #cell-debit="{ row }">
      <CurrencyDisplay v-if="row.debit" :value="row.debit" />
    </template>
    <template #cell-credit="{ row }">
      <CurrencyDisplay v-if="row.credit" :value="row.credit" />
    </template>
  </BaseTable>
</template>
