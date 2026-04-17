<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useHrStore } from '@/stores/hr'
import type { PayrollRun, TableColumn } from '@/types'

const hr = useHrStore()

const rows = computed(() =>
  hr.payroll.map((p) => {
    const emp = hr.employeeById(p.employeeId)
    return { ...p, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '-' }
  })
)

const columns: TableColumn<PayrollRun & { employeeName: string }>[] = [
  { key: 'period', label: 'Period', sortable: true },
  { key: 'employeeName', label: 'Employee', sortable: true },
  { key: 'baseSalary', label: 'Base', align: 'right' },
  { key: 'allowances', label: 'Allowances', align: 'right' },
  { key: 'deductions', label: 'Deductions', align: 'right' },
  { key: 'net', label: 'Net', align: 'right' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Payroll" subtitle="Monthly payroll runs per employee." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-baseSalary="{ row }"><CurrencyDisplay :value="row.baseSalary" /></template>
    <template #cell-allowances="{ row }"><CurrencyDisplay :value="row.allowances" /></template>
    <template #cell-deductions="{ row }"><CurrencyDisplay :value="row.deductions" /></template>
    <template #cell-net="{ row }"><CurrencyDisplay :value="row.net" /></template>
    <template #cell-status="{ row }"><StatusPill :status="row.status" /></template>
  </BaseTable>
</template>
