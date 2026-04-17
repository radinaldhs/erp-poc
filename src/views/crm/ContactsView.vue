<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useCrmStore } from '@/stores/crm'
import { useToast } from '@/composables/useToast'
import type { Contact, TableColumn } from '@/types'

const crm = useCrmStore()
const toast = useToast()

const filters = reactive({ company: '' })

const allRows = computed(() =>
  crm.contacts.map((c) => ({ ...c, fullName: `${c.firstName} ${c.lastName}` }))
)

const rows = computed(() =>
  allRows.value.filter((c) => {
    if (filters.company && c.company !== filters.company) return false
    return true
  })
)

const companies = computed(() => Array.from(new Set(crm.contacts.map((c) => c.company))).filter(Boolean))

const activeFilterCount = computed(() => (filters.company ? 1 : 0))

function resetFilters(): void {
  filters.company = ''
}

const columns: TableColumn<Contact & { fullName: string }>[] = [
  { key: 'fullName', label: 'Name', sortable: true },
  { key: 'title', label: 'Title' },
  { key: 'company', label: 'Company' },
  { key: 'contact.email', label: 'Email' },
  { key: 'contact.phone', label: 'Phone' }
]

const showCreate = ref(false)
const form = reactive({
  firstName: '',
  lastName: '',
  company: '',
  title: '',
  email: '',
  phone: ''
})

function openCreate(): void {
  form.firstName = ''
  form.lastName = ''
  form.company = companies.value[0] ?? ''
  form.title = ''
  form.email = ''
  form.phone = ''
  showCreate.value = true
}

function save(): void {
  if (!form.firstName.trim() || !form.lastName.trim()) {
    toast.error('First name and last name are required')
    return
  }
  const now = new Date().toISOString()
  crm.addContact({
    id: uuid(),
    firstName: form.firstName,
    lastName: form.lastName,
    company: form.company,
    title: form.title,
    contact: { email: form.email, phone: form.phone },
    createdAt: now,
    updatedAt: now
  })
  toast.success('Contact created', `${form.firstName} ${form.lastName}`)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Contacts" subtitle="Key people across partner and customer accounts." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Contact"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.company"
        label="Company"
        :options="[
          { value: '', label: 'Any company' },
          ...companies.map((c) => ({ value: c, label: c }))
        ]"
      />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Contact"
    save-label="Create Contact"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.firstName" label="First Name" required />
      <BaseInput v-model="form.lastName" label="Last Name" required />
      <BaseInput v-model="form.title" label="Title" />
      <BaseInput v-model="form.company" label="Company" />
      <BaseInput v-model="form.email" type="email" label="Email" />
      <BaseInput v-model="form.phone" label="Phone" />
    </div>
  </EntityFormModal>
</template>
