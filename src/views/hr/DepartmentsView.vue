<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { Trash2 } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useHrStore } from '@/stores/hr'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import type { Department, TableColumn } from '@/types'

const hr = useHrStore()
const toast = useToast()
const confirmDialog = useConfirm()

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
  { key: 'headCount', label: 'Headcount', align: 'right' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ code: '', name: '', head: '', headCount: 0 })

function openCreate(): void {
  editingId.value = null
  form.code = `DEP-${String(hr.departments.length + 1).padStart(3, '0')}`
  form.name = ''
  form.head = ''
  form.headCount = 0
  showModal.value = true
}

function openEdit(row: Department): void {
  editingId.value = row.id
  form.code = row.code
  form.name = row.name
  form.head = row.head
  form.headCount = row.headCount
  showModal.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  if (editingId.value) {
    const existing = hr.departmentById(editingId.value)
    if (!existing) return
    hr.updateDepartment({
      ...existing,
      code: form.code,
      name: form.name,
      head: form.head,
      headCount: Number(form.headCount) || 0,
      updatedAt: now
    })
    toast.success('Department updated', form.name)
  } else {
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
  }
  showModal.value = false
}

async function remove(row: Department): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Delete this department?',
    message: `${row.name} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  hr.deleteDepartment(row.id)
  toast.success('Department deleted', row.name)
}
</script>

<template>
  <BasePageHeader title="Departments" subtitle="Organizational structure and headcount." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Department"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openEdit"
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
    <template #cell-actions="{ row }">
      <button class="text-text-muted hover:text-danger" @click.stop="remove(row)">
        <Trash2 class="h-4 w-4" />
      </button>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showModal"
    :title="editingId ? 'Edit Department' : 'New Department'"
    :save-label="editingId ? 'Save Changes' : 'Create Department'"
    @close="showModal = false"
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
