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
import { useInventoryStore } from '@/stores/inventory'
import { useManufacturingStore } from '@/stores/manufacturing'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import type { Product, TableColumn } from '@/types'

const inventory = useInventoryStore()
const manufacturing = useManufacturingStore()
const toast = useToast()
const confirmDialog = useConfirm()

const filters = reactive({ category: '', status: '' })

const rows = computed(() =>
  inventory.products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false
    if (filters.status && p.status !== filters.status) return false
    return true
  })
)

const categories = computed(() =>
  Array.from(new Set(inventory.products.map((p) => p.category))).filter(Boolean)
)

const activeFilterCount = computed(() =>
  (filters.category ? 1 : 0) + (filters.status ? 1 : 0)
)

function resetFilters(): void {
  filters.category = ''
  filters.status = ''
}

const columns: TableColumn<Product>[] = [
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'category', label: 'Category' },
  { key: 'unit', label: 'Unit' },
  { key: 'purchasePrice', label: 'Cost', align: 'right' },
  { key: 'salePrice', label: 'Price', align: 'right' },
  { key: 'reorderLevel', label: 'Reorder', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  sku: '',
  name: '',
  category: '',
  unit: 'ea',
  purchasePrice: 0,
  salePrice: 0,
  reorderLevel: 10,
  status: 'active' as 'active' | 'discontinued'
})

function openCreate(): void {
  editingId.value = null
  form.sku = `SKU-${String(inventory.products.length + 1).padStart(4, '0')}`
  form.name = ''
  form.category = categories.value[0] ?? 'General'
  form.unit = 'ea'
  form.purchasePrice = 0
  form.salePrice = 0
  form.reorderLevel = 10
  form.status = 'active'
  showModal.value = true
}

function openEdit(row: Product): void {
  editingId.value = row.id
  form.sku = row.sku
  form.name = row.name
  form.category = row.category
  form.unit = row.unit
  form.purchasePrice = row.purchasePrice
  form.salePrice = row.salePrice
  form.reorderLevel = row.reorderLevel
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
    const existing = inventory.productById(editingId.value)
    if (!existing) return
    inventory.updateProduct({
      ...existing,
      sku: form.sku,
      name: form.name,
      category: form.category,
      unit: form.unit,
      purchasePrice: Number(form.purchasePrice) || 0,
      salePrice: Number(form.salePrice) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      status: form.status,
      updatedAt: now
    })
    toast.success('Product updated', form.name)
  } else {
    inventory.addProduct({
      id: uuid(),
      sku: form.sku,
      name: form.name,
      category: form.category,
      unit: form.unit,
      purchasePrice: Number(form.purchasePrice) || 0,
      salePrice: Number(form.salePrice) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      status: form.status,
      createdAt: now,
      updatedAt: now
    })
    toast.success('Product created', form.name)
  }
  showModal.value = false
}

function hasReferences(productId: string): boolean {
  return (
    // Stock levels are seeded as a full product x warehouse cross join, so a row simply
    // existing doesn't mean the product actually holds or reserves any stock.
    inventory.stockLevels.some((sl) => sl.productId === productId && (sl.quantity > 0 || sl.reservedQuantity > 0)) ||
    inventory.stockMovements.some((m) => m.productId === productId) ||
    manufacturing.boms.some((b) => b.productId === productId || b.components.some((c) => c.productId === productId)) ||
    manufacturing.workOrders.some((w) => w.productId === productId)
  )
}

async function remove(row: Product): Promise<void> {
  if (hasReferences(row.id)) {
    toast.error('Cannot delete product', 'This product has stock, BOM, or work order records on file.')
    return
  }
  const ok = await confirmDialog.confirm({
    title: 'Delete this product?',
    message: `${row.name} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  inventory.deleteProduct(row.id)
  toast.success('Product deleted', row.name)
}
</script>

<template>
  <BasePageHeader title="Products" subtitle="Master list of SKUs available for sale and purchase." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Product"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openEdit"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.category"
        label="Category"
        :options="[
          { value: '', label: 'Any category' },
          ...categories.map((c) => ({ value: c, label: c }))
        ]"
      />
      <BaseSelect
        v-model="filters.status"
        label="Status"
        :options="[
          { value: '', label: 'Any status' },
          { value: 'active', label: 'Active' },
          { value: 'discontinued', label: 'Discontinued' }
        ]"
      />
    </template>
    <template #cell-purchasePrice="{ row }">
      <CurrencyDisplay :value="row.purchasePrice" />
    </template>
    <template #cell-salePrice="{ row }">
      <CurrencyDisplay :value="row.salePrice" />
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
    :title="editingId ? 'Edit Product' : 'New Product'"
    :save-label="editingId ? 'Save Changes' : 'Create Product'"
    @close="showModal = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.sku" label="SKU" required />
      <BaseInput v-model="form.name" label="Name" required />
      <BaseInput v-model="form.category" label="Category" />
      <BaseInput v-model="form.unit" label="Unit" />
      <BaseInput v-model.number="form.purchasePrice" type="number" label="Cost" />
      <BaseInput v-model.number="form.salePrice" type="number" label="Price" />
      <BaseInput v-model.number="form.reorderLevel" type="number" label="Reorder Level" />
      <BaseSelect
        v-model="form.status"
        label="Status"
        :options="[
          { value: 'active', label: 'Active' },
          { value: 'discontinued', label: 'Discontinued' }
        ]"
      />
    </div>
  </EntityFormModal>
</template>
