<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useHrStore } from '@/stores/hr'
import { formatDate } from '@/composables/useFormat'
import type { Employee, TableColumn } from '@/types'

const hr = useHrStore()

const rows = computed(() =>
  hr.employees.map((e) => ({
    ...e,
    fullName: `${e.firstName} ${e.lastName}`,
    departmentName: hr.departmentById(e.departmentId)?.name ?? '-'
  }))
)

const columns: TableColumn<Employee & { fullName: string; departmentName: string }>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'fullName', label: 'Name', sortable: true },
  { key: 'position', label: 'Position' },
  { key: 'departmentName', label: 'Department' },
  { key: 'hireDate', label: 'Hire Date', formatter: (v) => formatDate(String(v)) },
  { key: 'salary', label: 'Salary', align: 'right' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Employees" subtitle="Team roster across departments." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-salary="{ row }">
      <CurrencyDisplay :value="row.salary" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>
</template>
