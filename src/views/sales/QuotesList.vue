<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useSalesStore } from '@/stores/sales'
import { formatDate } from '@/composables/useFormat'
import type { Quote, TableColumn } from '@/types'

const sales = useSalesStore()
const router = useRouter()

const rows = computed(() => sales.quotes)

const columns: TableColumn<Quote>[] = [
  { key: 'number', label: 'Quote #', sortable: true },
  { key: 'customerId', label: 'Customer', formatter: (v) => sales.customerById(String(v))?.name ?? '-' },
  { key: 'issueDate', label: 'Issued', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'total', label: 'Total', align: 'right', sortable: true },
  { key: 'status', label: 'Status' }
]

function openDetail(row: Quote): void {
  router.push({ name: 'quote-detail', params: { id: row.id } })
}
</script>

<template>
  <BasePageHeader title="Quotes" subtitle="Quote proposals issued to customers." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    @row-click="openDetail"
  >
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
    <template #cell-total="{ row }">
      <CurrencyDisplay :value="row.total" />
    </template>
  </BaseTable>
</template>
