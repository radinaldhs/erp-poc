<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import { useInventoryStore } from '@/stores/inventory'
import type { TableColumn, Warehouse } from '@/types'

const inventory = useInventoryStore()
const rows = computed(() => inventory.warehouses)

const columns: TableColumn<Warehouse>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'location', label: 'Location' },
  { key: 'manager', label: 'Manager' }
]
</script>

<template>
  <BasePageHeader title="Warehouses" subtitle="Physical storage locations for stock management." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id" />
</template>
