<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseProgress from '@/components/ui/BaseProgress.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import { useManufacturingStore } from '@/stores/manufacturing'
import { useInventoryStore } from '@/stores/inventory'
import { formatDate } from '@/composables/useFormat'
import type { TableColumn, WorkOrder } from '@/types'

const manufacturing = useManufacturingStore()
const inventory = useInventoryStore()

const rows = computed(() =>
  manufacturing.workOrders.map((w) => ({
    ...w,
    productName: inventory.productById(w.productId)?.name ?? '-',
    progress: w.targetQuantity === 0 ? 0 : Math.round((w.producedQuantity / w.targetQuantity) * 100)
  }))
)

const columns: TableColumn<WorkOrder & { productName: string; progress: number }>[] = [
  { key: 'number', label: 'WO #', sortable: true },
  { key: 'productName', label: 'Product' },
  { key: 'targetQuantity', label: 'Target', align: 'right' },
  { key: 'producedQuantity', label: 'Produced', align: 'right' },
  { key: 'progress', label: 'Progress' },
  { key: 'startDate', label: 'Start', formatter: (v) => formatDate(String(v)) },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'assignee', label: 'Assignee' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Work Orders" subtitle="Active production runs on the shop floor." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-progress="{ row }">
      <div class="w-32">
        <BaseProgress :value="row.progress" />
        <span class="text-[11px] text-text-muted">{{ row.progress }}%</span>
      </div>
    </template>
    <template #cell-status="{ row }"><StatusPill :status="row.status" /></template>
  </BaseTable>
</template>
