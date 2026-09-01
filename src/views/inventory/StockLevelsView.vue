<script setup lang="ts">
import { computed, reactive } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BarChart from '@/components/charts/BarChart.vue'
import { Package, AlertTriangle, Warehouse } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'
import { formatNumber } from '@/composables/useFormat'
import type { TableColumn } from '@/types'

const inventory = useInventoryStore()

interface StockRow {
  id: string
  sku: string
  name: string
  category: string
  warehouseId: string
  warehouse: string
  quantity: number
  reserved: number
  available: number
  reorderLevel: number
  low: boolean
}

const allRows = computed<StockRow[]>(() =>
  inventory.stockLevels.map((sl) => {
    const p = inventory.productById(sl.productId)
    const w = inventory.warehouseById(sl.warehouseId)
    const available = sl.quantity - sl.reservedQuantity
    return {
      id: sl.id,
      sku: p?.sku ?? '-',
      name: p?.name ?? '-',
      category: p?.category ?? 'Uncategorized',
      warehouseId: sl.warehouseId,
      warehouse: w?.name ?? '-',
      quantity: sl.quantity,
      reserved: sl.reservedQuantity,
      available,
      reorderLevel: p?.reorderLevel ?? 0,
      low: inventory.isLowStock(sl)
    }
  })
)

const filters = reactive({ warehouseId: '' })

const rows = computed(() =>
  allRows.value.filter((r) => !filters.warehouseId || r.warehouseId === filters.warehouseId)
)

const activeFilterCount = computed(() => (filters.warehouseId ? 1 : 0))

function resetFilters(): void {
  filters.warehouseId = ''
}

const columns: TableColumn<StockRow>[] = [
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'name', label: 'Name' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'quantity', label: 'On Hand', align: 'right' },
  { key: 'reserved', label: 'Reserved', align: 'right' },
  { key: 'available', label: 'Available', align: 'right' },
  { key: 'low', label: 'Status' }
]

const onHandByCategory = computed(() => {
  const totals: Record<string, number> = {}
  rows.value.forEach((row) => {
    totals[row.category] = (totals[row.category] ?? 0) + row.quantity
  })
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1])
  return { labels: entries.map((e) => e[0]), data: entries.map((e) => e[1]) }
})
</script>

<template>
  <BasePageHeader title="Stock Levels" subtitle="Current on-hand inventory across warehouses." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Stock Lines" :value="formatNumber(rows.length)" :icon="Package" tone="primary" />
    <BaseStatCard label="Low Stock" :value="formatNumber(inventory.lowStockCount)" :icon="AlertTriangle" tone="warning" />
    <BaseStatCard label="Warehouses" :value="formatNumber(inventory.warehouses.length)" :icon="Warehouse" tone="info" />
  </div>
  <BaseCard title="On-Hand by Category">
    <BarChart :labels="onHandByCategory.labels" :datasets="[{ label: 'Quantity', data: onHandByCategory.data }]" :height="240" />
  </BaseCard>
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    filterable
    :active-filter-count="activeFilterCount"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.warehouseId"
        label="Warehouse"
        :options="[
          { value: '', label: 'Any warehouse' },
          ...inventory.warehouses.map((w) => ({ value: w.id, label: w.name }))
        ]"
      />
    </template>
    <template #cell-low="{ row }">
      <BaseBadge :tone="row.low ? 'danger' : 'success'">{{ row.low ? 'Low Stock' : 'OK' }}</BaseBadge>
    </template>
  </BaseTable>
</template>
