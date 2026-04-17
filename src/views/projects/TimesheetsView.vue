<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { Clock, Users, Timer } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/projects'
import { useToast } from '@/composables/useToast'
import { formatDate, formatNumber } from '@/composables/useFormat'
import type { Timesheet, TableColumn } from '@/types'

const projects = useProjectStore()
const toast = useToast()

const filters = reactive({ projectId: '', employee: '' })

const allRows = computed(() =>
  projects.timesheets.map((t) => ({
    ...t,
    projectName: projects.projectById(t.projectId)?.name ?? '-'
  }))
)

const rows = computed(() =>
  allRows.value.filter((t) => {
    if (filters.projectId && t.projectId !== filters.projectId) return false
    if (filters.employee && t.employee !== filters.employee) return false
    return true
  })
)

const totalHours = computed(() => rows.value.reduce((s, t) => s + t.hours, 0))
const uniqueEmployees = computed(() => new Set(rows.value.map((t) => t.employee)).size)

const employees = computed(() => Array.from(new Set(projects.timesheets.map((t) => t.employee))).filter(Boolean))

const activeFilterCount = computed(() =>
  (filters.projectId ? 1 : 0) + (filters.employee ? 1 : 0)
)

function resetFilters(): void {
  filters.projectId = ''
  filters.employee = ''
}

const columns: TableColumn<Timesheet & { projectName: string }>[] = [
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'employee', label: 'Employee', sortable: true },
  { key: 'projectName', label: 'Project' },
  { key: 'hours', label: 'Hours', align: 'right', sortable: true },
  { key: 'notes', label: 'Notes' }
]

const showCreate = ref(false)
const form = reactive({
  projectId: '',
  taskId: '',
  employee: '',
  date: '',
  hours: 0,
  notes: ''
})

function openCreate(): void {
  form.projectId = projects.projects[0]?.id ?? ''
  form.taskId = ''
  form.employee = employees.value[0] ?? 'Demo User'
  form.date = new Date().toISOString().slice(0, 10)
  form.hours = 1
  form.notes = ''
  showCreate.value = true
}

function save(): void {
  if (!form.projectId) {
    toast.error('Project is required')
    return
  }
  const now = new Date().toISOString()
  projects.addTimesheet({
    id: uuid(),
    projectId: form.projectId,
    taskId: form.taskId,
    employee: form.employee,
    date: form.date,
    hours: Number(form.hours) || 0,
    notes: form.notes,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Timesheet entry created')
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Timesheets" subtitle="Hour logs across engagements and contributors." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Total Hours" :value="formatNumber(totalHours, 1)" :icon="Clock" tone="primary" />
    <BaseStatCard label="Entries" :value="formatNumber(rows.length)" :icon="Timer" tone="info" />
    <BaseStatCard label="Contributors" :value="formatNumber(uniqueEmployees)" :icon="Users" tone="success" />
  </div>
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Entry"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.projectId"
        label="Project"
        :options="[
          { value: '', label: 'Any project' },
          ...projects.projects.map((p) => ({ value: p.id, label: p.name }))
        ]"
      />
      <BaseSelect
        v-model="filters.employee"
        label="Employee"
        :options="[
          { value: '', label: 'Any employee' },
          ...employees.map((e) => ({ value: e, label: e }))
        ]"
      />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Timesheet Entry"
    save-label="Create Entry"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseSelect
        v-model="form.projectId"
        label="Project"
        :options="projects.projects.map((p) => ({ value: p.id, label: p.name }))"
        required
      />
      <BaseInput v-model="form.employee" label="Employee" />
      <BaseInput v-model="form.date" type="date" label="Date" />
      <BaseInput v-model.number="form.hours" type="number" label="Hours" min="0" />
    </div>
    <BaseTextarea v-model="form.notes" label="Notes" :rows="3" />
  </EntityFormModal>
</template>
