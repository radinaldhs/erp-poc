<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useManufacturingStore } from '@/stores/manufacturing'
import { useInventoryStore } from '@/stores/inventory'
import { useToast } from '@/composables/useToast'
import type { Bom, TableColumn } from '@/types'

const manufacturing = useManufacturingStore()
const inventory = useInventoryStore()
const toast = useToast()

const filters = reactive({ productId: '' })

const rows = computed(() =>
  manufacturing.boms
    .filter((b) => !filters.productId || b.productId === filters.productId)
    .map((b) => ({
      ...b,
      productName: inventory.productById(b.productId)?.name ?? '-',
      componentCount: b.components.length
    }))
)

const activeFilterCount = computed(() => (filters.productId ? 1 : 0))

function resetFilters(): void {
  filters.productId = ''
}

const columns: TableColumn<Bom & { productName: string; componentCount: number }>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'productName', label: 'Finished Good', sortable: true },
  { key: 'yieldQuantity', label: 'Yield', align: 'right' },
  { key: 'componentCount', label: 'Components', align: 'right' },
  { key: 'laborCost', label: 'Labor', align: 'right' }
]

const showCreate = ref(false)
const form = reactive({
  code: '',
  productId: '',
  yieldQuantity: 1,
  laborCost: 0,
  notes: ''
})

function openCreate(): void {
  form.code = `BOM-${String(manufacturing.boms.length + 1).padStart(3, '0')}`
  form.productId = inventory.products[0]?.id ?? ''
  form.yieldQuantity = 1
  form.laborCost = 0
  form.notes = ''
  showCreate.value = true
}

function save(): void {
  if (!form.productId) {
    toast.error('Finished good is required')
    return
  }
  const now = new Date().toISOString()
  manufacturing.addBom({
    id: uuid(),
    code: form.code,
    productId: form.productId,
    components: [],
    yieldQuantity: Number(form.yieldQuantity) || 1,
    laborCost: Number(form.laborCost) || 0,
    notes: form.notes,
    createdAt: now,
    updatedAt: now
  })
  toast.success('BOM created', form.code)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Bill of Materials" subtitle="Recipes for finished goods." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New BOM"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.productId"
        label="Finished Good"
        :options="[
          { value: '', label: 'Any product' },
          ...inventory.products.map((p) => ({ value: p.id, label: p.name }))
        ]"
      />
    </template>
    <template #cell-laborCost="{ row }">
      <CurrencyDisplay :value="row.laborCost" />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Bill of Materials"
    save-label="Create BOM"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.code" label="Code" required />
      <BaseSelect
        v-model="form.productId"
        label="Finished Good"
        :options="inventory.products.map((p) => ({ value: p.id, label: p.name }))"
        required
      />
      <BaseInput v-model.number="form.yieldQuantity" type="number" label="Yield Quantity" min="1" />
      <BaseInput v-model.number="form.laborCost" type="number" label="Labor Cost" />
    </div>
    <BaseTextarea v-model="form.notes" label="Notes" :rows="3" />
  </EntityFormModal>
</template>
