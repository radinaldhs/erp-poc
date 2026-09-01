<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
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
import type { TableColumn, Vendor } from '@/types'

const purchasing = usePurchasingStore()
const toast = useToast()
const confirmDialog = useConfirm()

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
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  code: '',
  name: '',
  email: '',
  phone: '',
  status: 'active' as 'active' | 'inactive'
})

function openCreate(): void {
  editingId.value = null
  form.code = `VEN-${String(purchasing.vendors.length + 1).padStart(4, '0')}`
  form.name = ''
  form.email = ''
  form.phone = ''
  form.status = 'active'
  showModal.value = true
}

function openEdit(row: Vendor): void {
  editingId.value = row.id
  form.code = row.code
  form.name = row.name
  form.email = row.contact.email
  form.phone = row.contact.phone
  form.status = row.status
  showModal.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  if (editingId.value) {
    const existing = purchasing.vendorById(editingId.value)
    if (!existing) return
    purchasing.updateVendor({
      ...existing,
      code: form.code,
      name: form.name,
      contact: { email: form.email, phone: form.phone },
      status: form.status,
      updatedAt: now
    })
    toast.success('Vendor updated', form.name)
  } else {
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
  }
  showModal.value = false
}

function hasReferences(vendorId: string): boolean {
  return (
    purchasing.purchaseOrders.some((po) => po.vendorId === vendorId) ||
    purchasing.bills.some((b) => b.vendorId === vendorId)
  )
}

async function remove(row: Vendor): Promise<void> {
  if (hasReferences(row.id)) {
    toast.error('Cannot delete vendor', 'This vendor has purchase orders or bills on record.')
    return
  }
  const ok = await confirmDialog.confirm({
    title: 'Delete this vendor?',
    message: `${row.name} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  purchasing.deleteVendor(row.id)
  toast.success('Vendor deleted', row.name)
}
</script>

<template>
  <BasePageHeader title="Vendors" subtitle="Suppliers that fulfill purchase orders." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Vendor"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openEdit"
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
    <template #cell-actions="{ row }">
      <button class="text-text-muted hover:text-danger" @click.stop="remove(row)">
        <Trash2 class="h-4 w-4" />
      </button>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showModal"
    :title="editingId ? 'Edit Vendor' : 'New Vendor'"
    :save-label="editingId ? 'Save Changes' : 'Create Vendor'"
    @close="showModal = false"
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
