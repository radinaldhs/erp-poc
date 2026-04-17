<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useInventoryStore } from '@/stores/inventory'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/composables/useFormat'
import type { StockMovement, TableColumn } from '@/types'

const inventory = useInventoryStore()
const toast = useToast()

const filters = reactive({ type: '', productId: '', warehouseId: '' })

const allRows = computed(() =>
  inventory.stockMovements.map((m) => ({
    ...m,
    productName: inventory.productById(m.productId)?.name ?? '-',
    warehouseName: inventory.warehouseById(m.warehouseId)?.name ?? '-'
  }))
)

const rows = computed(() =>
  allRows.value.filter((m) => {
    if (filters.type && m.type !== filters.type) return false
    if (filters.productId && m.productId !== filters.productId) return false
    if (filters.warehouseId && m.warehouseId !== filters.warehouseId) return false
    return true
  })
)

const activeFilterCount = computed(() =>
  (filters.type ? 1 : 0) + (filters.productId ? 1 : 0) + (filters.warehouseId ? 1 : 0)
)

function resetFilters(): void {
  filters.type = ''
  filters.productId = ''
  filters.warehouseId = ''
}

const columns: TableColumn<StockMovement & { productName: string; warehouseName: string }>[] = [
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'reference', label: 'Reference' },
  { key: 'productName', label: 'Product' },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'type', label: 'Type' },
  { key: 'quantity', label: 'Qty', align: 'right' }
]

const typeTone = (t: StockMovement['type']): 'success' | 'danger' | 'info' | 'warning' => {
  if (t === 'in') return 'success'
  if (t === 'out') return 'danger'
  if (t === 'transfer') return 'info'
  return 'warning'
}

const typeOptions = [
  { value: '', label: 'Any type' },
  { value: 'in', label: 'In' },
  { value: 'out', label: 'Out' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'adjustment', label: 'Adjustment' }
]

const showCreate = ref(false)
const form = reactive({
  productId: '',
  warehouseId: '',
  type: 'in' as StockMovement['type'],
  quantity: 0,
  reference: '',
  date: '',
  notes: ''
})

function openCreate(): void {
  form.productId = inventory.products[0]?.id ?? ''
  form.warehouseId = inventory.warehouses[0]?.id ?? ''
  form.type = 'in'
  form.quantity = 1
  form.reference = ''
  form.date = new Date().toISOString().slice(0, 10)
  form.notes = ''
  showCreate.value = true
}

function save(): void {
  if (!form.productId || !form.warehouseId) {
    toast.error('Product and warehouse are required')
    return
  }
  const now = new Date().toISOString()
  inventory.addStockMovement({
    id: uuid(),
    productId: form.productId,
    warehouseId: form.warehouseId,
    type: form.type,
    quantity: Number(form.quantity) || 0,
    reference: form.reference,
    date: form.date,
    notes: form.notes,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Stock movement recorded')
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Stock Movements" subtitle="Historic stock in, out, transfers, and adjustments." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Movement"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect v-model="filters.type" label="Type" :options="typeOptions" />
      <BaseSelect
        v-model="filters.productId"
        label="Product"
        :options="[
          { value: '', label: 'Any product' },
          ...inventory.products.map((p) => ({ value: p.id, label: p.name }))
        ]"
      />
      <BaseSelect
        v-model="filters.warehouseId"
        label="Warehouse"
        :options="[
          { value: '', label: 'Any warehouse' },
          ...inventory.warehouses.map((w) => ({ value: w.id, label: w.name }))
        ]"
      />
    </template>
    <template #cell-type="{ row }">
      <BaseBadge :tone="typeTone(row.type)" class="capitalize">{{ row.type }}</BaseBadge>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Stock Movement"
    save-label="Record Movement"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseSelect
        v-model="form.productId"
        label="Product"
        :options="inventory.products.map((p) => ({ value: p.id, label: p.name }))"
        required
      />
      <BaseSelect
        v-model="form.warehouseId"
        label="Warehouse"
        :options="inventory.warehouses.map((w) => ({ value: w.id, label: w.name }))"
        required
      />
      <BaseSelect v-model="form.type" label="Type" :options="typeOptions.slice(1)" />
      <BaseInput v-model.number="form.quantity" type="number" label="Quantity" min="0" />
      <BaseInput v-model="form.reference" label="Reference" />
      <BaseInput v-model="form.date" type="date" label="Date" />
    </div>
    <BaseTextarea v-model="form.notes" label="Notes" :rows="3" />
  </EntityFormModal>
</template>
