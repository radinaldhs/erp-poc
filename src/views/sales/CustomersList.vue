<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { Users, UserCheck, UserX } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/sales'
import { useToast } from '@/composables/useToast'
import { formatNumber } from '@/composables/useFormat'
import type { Customer, TableColumn } from '@/types'

const sales = useSalesStore()
const router = useRouter()
const toast = useToast()

const filters = reactive({ status: '', search: '' })

const rows = computed(() => {
  return sales.customers.filter((c) => {
    if (filters.status && c.status !== filters.status) return false
    return true
  })
})

const activeCount = computed(() => sales.customers.filter((c) => c.status === 'active').length)
const inactiveCount = computed(() => sales.customers.filter((c) => c.status === 'inactive').length)

const activeFilterCount = computed(() => (filters.status ? 1 : 0))

function resetFilters(): void {
  filters.status = ''
}

const columns: TableColumn<Customer>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'contact.email', label: 'Email' },
  { key: 'contact.phone', label: 'Phone' },
  { key: 'creditLimit', label: 'Credit Limit', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'status', label: 'Status' }
]

function openDetail(row: Customer): void {
  router.push({ name: 'customer-detail', params: { id: row.id } })
}

const showCreate = ref(false)
const form = reactive({
  code: '',
  name: '',
  email: '',
  phone: '',
  creditLimit: 0,
  status: 'active' as 'active' | 'inactive'
})

function openCreate(): void {
  form.code = `CUS-${String(sales.customers.length + 1).padStart(4, '0')}`
  form.name = ''
  form.email = ''
  form.phone = ''
  form.creditLimit = 0
  form.status = 'active'
  showCreate.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  sales.addCustomer({
    id: uuid(),
    code: form.code,
    name: form.name,
    contact: { email: form.email, phone: form.phone },
    billingAddress: { line1: '', city: '', state: '', postalCode: '', country: '' },
    creditLimit: Number(form.creditLimit) || 0,
    balance: 0,
    status: form.status,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Customer created', form.name)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Customers" subtitle="Business partners that purchase from Demo Company." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Total Customers" :value="formatNumber(sales.customers.length)" :icon="Users" tone="primary" />
    <BaseStatCard label="Active" :value="formatNumber(activeCount)" :icon="UserCheck" tone="success" />
    <BaseStatCard label="Inactive" :value="formatNumber(inactiveCount)" :icon="UserX" tone="neutral" />
  </div>
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Customer"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openDetail"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.status"
        label="Status"
        placeholder="Any status"
        :options="[
          { value: '', label: 'Any status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]"
      />
    </template>
    <template #cell-creditLimit="{ row }">
      <CurrencyDisplay :value="row.creditLimit" />
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
    title="New Customer"
    save-label="Create Customer"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.code" label="Code" required />
      <BaseInput v-model="form.name" label="Name" required />
      <BaseInput v-model="form.email" type="email" label="Email" />
      <BaseInput v-model="form.phone" label="Phone" />
      <BaseInput v-model.number="form.creditLimit" type="number" label="Credit Limit" />
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
