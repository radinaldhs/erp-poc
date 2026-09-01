<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { Trash2 } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useHrStore } from '@/stores/hr'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { formatDate } from '@/composables/useFormat'
import type { Employee, TableColumn } from '@/types'

const hr = useHrStore()
const toast = useToast()
const confirmDialog = useConfirm()

const filters = reactive({ departmentId: '', status: '' })

const rows = computed(() =>
  hr.employees
    .filter((e) => {
      if (filters.departmentId && e.departmentId !== filters.departmentId) return false
      if (filters.status && e.status !== filters.status) return false
      return true
    })
    .map((e) => ({
      ...e,
      fullName: `${e.firstName} ${e.lastName}`,
      departmentName: hr.departmentById(e.departmentId)?.name ?? '-'
    }))
)

const activeFilterCount = computed(() =>
  (filters.departmentId ? 1 : 0) + (filters.status ? 1 : 0)
)

function resetFilters(): void {
  filters.departmentId = ''
  filters.status = ''
}

const columns: TableColumn<Employee & { fullName: string; departmentName: string }>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'fullName', label: 'Name', sortable: true },
  { key: 'position', label: 'Position' },
  { key: 'departmentName', label: 'Department' },
  { key: 'hireDate', label: 'Hire Date', formatter: (v) => formatDate(String(v)) },
  { key: 'salary', label: 'Salary', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  code: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departmentId: '',
  position: '',
  hireDate: '',
  salary: 0,
  status: 'active' as Employee['status']
})

function openCreate(): void {
  editingId.value = null
  form.code = `EMP-${String(hr.employees.length + 1).padStart(4, '0')}`
  form.firstName = ''
  form.lastName = ''
  form.email = ''
  form.phone = ''
  form.departmentId = hr.departments[0]?.id ?? ''
  form.position = ''
  form.hireDate = new Date().toISOString().slice(0, 10)
  form.salary = 0
  form.status = 'active'
  showModal.value = true
}

function openEdit(row: Employee): void {
  editingId.value = row.id
  form.code = row.code
  form.firstName = row.firstName
  form.lastName = row.lastName
  form.email = row.contact.email
  form.phone = row.contact.phone
  form.departmentId = row.departmentId
  form.position = row.position
  form.hireDate = row.hireDate.slice(0, 10)
  form.salary = row.salary
  form.status = row.status
  showModal.value = true
}

function save(): void {
  if (!form.firstName.trim() || !form.lastName.trim()) {
    toast.error('First and last name are required')
    return
  }
  const now = new Date().toISOString()
  if (editingId.value) {
    const existing = hr.employeeById(editingId.value)
    if (!existing) return
    hr.updateEmployee({
      ...existing,
      code: form.code,
      firstName: form.firstName,
      lastName: form.lastName,
      contact: { email: form.email, phone: form.phone },
      departmentId: form.departmentId,
      position: form.position,
      hireDate: form.hireDate,
      salary: Number(form.salary) || 0,
      status: form.status,
      updatedAt: now
    })
    toast.success('Employee updated', `${form.firstName} ${form.lastName}`)
  } else {
    hr.addEmployee({
      id: uuid(),
      code: form.code,
      firstName: form.firstName,
      lastName: form.lastName,
      contact: { email: form.email, phone: form.phone },
      departmentId: form.departmentId,
      position: form.position,
      hireDate: form.hireDate,
      salary: Number(form.salary) || 0,
      status: form.status,
      createdAt: now,
      updatedAt: now
    })
    toast.success('Employee created', `${form.firstName} ${form.lastName}`)
  }
  showModal.value = false
}

function hasReferences(employeeId: string): boolean {
  return (
    hr.payroll.some((p) => p.employeeId === employeeId) ||
    hr.leaveRequests.some((lr) => lr.employeeId === employeeId)
  )
}

async function remove(row: Employee): Promise<void> {
  if (hasReferences(row.id)) {
    toast.error('Cannot delete employee', 'This employee has payroll or leave records on file.')
    return
  }
  const ok = await confirmDialog.confirm({
    title: 'Delete this employee?',
    message: `${row.firstName} ${row.lastName} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  hr.deleteEmployee(row.id)
  toast.success('Employee deleted', `${row.firstName} ${row.lastName}`)
}
</script>

<template>
  <BasePageHeader title="Employees" subtitle="Team roster across departments." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Employee"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openEdit"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.departmentId"
        label="Department"
        :options="[
          { value: '', label: 'Any department' },
          ...hr.departments.map((d) => ({ value: d.id, label: d.name }))
        ]"
      />
      <BaseSelect
        v-model="filters.status"
        label="Status"
        :options="[
          { value: '', label: 'Any status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]"
      />
    </template>
    <template #cell-salary="{ row }">
      <CurrencyDisplay :value="row.salary" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
    <template #cell-actions="{ row }">
      <button class="text-text-muted hover:text-danger" @click.stop="remove(row)">
        <Trash2 class="h-4 w-4" />
      </button>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showModal"
    :title="editingId ? 'Edit Employee' : 'New Employee'"
    :save-label="editingId ? 'Save Changes' : 'Create Employee'"
    @close="showModal = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.code" label="Code" required />
      <BaseInput v-model="form.firstName" label="First Name" required />
      <BaseInput v-model="form.lastName" label="Last Name" required />
      <BaseInput v-model="form.email" type="email" label="Email" />
      <BaseInput v-model="form.phone" label="Phone" />
      <BaseSelect
        v-model="form.departmentId"
        label="Department"
        :options="hr.departments.map((d) => ({ value: d.id, label: d.name }))"
      />
      <BaseInput v-model="form.position" label="Position" />
      <BaseInput v-model="form.hireDate" type="date" label="Hire Date" />
      <BaseInput v-model.number="form.salary" type="number" label="Salary" />
      <BaseSelect
        v-model="form.status"
        label="Status"
        :options="[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]"
      />
    </div>
  </EntityFormModal>
</template>
