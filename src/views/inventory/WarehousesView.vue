<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useInventoryStore } from '@/stores/inventory'
import { useToast } from '@/composables/useToast'
import type { TableColumn, Warehouse } from '@/types'

const inventory = useInventoryStore()
const toast = useToast()

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
  { key: 'manager', label: 'Manager' }
]

const showCreate = ref(false)
const form = reactive({ code: '', name: '', location: '', manager: '' })

function openCreate(): void {
  form.code = `WH-${String(inventory.warehouses.length + 1).padStart(3, '0')}`
  form.name = ''
  form.location = locations.value[0] ?? ''
  form.manager = ''
  showCreate.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
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
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Warehouses" subtitle="Physical storage locations for stock management." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Warehouse"
    filterable
    :active-filter-count="activeFilterCount"
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
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Warehouse"
    save-label="Create Warehouse"
    @close="showCreate = false"
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
