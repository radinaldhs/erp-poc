<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useInventoryStore } from '@/stores/inventory'
import { formatDate } from '@/composables/useFormat'
import type { StockMovement, TableColumn } from '@/types'

const inventory = useInventoryStore()

const rows = computed(() =>
  inventory.stockMovements.map((m) => ({
    ...m,
    productName: inventory.productById(m.productId)?.name ?? '-',
    warehouseName: inventory.warehouseById(m.warehouseId)?.name ?? '-'
  }))
)

const columns: TableColumn<StockMovement & { productName: string; warehouseName: string }>[] = [
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'reference', label: 'Reference' },
  { key: 'productName', label: 'Product' },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'type', label: 'Type' },
  { key: 'quantity', label: 'Qty', align: 'right' }
]

const typeTone = (t: StockMovement['type']): 'success' | 'danger' | 'info' | 'warning' => {
  if (t === 'in') return 'success'
  if (t === 'out') return 'danger'
  if (t === 'transfer') return 'info'
  return 'warning'
}
</script>

<template>
  <BasePageHeader title="Stock Movements" subtitle="Historic stock in, out, transfers, and adjustments." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-type="{ row }">
      <BaseBadge :tone="typeTone(row.type)" class="capitalize">{{ row.type }}</BaseBadge>
    </template>
  </BaseTable>
</template>
