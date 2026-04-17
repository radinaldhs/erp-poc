<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseProgress from '@/components/ui/BaseProgress.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useManufacturingStore } from '@/stores/manufacturing'
import { useInventoryStore } from '@/stores/inventory'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/composables/useFormat'
import type { TableColumn, WorkOrder } from '@/types'

const manufacturing = useManufacturingStore()
const inventory = useInventoryStore()
const toast = useToast()

const filters = reactive({ status: '', productId: '' })

const rows = computed(() =>
  manufacturing.workOrders
    .filter((w) => {
      if (filters.status && w.status !== filters.status) return false
      if (filters.productId && w.productId !== filters.productId) return false
      return true
    })
    .map((w) => ({
      ...w,
      productName: inventory.productById(w.productId)?.name ?? '-',
      progress: w.targetQuantity === 0 ? 0 : Math.round((w.producedQuantity / w.targetQuantity) * 100)
    }))
)

const activeFilterCount = computed(() =>
  (filters.status ? 1 : 0) + (filters.productId ? 1 : 0)
)

function resetFilters(): void {
  filters.status = ''
  filters.productId = ''
}

const columns: TableColumn<WorkOrder & { productName: string; progress: number }>[] = [
  { key: 'number', label: 'WO #', sortable: true },
  { key: 'productName', label: 'Product' },
  { key: 'targetQuantity', label: 'Target', align: 'right' },
  { key: 'producedQuantity', label: 'Produced', align: 'right' },
  { key: 'progress', label: 'Progress' },
  { key: 'startDate', label: 'Start', formatter: (v) => formatDate(String(v)) },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'assignee', label: 'Assignee' },
  { key: 'status', label: 'Status' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' }
]

const showCreate = ref(false)
const form = reactive({
  number: '',
  bomId: '',
  productId: '',
  targetQuantity: 1,
  producedQuantity: 0,
  startDate: '',
  dueDate: '',
  assignee: '',
  status: 'planned' as WorkOrder['status']
})

function openCreate(): void {
  const today = new Date().toISOString().slice(0, 10)
  const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  form.number = `WO-${String(manufacturing.workOrders.length + 1).padStart(5, '0')}`
  form.bomId = manufacturing.boms[0]?.id ?? ''
  form.productId = manufacturing.boms[0]?.productId ?? inventory.products[0]?.id ?? ''
  form.targetQuantity = 1
  form.producedQuantity = 0
  form.startDate = today
  form.dueDate = due
  form.assignee = ''
  form.status = 'planned'
  showCreate.value = true
}

function save(): void {
  if (!form.productId) {
    toast.error('Product is required')
    return
  }
  const now = new Date().toISOString()
  manufacturing.addWorkOrder({
    id: uuid(),
    number: form.number,
    bomId: form.bomId,
    productId: form.productId,
    targetQuantity: Number(form.targetQuantity) || 1,
    producedQuantity: Number(form.producedQuantity) || 0,
    startDate: form.startDate,
    dueDate: form.dueDate,
    status: form.status,
    assignee: form.assignee,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Work order created', form.number)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Work Orders" subtitle="Active production runs on the shop floor." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Work Order"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
      <BaseSelect
        v-model="filters.productId"
        label="Product"
        :options="[
          { value: '', label: 'Any product' },
          ...inventory.products.map((p) => ({ value: p.id, label: p.name }))
        ]"
      />
    </template>
    <template #cell-progress="{ row }">
      <div class="w-32">
        <BaseProgress :value="row.progress" />
        <span class="text-[11px] text-text-muted">{{ row.progress }}%</span>
      </div>
    </template>
    <template #cell-status="{ row }"><StatusPill :status="row.status" /></template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Work Order"
    save-label="Create Work Order"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.number" label="WO #" required />
      <BaseSelect
        v-model="form.bomId"
        label="BOM"
        :options="manufacturing.boms.map((b) => ({ value: b.id, label: b.code }))"
      />
      <BaseSelect
        v-model="form.productId"
        label="Product"
        :options="inventory.products.map((p) => ({ value: p.id, label: p.name }))"
        required
      />
      <BaseInput v-model.number="form.targetQuantity" type="number" label="Target Quantity" min="1" />
      <BaseInput v-model.number="form.producedQuantity" type="number" label="Produced Quantity" min="0" />
      <BaseInput v-model="form.startDate" type="date" label="Start Date" />
      <BaseInput v-model="form.dueDate" type="date" label="Due Date" />
      <BaseInput v-model="form.assignee" label="Assignee" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
