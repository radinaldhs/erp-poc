<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { Trash2, Plus } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useManufacturingStore } from '@/stores/manufacturing'
import { useInventoryStore } from '@/stores/inventory'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import type { Bom, BomComponent, TableColumn } from '@/types'

const manufacturing = useManufacturingStore()
const inventory = useInventoryStore()
const toast = useToast()
const confirmDialog = useConfirm()

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
  { key: 'laborCost', label: 'Labor', align: 'right' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  code: '',
  productId: '',
  yieldQuantity: 1,
  laborCost: 0,
  notes: '',
  components: [] as BomComponent[]
})

function addComponent(): void {
  form.components.push({ productId: inventory.products[0]?.id ?? '', quantity: 1, unit: 'pcs' })
}

function removeComponent(index: number): void {
  form.components.splice(index, 1)
}

function openCreate(): void {
  editingId.value = null
  form.code = `BOM-${String(manufacturing.boms.length + 1).padStart(3, '0')}`
  form.productId = inventory.products[0]?.id ?? ''
  form.yieldQuantity = 1
  form.laborCost = 0
  form.notes = ''
  form.components = []
  showModal.value = true
}

function openEdit(row: Bom): void {
  editingId.value = row.id
  form.code = row.code
  form.productId = row.productId
  form.yieldQuantity = row.yieldQuantity
  form.laborCost = row.laborCost
  form.notes = row.notes ?? ''
  form.components = row.components.map((c) => ({ ...c }))
  showModal.value = true
}

function save(): void {
  if (!form.productId) {
    toast.error('Finished good is required')
    return
  }
  if (form.components.some((c) => c.quantity < 1)) {
    toast.error('Component quantities must be at least 1')
    return
  }
  const now = new Date().toISOString()
  if (editingId.value) {
    const existing = manufacturing.bomById(editingId.value)
    if (!existing) return
    manufacturing.updateBom({
      ...existing,
      code: form.code,
      productId: form.productId,
      components: form.components,
      yieldQuantity: Number(form.yieldQuantity) || 1,
      laborCost: Number(form.laborCost) || 0,
      notes: form.notes,
      updatedAt: now
    })
    toast.success('BOM updated', form.code)
  } else {
    manufacturing.addBom({
      id: uuid(),
      code: form.code,
      productId: form.productId,
      components: form.components,
      yieldQuantity: Number(form.yieldQuantity) || 1,
      laborCost: Number(form.laborCost) || 0,
      notes: form.notes,
      createdAt: now,
      updatedAt: now
    })
    toast.success('BOM created', form.code)
  }
  showModal.value = false
}

async function remove(row: Bom): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Delete this BOM?',
    message: `${row.code} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  manufacturing.deleteBom(row.id)
  toast.success('BOM deleted', row.code)
}
</script>

<template>
  <BasePageHeader title="Bill of Materials" subtitle="Recipes for finished goods." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New BOM"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openEdit"
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
    <template #cell-actions="{ row }">
      <button class="text-text-muted hover:text-danger" @click.stop="remove(row)">
        <Trash2 class="h-4 w-4" />
      </button>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showModal"
    :title="editingId ? 'Edit Bill of Materials' : 'New Bill of Materials'"
    :save-label="editingId ? 'Save Changes' : 'Create BOM'"
    size="lg"
    @close="showModal = false"
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

    <div class="card overflow-x-auto scrollbar-thin">
      <table class="w-full min-w-[440px] text-sm">
        <thead class="bg-surface/60 text-text-muted text-xs uppercase tracking-wide">
          <tr>
            <th class="px-3 py-2 text-left">Component</th>
            <th class="px-3 py-2 text-right w-24">Quantity</th>
            <th class="px-3 py-2 text-left w-24">Unit</th>
            <th class="px-3 py-2 w-10" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(component, index) in form.components" :key="index" class="border-t border-border">
            <td class="px-3 py-2">
              <BaseSelect
                v-model="component.productId"
                :options="inventory.products.map((p) => ({ value: p.id, label: p.name }))"
              />
            </td>
            <td class="px-3 py-2">
              <input v-model.number="component.quantity" type="number" min="1" class="input-base !py-1 !text-sm text-right" />
            </td>
            <td class="px-3 py-2">
              <input v-model="component.unit" type="text" class="input-base !py-1 !text-sm" />
            </td>
            <td class="px-3 py-2">
              <button type="button" class="text-text-muted hover:text-danger" @click="removeComponent(index)">
                <Trash2 class="h-4 w-4" />
              </button>
            </td>
          </tr>
          <tr v-if="form.components.length === 0">
            <td colspan="4" class="px-3 py-6 text-center text-text-muted text-xs">No components yet</td>
          </tr>
        </tbody>
      </table>
      <div class="px-3 py-3 border-t border-border">
        <BaseButton type="button" variant="secondary" size="sm" @click="addComponent">
          <Plus class="h-4 w-4" /> Add Component
        </BaseButton>
      </div>
    </div>
  </EntityFormModal>
</template>
