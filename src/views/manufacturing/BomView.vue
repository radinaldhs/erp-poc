<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useManufacturingStore } from '@/stores/manufacturing'
import { useInventoryStore } from '@/stores/inventory'
import type { Bom, TableColumn } from '@/types'

const manufacturing = useManufacturingStore()
const inventory = useInventoryStore()

const rows = computed(() =>
  manufacturing.boms.map((b) => ({
    ...b,
    productName: inventory.productById(b.productId)?.name ?? '-',
    componentCount: b.components.length
  }))
)

const columns: TableColumn<Bom & { productName: string; componentCount: number }>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'productName', label: 'Finished Good', sortable: true },
  { key: 'yieldQuantity', label: 'Yield', align: 'right' },
  { key: 'componentCount', label: 'Components', align: 'right' },
  { key: 'laborCost', label: 'Labor', align: 'right' }
]
</script>

<template>
  <BasePageHeader title="Bill of Materials" subtitle="Recipes for finished goods." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-laborCost="{ row }">
      <CurrencyDisplay :value="row.laborCost" />
    </template>
  </BaseTable>
</template>
