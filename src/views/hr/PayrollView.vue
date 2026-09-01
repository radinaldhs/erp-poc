<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { Trash2 } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LineChart from '@/components/charts/LineChart.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useHrStore } from '@/stores/hr'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import type { PayrollRun, TableColumn } from '@/types'

const hr = useHrStore()
const toast = useToast()
const confirmDialog = useConfirm()

const payrollTrend = computed(() => {
  const totals: Record<string, number> = {}
  hr.payroll.forEach((p) => {
    totals[p.period] = (totals[p.period] ?? 0) + p.net
  })
  const periods = Object.keys(totals).sort()
  return { labels: periods, data: periods.map((p) => totals[p]) }
})

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
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', width: '160px' }
]

async function finalize(row: PayrollRun): Promise<void> {
  const existing = hr.payroll.find((p) => p.id === row.id)
  if (!existing) return
  const ok = await confirmDialog.confirm({
    title: 'Finalize this payroll run?',
    message: `${row.period} will be marked as finalized.`,
    tone: 'default'
  })
  if (!ok) return
  hr.updatePayroll({ ...existing, status: 'finalized', updatedAt: new Date().toISOString() })
  toast.success('Payroll run finalized', row.period)
}

async function markPaid(row: PayrollRun): Promise<void> {
  const existing = hr.payroll.find((p) => p.id === row.id)
  if (!existing) return
  const ok = await confirmDialog.confirm({
    title: 'Mark this payroll run as paid?',
    message: `${row.period} will be marked as paid.`,
    tone: 'default'
  })
  if (!ok) return
  hr.updatePayroll({ ...existing, status: 'paid', updatedAt: new Date().toISOString() })
  toast.success('Payroll run paid', row.period)
}

async function remove(row: PayrollRun): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Delete this payroll run?',
    message: `${row.period} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  hr.deletePayroll(row.id)
  toast.success('Payroll run deleted', row.period)
}

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'finalized', label: 'Finalized' },
  { value: 'paid', label: 'Paid' }
]

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  period: '',
  employeeId: '',
  baseSalary: 0,
  allowances: 0,
  deductions: 0,
  status: 'draft' as PayrollRun['status']
})

function openCreate(): void {
  editingId.value = null
  const now = new Date()
  form.period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  form.employeeId = hr.employees[0]?.id ?? ''
  form.baseSalary = hr.employees[0]?.salary ?? 0
  form.allowances = 0
  form.deductions = 0
  form.status = 'draft'
  showModal.value = true
}

function openEdit(row: PayrollRun): void {
  if (row.status !== 'draft') {
    toast.info('Only draft runs can be edited')
    return
  }
  editingId.value = row.id
  form.period = row.period
  form.employeeId = row.employeeId
  form.baseSalary = row.baseSalary
  form.allowances = row.allowances
  form.deductions = row.deductions
  form.status = row.status
  showModal.value = true
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
  if (editingId.value) {
    const existing = hr.payroll.find((p) => p.id === editingId.value)
    if (!existing) return
    hr.updatePayroll({
      ...existing,
      period: form.period,
      employeeId: form.employeeId,
      baseSalary: base,
      allowances,
      deductions,
      net: base + allowances - deductions,
      updatedAt: now
    })
    toast.success('Payroll run updated', form.period)
  } else {
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
  }
  showModal.value = false
}
</script>

<template>
  <BasePageHeader title="Payroll" subtitle="Monthly payroll runs per employee." />
  <BaseCard title="Net Payroll Cost by Period">
    <LineChart :labels="payrollTrend.labels" :datasets="[{ label: 'Net Payroll', data: payrollTrend.data }]" :height="240" />
  </BaseCard>
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Payroll Run"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openEdit"
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
    <template #cell-actions="{ row }">
      <div class="flex justify-end items-center gap-2">
        <BaseButton v-if="row.status === 'draft'" size="sm" variant="secondary" @click.stop="finalize(row)">Finalize</BaseButton>
        <BaseButton v-if="row.status === 'finalized'" size="sm" variant="success" @click.stop="markPaid(row)">Mark Paid</BaseButton>
        <button
          v-if="row.status === 'draft'"
          class="text-text-muted hover:text-danger"
          @click.stop="remove(row)"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showModal"
    :title="editingId ? 'Edit Payroll Run' : 'New Payroll Run'"
    :save-label="editingId ? 'Save Changes' : 'Create Run'"
    @close="showModal = false"
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
