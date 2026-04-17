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
import { usePurchasingStore } from '@/stores/purchasing'
import { useToast } from '@/composables/useToast'
import type { TableColumn, Vendor } from '@/types'

const purchasing = usePurchasingStore()
const toast = useToast()

const filters = reactive({ status: '' })

const rows = computed(() =>
  purchasing.vendors.filter((v) => !filters.status || v.status === filters.status)
)

const activeFilterCount = computed(() => (filters.status ? 1 : 0))

function resetFilters(): void {
  filters.status = ''
}

const columns: TableColumn<Vendor>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'contact.email', label: 'Email' },
  { key: 'contact.phone', label: 'Phone' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'status', label: 'Status' }
]

const showCreate = ref(false)
const form = reactive({
  code: '',
  name: '',
  email: '',
  phone: '',
  status: 'active' as 'active' | 'inactive'
})

function openCreate(): void {
  form.code = `VEN-${String(purchasing.vendors.length + 1).padStart(4, '0')}`
  form.name = ''
  form.email = ''
  form.phone = ''
  form.status = 'active'
  showCreate.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  purchasing.addVendor({
    id: uuid(),
    code: form.code,
    name: form.name,
    contact: { email: form.email, phone: form.phone },
    address: { line1: '', city: '', state: '', postalCode: '', country: '' },
    balance: 0,
    status: form.status,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Vendor created', form.name)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Vendors" subtitle="Suppliers that fulfill purchase orders." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Vendor"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
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
    <template #cell-balance="{ row }">
      <CurrencyDisplay :value="row.balance" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Vendor"
    save-label="Create Vendor"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.code" label="Code" required />
      <BaseInput v-model="form.name" label="Name" required />
      <BaseInput v-model="form.email" type="email" label="Email" />
      <BaseInput v-model="form.phone" label="Phone" />
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
