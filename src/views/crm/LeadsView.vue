<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { Sparkles, CheckCircle, UserPlus } from 'lucide-vue-next'
import { useCrmStore } from '@/stores/crm'
import { useToast } from '@/composables/useToast'
import { formatDate, formatNumber } from '@/composables/useFormat'
import type { Lead, LeadStatus, TableColumn } from '@/types'

const crm = useCrmStore()
const toast = useToast()

const filters = reactive({ status: '', source: '', owner: '' })

const rows = computed(() =>
  crm.leads.filter((l) => {
    if (filters.status && l.status !== filters.status) return false
    if (filters.source && l.source !== filters.source) return false
    if (filters.owner && l.owner !== filters.owner) return false
    return true
  })
)

const qualifiedCount = computed(() => crm.leads.filter((l) => l.status === 'qualified').length)
const convertedCount = computed(() => crm.leads.filter((l) => l.status === 'converted').length)

const activeFilterCount = computed(() =>
  (filters.status ? 1 : 0) + (filters.source ? 1 : 0) + (filters.owner ? 1 : 0)
)

function resetFilters(): void {
  filters.status = ''
  filters.source = ''
  filters.owner = ''
}

const columns: TableColumn<Lead>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'company', label: 'Company' },
  { key: 'contact.email', label: 'Email' },
  { key: 'source', label: 'Source' },
  { key: 'owner', label: 'Owner' },
  { key: 'createdAt', label: 'Created', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'status', label: 'Status' }
]

const sources = computed(() => Array.from(new Set(crm.leads.map((l) => l.source))).filter(Boolean))
const owners = computed(() => Array.from(new Set(crm.leads.map((l) => l.owner))).filter(Boolean))

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'converted', label: 'Converted' }
]

const showCreate = ref(false)
const form = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  source: 'Website',
  owner: '',
  status: 'new' as LeadStatus,
  notes: ''
})

function openCreate(): void {
  form.name = ''
  form.company = ''
  form.email = ''
  form.phone = ''
  form.source = 'Website'
  form.owner = owners.value[0] ?? 'Demo User'
  form.status = 'new'
  form.notes = ''
  showCreate.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  crm.addLead({
    id: uuid(),
    name: form.name,
    company: form.company,
    contact: { email: form.email, phone: form.phone },
    source: form.source,
    status: form.status,
    owner: form.owner,
    notes: form.notes,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Lead created', form.name)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Leads" subtitle="Prospective customers being nurtured by the sales team." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Total Leads" :value="formatNumber(crm.leads.length)" :icon="UserPlus" tone="primary" />
    <BaseStatCard label="Qualified" :value="formatNumber(qualifiedCount)" :icon="Sparkles" tone="warning" />
    <BaseStatCard label="Converted" :value="formatNumber(convertedCount)" :icon="CheckCircle" tone="success" />
  </div>
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Lead"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
      <BaseSelect
        v-model="filters.source"
        label="Source"
        :options="[
          { value: '', label: 'Any source' },
          ...sources.map((s) => ({ value: s, label: s }))
        ]"
      />
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
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Lead"
    save-label="Create Lead"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.name" label="Name" required />
      <BaseInput v-model="form.company" label="Company" />
      <BaseInput v-model="form.email" type="email" label="Email" />
      <BaseInput v-model="form.phone" label="Phone" />
      <BaseInput v-model="form.source" label="Source" />
      <BaseInput v-model="form.owner" label="Owner" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
