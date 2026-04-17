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
import { formatDate } from '@/composables/useFormat'
import type { Bill, TableColumn } from '@/types'

const purchasing = usePurchasingStore()
const toast = useToast()

const filters = reactive({ status: '', vendorId: '' })

const rows = computed(() =>
  purchasing.bills.filter((b) => {
    if (filters.status && b.status !== filters.status) return false
    if (filters.vendorId && b.vendorId !== filters.vendorId) return false
    return true
  })
)

const activeFilterCount = computed(() =>
  (filters.status ? 1 : 0) + (filters.vendorId ? 1 : 0)
)

function resetFilters(): void {
  filters.status = ''
  filters.vendorId = ''
}

const columns: TableColumn<Bill>[] = [
  { key: 'number', label: 'Bill #', sortable: true },
  { key: 'vendorId', label: 'Vendor', formatter: (v) => purchasing.vendorById(String(v))?.name ?? '-' },
  { key: 'issueDate', label: 'Issued', formatter: (v) => formatDate(String(v)) },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'status', label: 'Status' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' }
]

const showCreate = ref(false)
const form = reactive({
  number: '',
  vendorId: '',
  issueDate: '',
  dueDate: '',
  status: 'draft' as Bill['status'],
  subtotal: 0,
  tax: 0,
  paidAmount: 0
})

function openCreate(): void {
  const today = new Date().toISOString().slice(0, 10)
  const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  form.number = `BILL-${String(purchasing.bills.length + 1).padStart(5, '0')}`
  form.vendorId = purchasing.vendors[0]?.id ?? ''
  form.issueDate = today
  form.dueDate = due
  form.status = 'draft'
  form.subtotal = 0
  form.tax = 0
  form.paidAmount = 0
  showCreate.value = true
}

function save(): void {
  if (!form.vendorId) {
    toast.error('Vendor is required')
    return
  }
  const subtotal = Number(form.subtotal) || 0
  const tax = Number(form.tax) || 0
  const paid = Number(form.paidAmount) || 0
  const total = subtotal + tax
  const now = new Date().toISOString()
  purchasing.addBill({
    id: uuid(),
    number: form.number,
    vendorId: form.vendorId,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    status: form.status,
    lineItems: [],
    subtotal,
    tax,
    total,
    paidAmount: paid,
    balance: Math.max(0, total - paid),
    createdAt: now,
    updatedAt: now
  })
  toast.success('Bill created', form.number)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Bills" subtitle="Vendor invoices awaiting payment." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Bill"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
      <BaseSelect
        v-model="filters.vendorId"
        label="Vendor"
        :options="[
          { value: '', label: 'Any vendor' },
          ...purchasing.vendors.map((v) => ({ value: v.id, label: v.name }))
        ]"
      />
    </template>
    <template #cell-total="{ row }">
      <CurrencyDisplay :value="row.total" />
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
    title="New Bill"
    save-label="Create Bill"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.number" label="Bill #" required />
      <BaseSelect
        v-model="form.vendorId"
        label="Vendor"
        :options="purchasing.vendors.map((v) => ({ value: v.id, label: v.name }))"
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
