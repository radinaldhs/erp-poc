<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { Check, X } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useHrStore } from '@/stores/hr'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { formatDate } from '@/composables/useFormat'
import type { LeaveRequest, TableColumn } from '@/types'

const hr = useHrStore()
const toast = useToast()
const confirmDialog = useConfirm()

const filters = reactive({ type: '', status: '', employeeId: '' })

const rows = computed(() =>
  hr.leaveRequests
    .filter((lr) => {
      if (filters.type && lr.type !== filters.type) return false
      if (filters.status && lr.status !== filters.status) return false
      if (filters.employeeId && lr.employeeId !== filters.employeeId) return false
      return true
    })
    .map((lr) => {
      const emp = hr.employeeById(lr.employeeId)
      return { ...lr, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '-' }
    })
)

const activeFilterCount = computed(() =>
  (filters.type ? 1 : 0) + (filters.status ? 1 : 0) + (filters.employeeId ? 1 : 0)
)

function resetFilters(): void {
  filters.type = ''
  filters.status = ''
  filters.employeeId = ''
}

const columns: TableColumn<LeaveRequest & { employeeName: string }>[] = [
  { key: 'employeeName', label: 'Employee', sortable: true },
  { key: 'type', label: 'Type' },
  { key: 'startDate', label: 'Start', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'endDate', label: 'End', formatter: (v) => formatDate(String(v)) },
  { key: 'days', label: 'Days', align: 'right' },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', width: '80px' }
]

async function approve(row: LeaveRequest): Promise<void> {
  const existing = hr.leaveRequests.find((lr) => lr.id === row.id)
  if (!existing) return
  const ok = await confirmDialog.confirm({
    title: 'Approve this leave request?',
    message: 'The request will be marked as approved.',
    tone: 'default'
  })
  if (!ok) return
  hr.updateLeave({ ...existing, status: 'approved', updatedAt: new Date().toISOString() })
  toast.success('Leave request approved')
}

async function reject(row: LeaveRequest): Promise<void> {
  const existing = hr.leaveRequests.find((lr) => lr.id === row.id)
  if (!existing) return
  const ok = await confirmDialog.confirm({
    title: 'Reject this leave request?',
    message: 'The request will be marked as rejected.',
    tone: 'danger'
  })
  if (!ok) return
  hr.updateLeave({ ...existing, status: 'rejected', updatedAt: new Date().toISOString() })
  toast.success('Leave request rejected')
}

const typeOptions = [
  { value: '', label: 'Any type' },
  { value: 'annual', label: 'Annual' },
  { value: 'sick', label: 'Sick' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'maternity', label: 'Maternity' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
]

const showCreate = ref(false)
const form = reactive({
  employeeId: '',
  type: 'annual' as LeaveRequest['type'],
  startDate: '',
  endDate: '',
  reason: '',
  status: 'pending' as LeaveRequest['status']
})

function daysBetween(a: string, b: string): number {
  if (!a || !b) return 0
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(1, Math.floor(ms / (24 * 60 * 60 * 1000)) + 1)
}

function openCreate(): void {
  const today = new Date().toISOString().slice(0, 10)
  form.employeeId = hr.employees[0]?.id ?? ''
  form.type = 'annual'
  form.startDate = today
  form.endDate = today
  form.reason = ''
  form.status = 'pending'
  showCreate.value = true
}

function save(): void {
  if (!form.employeeId) {
    toast.error('Employee is required')
    return
  }
  const now = new Date().toISOString()
  hr.addLeave({
    id: uuid(),
    employeeId: form.employeeId,
    type: form.type,
    startDate: form.startDate,
    endDate: form.endDate,
    days: daysBetween(form.startDate, form.endDate),
    reason: form.reason,
    status: form.status,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Leave request submitted')
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Leave Requests" subtitle="Time-off requests and approval states." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Request"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect v-model="filters.type" label="Type" :options="typeOptions" />
      <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
      <BaseSelect
        v-model="filters.employeeId"
        label="Employee"
        :options="[
          { value: '', label: 'Any employee' },
          ...hr.employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))
        ]"
      />
    </template>
    <template #cell-status="{ row }"><StatusPill :status="row.status" /></template>
    <template #cell-type="{ row }"><span class="capitalize">{{ row.type }}</span></template>
    <template #cell-actions="{ row }">
      <div v-if="row.status === 'pending'" class="flex justify-end gap-2">
        <button class="text-text-muted hover:text-success" @click.stop="approve(row)">
          <Check class="h-4 w-4" />
        </button>
        <button class="text-text-muted hover:text-danger" @click.stop="reject(row)">
          <X class="h-4 w-4" />
        </button>
      </div>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Leave Request"
    save-label="Submit Request"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseSelect
        v-model="form.employeeId"
        label="Employee"
        :options="hr.employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))"
        required
      />
      <BaseSelect v-model="form.type" label="Type" :options="typeOptions.slice(1)" />
      <BaseInput v-model="form.startDate" type="date" label="Start Date" />
      <BaseInput v-model="form.endDate" type="date" label="End Date" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
    <BaseTextarea v-model="form.reason" label="Reason" :rows="3" />
  </EntityFormModal>
</template>
