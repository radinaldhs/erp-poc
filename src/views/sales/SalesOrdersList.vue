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
import type { SalesOrder, TableColumn } from '@/types'

const sales = useSalesStore()
const router = useRouter()
const toast = useToast()

const filters = reactive({ status: '', customerId: '' })

const rows = computed(() =>
  sales.salesOrders.filter((o) => {
    if (filters.status && o.status !== filters.status) return false
    if (filters.customerId && o.customerId !== filters.customerId) return false
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

const columns: TableColumn<SalesOrder>[] = [
  { key: 'number', label: 'Order #', sortable: true },
  { key: 'customerId', label: 'Customer', formatter: (v) => sales.customerById(String(v))?.name ?? '-' },
  { key: 'issueDate', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'total', label: 'Total', align: 'right', sortable: true },
  { key: 'status', label: 'Status' }
]

function openDetail(row: SalesOrder): void {
  router.push({ name: 'sales-order-detail', params: { id: row.id } })
}

const customerOptions = computed(() => [
  { value: '', label: 'Any customer' },
  ...sales.customers.map((c) => ({ value: c.id, label: c.name }))
])

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'sent', label: 'Sent' },
  { value: 'cancelled', label: 'Cancelled' }
]

const showCreate = ref(false)
const form = reactive({
  number: '',
  customerId: '',
  issueDate: '',
  dueDate: '',
  status: 'draft' as SalesOrder['status'],
  subtotal: 0,
  tax: 0
})

function openCreate(): void {
  const today = new Date().toISOString().slice(0, 10)
  form.number = `SO-${String(sales.salesOrders.length + 1).padStart(5, '0')}`
  form.customerId = sales.customers[0]?.id ?? ''
  form.issueDate = today
  form.dueDate = today
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
  sales.addSalesOrder({
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
  toast.success('Sales order created', form.number)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Sales Orders" subtitle="Confirmed orders ready for fulfillment." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Order"
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
    title="New Sales Order"
    save-label="Create Order"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.number" label="Order #" required />
      <BaseSelect
        v-model="form.customerId"
        label="Customer"
        :options="sales.customers.map((c) => ({ value: c.id, label: c.name }))"
        required
      />
      <BaseInput v-model="form.issueDate" type="date" label="Order Date" />
      <BaseInput v-model="form.dueDate" type="date" label="Delivery Date" />
      <BaseInput v-model.number="form.subtotal" type="number" label="Subtotal" />
      <BaseInput v-model.number="form.tax" type="number" label="Tax" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
