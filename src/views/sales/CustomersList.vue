<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { Users, UserCheck, UserX } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/sales'
import { formatNumber } from '@/composables/useFormat'
import type { Customer, TableColumn } from '@/types'

const sales = useSalesStore()
const router = useRouter()

const rows = computed(() => sales.customers)
const activeCount = computed(() => rows.value.filter((c) => c.status === 'active').length)
const inactiveCount = computed(() => rows.value.filter((c) => c.status === 'inactive').length)

const columns: TableColumn<Customer>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'contact.email', label: 'Email' },
  { key: 'contact.phone', label: 'Phone' },
  { key: 'creditLimit', label: 'Credit Limit', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'status', label: 'Status' }
]

function openDetail(row: Customer): void {
  router.push({ name: 'customer-detail', params: { id: row.id } })
}
</script>

<template>
  <BasePageHeader title="Customers" subtitle="Business partners that purchase from Demo Company." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Total Customers" :value="formatNumber(rows.length)" :icon="Users" tone="primary" />
    <BaseStatCard label="Active" :value="formatNumber(activeCount)" :icon="UserCheck" tone="success" />
    <BaseStatCard label="Inactive" :value="formatNumber(inactiveCount)" :icon="UserX" tone="neutral" />
  </div>
  <BaseTable :columns="columns" :rows="rows" row-key="id" clickable @row-click="openDetail">
    <template #cell-creditLimit="{ row }">
      <CurrencyDisplay :value="row.creditLimit" />
    </template>
    <template #cell-balance="{ row }">
      <CurrencyDisplay :value="row.balance" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>
</template>
