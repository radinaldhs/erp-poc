<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useInventoryStore } from '@/stores/inventory'
import type { Product, TableColumn } from '@/types'

const inventory = useInventoryStore()
const rows = computed(() => inventory.products)

const columns: TableColumn<Product>[] = [
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'category', label: 'Category' },
  { key: 'unit', label: 'Unit' },
  { key: 'purchasePrice', label: 'Cost', align: 'right' },
  { key: 'salePrice', label: 'Price', align: 'right' },
  { key: 'reorderLevel', label: 'Reorder', align: 'right' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Products" subtitle="Master list of SKUs available for sale and purchase." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-purchasePrice="{ row }">
      <CurrencyDisplay :value="row.purchasePrice" />
    </template>
    <template #cell-salePrice="{ row }">
      <CurrencyDisplay :value="row.salePrice" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>
</template>
