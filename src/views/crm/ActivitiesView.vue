<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useCrmStore } from '@/stores/crm'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/composables/useFormat'
import type { Activity, TableColumn } from '@/types'

const crm = useCrmStore()
const toast = useToast()

const filters = reactive({ type: '', status: '', owner: '' })

const rows = computed(() =>
  crm.activities.filter((a) => {
    if (filters.type && a.type !== filters.type) return false
    if (filters.status && a.status !== filters.status) return false
    if (filters.owner && a.owner !== filters.owner) return false
    return true
  })
)

const activeFilterCount = computed(() =>
  (filters.type ? 1 : 0) + (filters.status ? 1 : 0) + (filters.owner ? 1 : 0)
)

function resetFilters(): void {
  filters.type = ''
  filters.status = ''
  filters.owner = ''
}

const owners = computed(() => Array.from(new Set(crm.activities.map((a) => a.owner))).filter(Boolean))

const columns: TableColumn<Activity>[] = [
  { key: 'subject', label: 'Subject', sortable: true },
  { key: 'type', label: 'Type' },
  { key: 'relatedTo', label: 'Related To' },
  { key: 'owner', label: 'Owner' },
  { key: 'dueDate', label: 'Due Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'status', label: 'Status' }
]

const typeOptions = [
  { value: '', label: 'Any type' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'open', label: 'Open' },
  { value: 'completed', label: 'Completed' }
]

const showCreate = ref(false)
const form = reactive({
  subject: '',
  type: 'call' as Activity['type'],
  dueDate: '',
  relatedTo: '',
  owner: '',
  status: 'open' as Activity['status'],
  notes: ''
})

function openCreate(): void {
  form.subject = ''
  form.type = 'call'
  form.dueDate = new Date().toISOString().slice(0, 10)
  form.relatedTo = ''
  form.owner = owners.value[0] ?? 'Demo User'
  form.status = 'open'
  form.notes = ''
  showCreate.value = true
}

function save(): void {
  if (!form.subject.trim()) {
    toast.error('Subject is required')
    return
  }
  const now = new Date().toISOString()
  crm.addActivity({
    id: uuid(),
    subject: form.subject,
    type: form.type,
    dueDate: form.dueDate,
    relatedTo: form.relatedTo,
    owner: form.owner,
    status: form.status,
    notes: form.notes,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Activity created', form.subject)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Activities" subtitle="Calls, meetings, emails, and follow-up tasks across CRM." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Activity"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect v-model="filters.type" label="Type" :options="typeOptions" />
      <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
      <BaseSelect
        v-model="filters.owner"
        label="Owner"
        :options="[
          { value: '', label: 'Any owner' },
          ...owners.map((o) => ({ value: o, label: o }))
        ]"
      />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
    <template #cell-type="{ row }">
      <span class="capitalize">{{ row.type }}</span>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Activity"
    save-label="Create Activity"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.subject" label="Subject" required />
      <BaseSelect v-model="form.type" label="Type" :options="typeOptions.slice(1)" />
      <BaseInput v-model="form.dueDate" type="date" label="Due Date" />
      <BaseInput v-model="form.relatedTo" label="Related To" />
      <BaseInput v-model="form.owner" label="Owner" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
    <BaseTextarea v-model="form.notes" label="Notes" :rows="3" />
  </EntityFormModal>
</template>
