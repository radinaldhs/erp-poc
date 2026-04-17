<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseProgress from '@/components/ui/BaseProgress.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { Briefcase, PlayCircle, CheckCircle2 } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/projects'
import { useToast } from '@/composables/useToast'
import { formatDate, formatNumber } from '@/composables/useFormat'
import type { Project, TableColumn } from '@/types'

const projects = useProjectStore()
const toast = useToast()

const filters = reactive({ status: '', manager: '', client: '' })

const rows = computed(() =>
  projects.projects.filter((p) => {
    if (filters.status && p.status !== filters.status) return false
    if (filters.manager && p.manager !== filters.manager) return false
    if (filters.client && p.client !== filters.client) return false
    return true
  })
)

const activeCount = computed(() => projects.projects.filter((p) => p.status === 'active').length)
const completedCount = computed(() => projects.projects.filter((p) => p.status === 'completed').length)

const managers = computed(() => Array.from(new Set(projects.projects.map((p) => p.manager))).filter(Boolean))
const clients = computed(() => Array.from(new Set(projects.projects.map((p) => p.client))).filter(Boolean))

const activeFilterCount = computed(() =>
  (filters.status ? 1 : 0) + (filters.manager ? 1 : 0) + (filters.client ? 1 : 0)
)

function resetFilters(): void {
  filters.status = ''
  filters.manager = ''
  filters.client = ''
}

const columns: TableColumn<Project>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'client', label: 'Client' },
  { key: 'manager', label: 'Manager' },
  { key: 'startDate', label: 'Start', formatter: (v) => formatDate(String(v)) },
  { key: 'endDate', label: 'End', formatter: (v) => formatDate(String(v)) },
  { key: 'budget', label: 'Budget', align: 'right' },
  { key: 'progress', label: 'Progress' },
  { key: 'status', label: 'Status' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const showCreate = ref(false)
const form = reactive({
  code: '',
  name: '',
  client: '',
  manager: '',
  startDate: '',
  endDate: '',
  budget: 0,
  status: 'planned' as Project['status']
})

function openCreate(): void {
  const today = new Date().toISOString().slice(0, 10)
  const later = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  form.code = `PRJ-${String(projects.projects.length + 1).padStart(4, '0')}`
  form.name = ''
  form.client = clients.value[0] ?? ''
  form.manager = managers.value[0] ?? ''
  form.startDate = today
  form.endDate = later
  form.budget = 0
  form.status = 'planned'
  showCreate.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  projects.addProject({
    id: uuid(),
    code: form.code,
    name: form.name,
    client: form.client,
    status: form.status,
    startDate: form.startDate,
    endDate: form.endDate,
    budget: Number(form.budget) || 0,
    actualCost: 0,
    progress: 0,
    manager: form.manager,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Project created', form.name)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Projects" subtitle="Engagements, budgets, and delivery progress." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Total Projects" :value="formatNumber(projects.projects.length)" :icon="Briefcase" tone="primary" />
    <BaseStatCard label="Active" :value="formatNumber(activeCount)" :icon="PlayCircle" tone="info" />
    <BaseStatCard label="Completed" :value="formatNumber(completedCount)" :icon="CheckCircle2" tone="success" />
  </div>
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Project"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
      <BaseSelect
        v-model="filters.manager"
        label="Manager"
        :options="[
          { value: '', label: 'Any manager' },
          ...managers.map((m) => ({ value: m, label: m }))
        ]"
      />
      <BaseSelect
        v-model="filters.client"
        label="Client"
        :options="[
          { value: '', label: 'Any client' },
          ...clients.map((c) => ({ value: c, label: c }))
        ]"
      />
    </template>
    <template #cell-budget="{ row }">
      <CurrencyDisplay :value="row.budget" />
    </template>
    <template #cell-progress="{ row }">
      <div class="w-40">
        <BaseProgress :value="row.progress" />
        <span class="text-[11px] text-text-muted">{{ row.progress }}%</span>
      </div>
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Project"
    save-label="Create Project"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.code" label="Code" required />
      <BaseInput v-model="form.name" label="Name" required />
      <BaseInput v-model="form.client" label="Client" />
      <BaseInput v-model="form.manager" label="Manager" />
      <BaseInput v-model="form.startDate" type="date" label="Start Date" />
      <BaseInput v-model="form.endDate" type="date" label="End Date" />
      <BaseInput v-model.number="form.budget" type="number" label="Budget" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
