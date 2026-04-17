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
import { FileText, DollarSign, AlertCircle } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/sales'
import { useToast } from '@/composables/useToast'
import { formatCurrency, formatDate, formatNumber } from '@/composables/useFormat'
import type { Invoice, TableColumn } from '@/types'

const sales = useSalesStore()
const router = useRouter()
const toast = useToast()

const filters = reactive({ status: '', customerId: '' })

const rows = computed(() =>
  sales.invoices.filter((i) => {
    if (filters.status && i.status !== filters.status) return false
    if (filters.customerId && i.customerId !== filters.customerId) return false
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

const totalOutstanding = computed(() => sales.totalReceivables)
const totalPaid = computed(() => sales.totalRevenue)

const columns: TableColumn<Invoice>[] = [
  { key: 'number', label: 'Invoice #', sortable: true },
  { key: 'customerId', label: 'Customer', formatter: (v) => sales.customerById(String(v))?.name ?? '-' },
  { key: 'issueDate', label: 'Issued', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'total', label: 'Total', align: 'right', sortable: true },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'status', label: 'Status' }
]

function openDetail(row: Invoice): void {
  router.push({ name: 'invoice-detail', params: { id: row.id } })
}

const customerOptions = computed(() => [
  { value: '', label: 'Any customer' },
  ...sales.customers.map((c) => ({ value: c.id, label: c.name }))
])

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' }
]

const showCreate = ref(false)
const form = reactive({
  number: '',
  customerId: '',
  issueDate: '',
  dueDate: '',
  status: 'draft' as Invoice['status'],
  subtotal: 0,
  tax: 0,
  paidAmount: 0
})

function openCreate(): void {
  const today = new Date().toISOString().slice(0, 10)
  const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  form.number = `INV-${String(sales.invoices.length + 1).padStart(5, '0')}`
  form.customerId = sales.customers[0]?.id ?? ''
  form.issueDate = today
  form.dueDate = due
  form.status = 'draft'
  form.subtotal = 0
  form.tax = 0
  form.paidAmount = 0
  showCreate.value = true
}

function save(): void {
  if (!form.customerId) {
    toast.error('Customer is required')
    return
  }
  const subtotal = Number(form.subtotal) || 0
  const tax = Number(form.tax) || 0
  const paidAmount = Number(form.paidAmount) || 0
  const total = subtotal + tax
  const now = new Date().toISOString()
  sales.addInvoice({
    id: uuid(),
    number: form.number,
    customerId: form.customerId,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    status: form.status,
    lineItems: [],
    subtotal,
    tax,
    total,
    paidAmount,
    balance: Math.max(0, total - paidAmount),
    createdAt: now,
    updatedAt: now
  })
  toast.success('Invoice created', form.number)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Invoices" subtitle="Billing records issued to customers." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Invoices" :value="formatNumber(sales.invoices.length)" :icon="FileText" tone="primary" />
    <BaseStatCard label="Outstanding" :value="formatCurrency(totalOutstanding)" :icon="AlertCircle" tone="warning" />
    <BaseStatCard label="Collected" :value="formatCurrency(totalPaid)" :icon="DollarSign" tone="success" />
  </div>
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Invoice"
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
    <template #cell-balance="{ row }">
      <CurrencyDisplay :value="row.balance" :class="row.balance > 0 ? 'text-warning' : 'text-text-muted'" />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Invoice"
    save-label="Create Invoice"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.number" label="Invoice #" required />
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
      <BaseInput v-model.number="form.paidAmount" type="number" label="Paid Amount" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
