<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { Package, AlertTriangle, Warehouse } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'
import { formatNumber } from '@/composables/useFormat'
import type { TableColumn } from '@/types'

const inventory = useInventoryStore()

interface StockRow {
  id: string
  sku: string
  name: string
  warehouse: string
  quantity: number
  reserved: number
  available: number
  reorderLevel: number
  low: boolean
}

const rows = computed<StockRow[]>(() =>
  inventory.stockLevels.map((sl) => {
    const p = inventory.productById(sl.productId)
    const w = inventory.warehouseById(sl.warehouseId)
    const available = sl.quantity - sl.reservedQuantity
    return {
      id: sl.id,
      sku: p?.sku ?? '-',
      name: p?.name ?? '-',
      warehouse: w?.name ?? '-',
      quantity: sl.quantity,
      reserved: sl.reservedQuantity,
      available,
      reorderLevel: p?.reorderLevel ?? 0,
      low: available < (p?.reorderLevel ?? 0)
    }
  })
)

const columns: TableColumn<StockRow>[] = [
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'name', label: 'Name' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'quantity', label: 'On Hand', align: 'right' },
  { key: 'reserved', label: 'Reserved', align: 'right' },
  { key: 'available', label: 'Available', align: 'right' },
  { key: 'low', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Stock Levels" subtitle="Current on-hand inventory across warehouses." phase-tag="Phase 2 — Roadmap" />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Stock Lines" :value="formatNumber(rows.length)" :icon="Package" tone="primary" />
    <BaseStatCard label="Low Stock" :value="formatNumber(inventory.lowStockCount)" :icon="AlertTriangle" tone="warning" />
    <BaseStatCard label="Warehouses" :value="formatNumber(inventory.warehouses.length)" :icon="Warehouse" tone="info" />
  </div>
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-low="{ row }">
      <BaseBadge :tone="row.low ? 'danger' : 'success'">{{ row.low ? 'Low Stock' : 'OK' }}</BaseBadge>
    </template>
  </BaseTable>
</template>
