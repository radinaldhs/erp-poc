<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useSalesStore } from '@/stores/sales'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/composables/useFormat'
import type { Quote, TableColumn } from '@/types'

const sales = useSalesStore()
const router = useRouter()
const toast = useToast()

const filters = reactive({ status: '', customerId: '' })

const rows = computed(() =>
  sales.quotes.filter((q) => {
    if (filters.status && q.status !== filters.status) return false
    if (filters.customerId && q.customerId !== filters.customerId) return false
    return true
  })
)

const activeFilterCount = computed(() =>
  (filters.status ? 1 : 0) + (filters.customerId ? 1 : 0)
)

function resetFilters(): void {
  filters.status = ''
  filters.customerId = ''
}

const columns: TableColumn<Quote>[] = [
  { key: 'number', label: 'Quote #', sortable: true },
  { key: 'customerId', label: 'Customer', formatter: (v) => sales.customerById(String(v))?.name ?? '-' },
  { key: 'issueDate', label: 'Issued', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'total', label: 'Total', align: 'right', sortable: true },
  { key: 'status', label: 'Status' }
]

function openDetail(row: Quote): void {
  router.push({ name: 'quote-detail', params: { id: row.id } })
}

const customerOptions = computed(() => [
  { value: '', label: 'Any customer' },
  ...sales.customers.map((c) => ({ value: c.id, label: c.name }))
])

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
]

const showCreate = ref(false)
const form = reactive({
  number: '',
  customerId: '',
  issueDate: '',
  dueDate: '',
  status: 'draft' as Quote['status'],
  subtotal: 0,
  tax: 0
})

function openCreate(): void {
  const today = new Date().toISOString().slice(0, 10)
  const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  form.number = `Q-${String(sales.quotes.length + 1).padStart(5, '0')}`
  form.customerId = sales.customers[0]?.id ?? ''
  form.issueDate = today
  form.dueDate = due
  form.status = 'draft'
  form.subtotal = 0
  form.tax = 0
  showCreate.value = true
}

function save(): void {
  if (!form.customerId) {
    toast.error('Customer is required')
    return
  }
  const subtotal = Number(form.subtotal) || 0
  const tax = Number(form.tax) || 0
  const now = new Date().toISOString()
  sales.addQuote({
    id: uuid(),
    number: form.number,
    customerId: form.customerId,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    status: form.status,
    lineItems: [],
    subtotal,
    tax,
    total: subtotal + tax,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Quote created', form.number)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Quotes" subtitle="Quote proposals issued to customers." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Quote"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openDetail"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
      <BaseSelect v-model="filters.customerId" label="Customer" :options="customerOptions" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
    <template #cell-total="{ row }">
      <CurrencyDisplay :value="row.total" />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Quote"
    save-label="Create Quote"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.number" label="Quote #" required />
      <BaseSelect
        v-model="form.customerId"
        label="Customer"
        :options="sales.customers.map((c) => ({ value: c.id, label: c.name }))"
        required
      />
      <BaseInput v-model="form.issueDate" type="date" label="Issue Date" />
      <BaseInput v-model="form.dueDate" type="date" label="Due Date" />
      <BaseInput v-model.number="form.subtotal" type="number" label="Subtotal" />
      <BaseInput v-model.number="form.tax" type="number" label="Tax" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
