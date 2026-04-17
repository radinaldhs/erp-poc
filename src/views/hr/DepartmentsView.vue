<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useHrStore } from '@/stores/hr'
import { useToast } from '@/composables/useToast'
import type { Department, TableColumn } from '@/types'

const hr = useHrStore()
const toast = useToast()

const filters = reactive({ head: '' })

const rows = computed(() =>
  hr.departments.filter((d) => !filters.head || d.head === filters.head)
)

const heads = computed(() =>
  Array.from(new Set(hr.departments.map((d) => d.head))).filter(Boolean)
)

const activeFilterCount = computed(() => (filters.head ? 1 : 0))

function resetFilters(): void {
  filters.head = ''
}

const columns: TableColumn<Department>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'head', label: 'Head' },
  { key: 'headCount', label: 'Headcount', align: 'right' }
]

const showCreate = ref(false)
const form = reactive({ code: '', name: '', head: '', headCount: 0 })

function openCreate(): void {
  form.code = `DEP-${String(hr.departments.length + 1).padStart(3, '0')}`
  form.name = ''
  form.head = ''
  form.headCount = 0
  showCreate.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  hr.addDepartment({
    id: uuid(),
    code: form.code,
    name: form.name,
    head: form.head,
    headCount: Number(form.headCount) || 0,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Department created', form.name)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Departments" subtitle="Organizational structure and headcount." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Department"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.head"
        label="Head"
        :options="[
          { value: '', label: 'Any head' },
          ...heads.map((h) => ({ value: h, label: h }))
        ]"
      />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Department"
    save-label="Create Department"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.code" label="Code" required />
      <BaseInput v-model="form.name" label="Name" required />
      <BaseInput v-model="form.head" label="Head" />
      <BaseInput v-model.number="form.headCount" type="number" label="Headcount" />
    </div>
  </EntityFormModal>
</template>
