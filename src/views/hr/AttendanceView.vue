<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useHrStore } from '@/stores/hr'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/composables/useFormat'
import type { AttendanceRecord, TableColumn } from '@/types'

const hr = useHrStore()
const toast = useToast()

const filters = reactive({ employeeId: '', status: '' })

const rows = computed(() =>
  hr.attendance
    .filter((a) => {
      if (filters.employeeId && a.employeeId !== filters.employeeId) return false
      if (filters.status && a.status !== filters.status) return false
      return true
    })
    .map((a) => {
      const emp = hr.employeeById(a.employeeId)
      return { ...a, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '-' }
    })
)

const activeFilterCount = computed(() =>
  (filters.employeeId ? 1 : 0) + (filters.status ? 1 : 0)
)

function resetFilters(): void {
  filters.employeeId = ''
  filters.status = ''
}

const columns: TableColumn<AttendanceRecord & { employeeName: string }>[] = [
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'employeeName', label: 'Employee', sortable: true },
  { key: 'checkIn', label: 'Check In' },
  { key: 'checkOut', label: 'Check Out' },
  { key: 'status', label: 'Status' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'leave', label: 'Leave' }
]

const showCreate = ref(false)
const form = reactive({
  employeeId: '',
  date: '',
  checkIn: '09:00',
  checkOut: '17:00',
  status: 'present' as AttendanceRecord['status']
})

function openCreate(): void {
  form.employeeId = hr.employees[0]?.id ?? ''
  form.date = new Date().toISOString().slice(0, 10)
  form.checkIn = '09:00'
  form.checkOut = '17:00'
  form.status = 'present'
  showCreate.value = true
}

function save(): void {
  if (!form.employeeId) {
    toast.error('Employee is required')
    return
  }
  const now = new Date().toISOString()
  hr.addAttendance({
    id: uuid(),
    employeeId: form.employeeId,
    date: form.date,
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    status: form.status,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Attendance recorded')
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Attendance" subtitle="Daily check-in logs for the workforce." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Record"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
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
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Attendance Record"
    save-label="Record"
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
      <BaseInput v-model="form.date" type="date" label="Date" />
      <BaseInput v-model="form.checkIn" type="time" label="Check In" />
      <BaseInput v-model="form.checkOut" type="time" label="Check Out" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
