<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useHrStore } from '@/stores/hr'
import { useToast } from '@/composables/useToast'
import type { PayrollRun, TableColumn } from '@/types'

const hr = useHrStore()
const toast = useToast()

const filters = reactive({ employeeId: '', status: '', period: '' })

const rows = computed(() =>
  hr.payroll
    .filter((p) => {
      if (filters.employeeId && p.employeeId !== filters.employeeId) return false
      if (filters.status && p.status !== filters.status) return false
      if (filters.period && p.period !== filters.period) return false
      return true
    })
    .map((p) => {
      const emp = hr.employeeById(p.employeeId)
      return { ...p, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '-' }
    })
)

const periods = computed(() =>
  Array.from(new Set(hr.payroll.map((p) => p.period))).filter(Boolean)
)

const activeFilterCount = computed(() =>
  (filters.employeeId ? 1 : 0) + (filters.status ? 1 : 0) + (filters.period ? 1 : 0)
)

function resetFilters(): void {
  filters.employeeId = ''
  filters.status = ''
  filters.period = ''
}

const columns: TableColumn<PayrollRun & { employeeName: string }>[] = [
  { key: 'period', label: 'Period', sortable: true },
  { key: 'employeeName', label: 'Employee', sortable: true },
  { key: 'baseSalary', label: 'Base', align: 'right' },
  { key: 'allowances', label: 'Allowances', align: 'right' },
  { key: 'deductions', label: 'Deductions', align: 'right' },
  { key: 'net', label: 'Net', align: 'right' },
  { key: 'status', label: 'Status' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'finalized', label: 'Finalized' },
  { value: 'paid', label: 'Paid' }
]

const showCreate = ref(false)
const form = reactive({
  period: '',
  employeeId: '',
  baseSalary: 0,
  allowances: 0,
  deductions: 0,
  status: 'draft' as PayrollRun['status']
})

function openCreate(): void {
  const now = new Date()
  form.period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  form.employeeId = hr.employees[0]?.id ?? ''
  form.baseSalary = hr.employees[0]?.salary ?? 0
  form.allowances = 0
  form.deductions = 0
  form.status = 'draft'
  showCreate.value = true
}

function save(): void {
  if (!form.employeeId) {
    toast.error('Employee is required')
    return
  }
  const base = Number(form.baseSalary) || 0
  const allowances = Number(form.allowances) || 0
  const deductions = Number(form.deductions) || 0
  const now = new Date().toISOString()
  hr.addPayroll({
    id: uuid(),
    period: form.period,
    employeeId: form.employeeId,
    baseSalary: base,
    allowances,
    deductions,
    net: base + allowances - deductions,
    status: form.status,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Payroll run created', form.period)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Payroll" subtitle="Monthly payroll runs per employee." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Payroll Run"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.period"
        label="Period"
        :options="[
          { value: '', label: 'Any period' },
          ...periods.map((p) => ({ value: p, label: p }))
        ]"
      />
      <BaseSelect
        v-model="filters.employeeId"
        label="Employee"
        :options="[
          { value: '', label: 'Any employee' },
          ...hr.employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))
        ]"
      />
      <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
    </template>
    <template #cell-baseSalary="{ row }"><CurrencyDisplay :value="row.baseSalary" /></template>
    <template #cell-allowances="{ row }"><CurrencyDisplay :value="row.allowances" /></template>
    <template #cell-deductions="{ row }"><CurrencyDisplay :value="row.deductions" /></template>
    <template #cell-net="{ row }"><CurrencyDisplay :value="row.net" /></template>
    <template #cell-status="{ row }"><StatusPill :status="row.status" /></template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Payroll Run"
    save-label="Create Run"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.period" label="Period (YYYY-MM)" required />
      <BaseSelect
        v-model="form.employeeId"
        label="Employee"
        :options="hr.employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))"
        required
      />
      <BaseInput v-model.number="form.baseSalary" type="number" label="Base Salary" />
      <BaseInput v-model.number="form.allowances" type="number" label="Allowances" />
      <BaseInput v-model.number="form.deductions" type="number" label="Deductions" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
