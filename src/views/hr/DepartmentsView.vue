<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import { useHrStore } from '@/stores/hr'
import type { Department, TableColumn } from '@/types'

const hr = useHrStore()
const rows = computed(() => hr.departments)

const columns: TableColumn<Department>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'head', label: 'Head' },
  { key: 'headCount', label: 'Headcount', align: 'right' }
]
</script>

<template>
  <BasePageHeader title="Departments" subtitle="Organizational structure and headcount." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id" />
</template>
