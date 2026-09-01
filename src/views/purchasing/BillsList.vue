<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { Trash2 } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { usePurchasingStore } from '@/stores/purchasing'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { formatDate } from '@/composables/useFormat'
import type { Bill, TableColumn } from '@/types'

const purchasing = usePurchasingStore()
const router = useRouter()
const toast = useToast()
const confirmDialog = useConfirm()

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
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' }
]

function openDetail(row: Bill): void {
  router.push({ name: 'bill-detail', params: { id: row.id } })
}

function canDelete(row: Bill): boolean {
  return row.status === 'draft' || row.status === 'cancelled'
}

async function remove(row: Bill): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Delete this bill?',
    message: `${row.number} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  purchasing.deleteBill(row.id)
  toast.success('Bill deleted', row.number)
}

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
  <BasePageHeader title="Bills" subtitle="Vendor invoices awaiting payment." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Bill"
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
    <template #cell-balance="{ row }">
      <CurrencyDisplay :value="row.balance" />
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
