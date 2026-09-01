<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { Trash2 } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useInventoryStore } from '@/stores/inventory'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import type { TableColumn, Warehouse } from '@/types'

const inventory = useInventoryStore()
const toast = useToast()
const confirmDialog = useConfirm()

const filters = reactive({ location: '' })

const rows = computed(() =>
  inventory.warehouses.filter((w) => !filters.location || w.location === filters.location)
)

const locations = computed(() =>
  Array.from(new Set(inventory.warehouses.map((w) => w.location))).filter(Boolean)
)

const activeFilterCount = computed(() => (filters.location ? 1 : 0))

function resetFilters(): void {
  filters.location = ''
}

const columns: TableColumn<Warehouse>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'location', label: 'Location' },
  { key: 'manager', label: 'Manager' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ code: '', name: '', location: '', manager: '' })

function openCreate(): void {
  editingId.value = null
  form.code = `WH-${String(inventory.warehouses.length + 1).padStart(3, '0')}`
  form.name = ''
  form.location = locations.value[0] ?? ''
  form.manager = ''
  showModal.value = true
}

function openEdit(row: Warehouse): void {
  editingId.value = row.id
  form.code = row.code
  form.name = row.name
  form.location = row.location
  form.manager = row.manager
  showModal.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  if (editingId.value) {
    const existing = inventory.warehouseById(editingId.value)
    if (!existing) return
    inventory.updateWarehouse({
      ...existing,
      code: form.code,
      name: form.name,
      location: form.location,
      manager: form.manager,
      updatedAt: now
    })
    toast.success('Warehouse updated', form.name)
  } else {
    inventory.addWarehouse({
      id: uuid(),
      code: form.code,
      name: form.name,
      location: form.location,
      manager: form.manager,
      createdAt: now,
      updatedAt: now
    })
    toast.success('Warehouse created', form.name)
  }
  showModal.value = false
}

async function remove(row: Warehouse): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Delete this warehouse?',
    message: `${row.name} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  inventory.deleteWarehouse(row.id)
  toast.success('Warehouse deleted', row.name)
}
</script>

<template>
  <BasePageHeader title="Warehouses" subtitle="Physical storage locations for stock management." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Warehouse"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openEdit"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.location"
        label="Location"
        :options="[
          { value: '', label: 'Any location' },
          ...locations.map((l) => ({ value: l, label: l }))
        ]"
      />
    </template>
    <template #cell-actions="{ row }">
      <button class="text-text-muted hover:text-danger" @click.stop="remove(row)">
        <Trash2 class="h-4 w-4" />
      </button>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showModal"
    :title="editingId ? 'Edit Warehouse' : 'New Warehouse'"
    :save-label="editingId ? 'Save Changes' : 'Create Warehouse'"
    @close="showModal = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.code" label="Code" required />
      <BaseInput v-model="form.name" label="Name" required />
      <BaseInput v-model="form.location" label="Location" />
      <BaseInput v-model="form.manager" label="Manager" />
    </div>
  </EntityFormModal>
</template>
