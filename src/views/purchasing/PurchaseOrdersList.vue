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
import type { PurchaseOrder, TableColumn } from '@/types'

const purchasing = usePurchasingStore()
const toast = useToast()

const filters = reactive({ status: '', vendorId: '' })

const rows = computed(() =>
  purchasing.purchaseOrders.filter((p) => {
    if (filters.status && p.status !== filters.status) return false
    if (filters.vendorId && p.vendorId !== filters.vendorId) return false
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

const columns: TableColumn<PurchaseOrder>[] = [
  { key: 'number', label: 'PO #', sortable: true },
  { key: 'vendorId', label: 'Vendor', formatter: (v) => purchasing.vendorById(String(v))?.name ?? '-' },
  { key: 'issueDate', label: 'Issued', formatter: (v) => formatDate(String(v)) },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'status', label: 'Status' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'approved', label: 'Approved' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' }
]

const showCreate = ref(false)
const form = reactive({
  number: '',
  vendorId: '',
  issueDate: '',
  dueDate: '',
  status: 'draft' as PurchaseOrder['status'],
  subtotal: 0,
  tax: 0
})

function openCreate(): void {
  const today = new Date().toISOString().slice(0, 10)
  form.number = `PO-${String(purchasing.purchaseOrders.length + 1).padStart(5, '0')}`
  form.vendorId = purchasing.vendors[0]?.id ?? ''
  form.issueDate = today
  form.dueDate = today
  form.status = 'draft'
  form.subtotal = 0
  form.tax = 0
  showCreate.value = true
}

function save(): void {
  if (!form.vendorId) {
    toast.error('Vendor is required')
    return
  }
  const subtotal = Number(form.subtotal) || 0
  const tax = Number(form.tax) || 0
  const now = new Date().toISOString()
  purchasing.addPurchaseOrder({
    id: uuid(),
    number: form.number,
    vendorId: form.vendorId,
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
  toast.success('Purchase order created', form.number)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Purchase Orders" subtitle="Commitments issued to vendors." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New PO"
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
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Purchase Order"
    save-label="Create PO"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.number" label="PO #" required />
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
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
