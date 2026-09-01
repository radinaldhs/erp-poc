<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { Trash2, ClipboardList, DollarSign, PackageCheck } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { usePurchasingStore } from '@/stores/purchasing'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { formatCurrency, formatDate, formatNumber } from '@/composables/useFormat'
import type { PurchaseOrder, TableColumn } from '@/types'

const purchasing = usePurchasingStore()
const router = useRouter()
const toast = useToast()
const confirmDialog = useConfirm()

const openPOs = computed(() => purchasing.purchaseOrders.filter((p) => p.status !== 'received' && p.status !== 'cancelled'))
const totalCommitted = computed(() => openPOs.value.reduce((s, p) => s + p.total, 0))
const receivedCount = computed(() => purchasing.purchaseOrders.filter((p) => p.status === 'received').length)

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
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

function openDetail(row: PurchaseOrder): void {
  router.push({ name: 'purchase-order-detail', params: { id: row.id } })
}

function canDelete(row: PurchaseOrder): boolean {
  return row.status === 'draft' || row.status === 'cancelled'
}

async function remove(row: PurchaseOrder): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Delete this purchase order?',
    message: `${row.number} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  purchasing.deletePurchaseOrder(row.id)
  toast.success('Purchase order deleted', row.number)
}

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
  <BasePageHeader title="Purchase Orders" subtitle="Commitments issued to vendors." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Open POs" :value="formatNumber(openPOs.length)" :icon="ClipboardList" tone="primary" />
    <BaseStatCard label="Total Committed" :value="formatCurrency(totalCommitted)" :icon="DollarSign" tone="warning" />
    <BaseStatCard label="Received" :value="formatNumber(receivedCount)" :icon="PackageCheck" tone="success" />
  </div>
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New PO"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openDetail"
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
    <template #cell-actions="{ row }">
      <button
        v-if="canDelete(row)"
        class="text-text-muted hover:text-danger"
        @click.stop="remove(row)"
      >
        <Trash2 class="h-4 w-4" />
      </button>
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
