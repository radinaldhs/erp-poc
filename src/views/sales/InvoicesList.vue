<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { FileText, DollarSign, AlertCircle } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/sales'
import { formatCurrency, formatDate, formatNumber } from '@/composables/useFormat'
import type { Invoice, TableColumn } from '@/types'

const sales = useSalesStore()
const router = useRouter()

const rows = computed(() => sales.invoices)

const totalOutstanding = computed(() => sales.totalReceivables)
const totalPaid = computed(() => sales.totalRevenue)

const columns: TableColumn<Invoice>[] = [
  { key: 'number', label: 'Invoice #', sortable: true },
  { key: 'customerId', label: 'Customer', formatter: (v) => sales.customerById(String(v))?.name ?? '-' },
  { key: 'issueDate', label: 'Issued', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'total', label: 'Total', align: 'right', sortable: true },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'status', label: 'Status' }
]

function openDetail(row: Invoice): void {
  router.push({ name: 'invoice-detail', params: { id: row.id } })
}
</script>

<template>
  <BasePageHeader title="Invoices" subtitle="Billing records issued to customers." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Invoices" :value="formatNumber(rows.length)" :icon="FileText" tone="primary" />
    <BaseStatCard label="Outstanding" :value="formatCurrency(totalOutstanding)" :icon="AlertCircle" tone="warning" />
    <BaseStatCard label="Collected" :value="formatCurrency(totalPaid)" :icon="DollarSign" tone="success" />
  </div>
  <BaseTable :columns="columns" :rows="rows" row-key="id" clickable @row-click="openDetail">
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
    <template #cell-total="{ row }">
      <CurrencyDisplay :value="row.total" />
    </template>
    <template #cell-balance="{ row }">
      <CurrencyDisplay :value="row.balance" :class="row.balance > 0 ? 'text-warning' : 'text-text-muted'" />
    </template>
  </BaseTable>
</template>
