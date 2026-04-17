<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useSalesStore } from '@/stores/sales'
import { formatDate } from '@/composables/useFormat'
import type { SalesOrder, TableColumn } from '@/types'

const sales = useSalesStore()
const router = useRouter()

const rows = computed(() => sales.salesOrders)

const columns: TableColumn<SalesOrder>[] = [
  { key: 'number', label: 'Order #', sortable: true },
  { key: 'customerId', label: 'Customer', formatter: (v) => sales.customerById(String(v))?.name ?? '-' },
  { key: 'issueDate', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'total', label: 'Total', align: 'right', sortable: true },
  { key: 'status', label: 'Status' }
]

function openDetail(row: SalesOrder): void {
  router.push({ name: 'sales-order-detail', params: { id: row.id } })
}
</script>

<template>
  <BasePageHeader title="Sales Orders" subtitle="Confirmed orders ready for fulfillment." />
  <BaseTable :columns="columns" :rows="rows" row-key="id" clickable @row-click="openDetail">
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
    <template #cell-total="{ row }">
      <CurrencyDisplay :value="row.total" />
    </template>
  </BaseTable>
</template>
