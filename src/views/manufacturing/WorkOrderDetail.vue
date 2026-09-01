<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Printer, Pencil } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseProgress from '@/components/ui/BaseProgress.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useManufacturingStore } from '@/stores/manufacturing'
import { useInventoryStore } from '@/stores/inventory'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { formatDate } from '@/composables/useFormat'
import type { WorkOrder } from '@/types'

const route = useRoute()
const router = useRouter()
const manufacturing = useManufacturingStore()
const inventory = useInventoryStore()
const toast = useToast()
const confirmDialog = useConfirm()

const order = computed(() => manufacturing.workOrders.find((w) => w.id === String(route.params.id)))
const product = computed(() => (order.value ? inventory.productById(order.value.productId) : null))
const bom = computed(() => (order.value ? manufacturing.bomById(order.value.bomId) : null))
const progress = computed(() =>
  order.value && order.value.targetQuantity > 0
    ? Math.round((order.value.producedQuantity / order.value.targetQuantity) * 100)
    : 0
)

function printPage(): void {
  window.print()
}

const nextActions: Record<WorkOrder['status'], { label: string; run: (w: WorkOrder) => Partial<WorkOrder> }[]> = {
  planned: [
    { label: 'Start', run: () => ({ status: 'in_progress' }) },
    { label: 'Put On Hold', run: () => ({ status: 'on_hold' }) }
  ],
  in_progress: [
    { label: 'Complete', run: (w) => ({ status: 'completed', producedQuantity: Math.max(w.producedQuantity, w.targetQuantity) }) },
    { label: 'Put On Hold', run: () => ({ status: 'on_hold' }) }
  ],
  on_hold: [{ label: 'Resume', run: () => ({ status: 'in_progress' }) }],
  completed: []
}

const availableActions = computed(() => (order.value ? nextActions[order.value.status] ?? [] : []))

async function transition(label: string, run: (w: WorkOrder) => Partial<WorkOrder>): Promise<void> {
  if (!order.value) return
  const ok = await confirmDialog.confirm({
    title: `${label} this work order?`,
    message: `This will update ${order.value.number}.`,
    tone: 'default'
  })
  if (!ok) return
  manufacturing.updateWorkOrder({ ...order.value, ...run(order.value), updatedAt: new Date().toISOString() })
  toast.success('Work order updated', order.value.number)
}

const showEdit = ref(false)
const form = reactive({
  number: '',
  bomId: '',
  productId: '',
  targetQuantity: 1,
  producedQuantity: 0,
  startDate: '',
  dueDate: '',
  assignee: ''
})

function openEdit(): void {
  if (!order.value) return
  form.number = order.value.number
  form.bomId = order.value.bomId
  form.productId = order.value.productId
  form.targetQuantity = order.value.targetQuantity
  form.producedQuantity = order.value.producedQuantity
  form.startDate = order.value.startDate.slice(0, 10)
  form.dueDate = order.value.dueDate.slice(0, 10)
  form.assignee = order.value.assignee
  showEdit.value = true
}

function cancelEdit(): void {
  showEdit.value = false
}

function saveEdit(): void {
  if (!order.value) return
  if (!form.productId) {
    toast.error('Product is required')
    return
  }
  manufacturing.updateWorkOrder({
    ...order.value,
    number: form.number,
    bomId: form.bomId,
    productId: form.productId,
    targetQuantity: Number(form.targetQuantity) || 1,
    producedQuantity: Number(form.producedQuantity) || 0,
    startDate: form.startDate,
    dueDate: form.dueDate,
    assignee: form.assignee,
    updatedAt: new Date().toISOString()
  })
  toast.success('Work order updated', order.value.number)
  showEdit.value = false
}
</script>

<template>
  <div v-if="!order">
    <BasePageHeader title="Work Order Not Found" />
  </div>
  <div v-else>
    <BasePageHeader :title="`WO ${order.number}`" subtitle="Production run detail.">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'work-orders' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back
        </BaseButton>
        <BaseButton variant="outline" @click="printPage">
          <Printer class="h-4 w-4 mr-1" /> Print
        </BaseButton>
        <BaseButton v-if="order.status === 'planned'" variant="secondary" @click="openEdit">
          <Pencil class="h-4 w-4 mr-1" /> Edit
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <BaseCard title="Work Order Information" class="lg:col-span-2">
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">Product</p>
            <p class="text-sm font-medium">{{ product?.name ?? '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">BOM</p>
            <p class="text-sm font-medium">{{ bom?.code ?? '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Status</p>
            <StatusPill :status="order.status" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Assignee</p>
            <p class="text-sm font-medium">{{ order.assignee || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Start Date</p>
            <p class="text-sm font-medium">{{ formatDate(order.startDate) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Due Date</p>
            <p class="text-sm font-medium">{{ formatDate(order.dueDate) }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Quantities">
        <div class="text-sm space-y-3">
          <div class="flex justify-between"><span class="text-text-muted">Target</span><span>{{ order.targetQuantity }}</span></div>
          <div class="flex justify-between"><span class="text-text-muted">Produced</span><span>{{ order.producedQuantity }}</span></div>
          <div>
            <BaseProgress :value="progress" />
            <p class="text-xs text-text-muted mt-1">{{ progress }}% complete</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseCard v-if="availableActions.length > 0" title="Actions" class="mt-4 no-print">
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-for="action in availableActions"
          :key="action.label"
          variant="primary"
          @click="transition(action.label, action.run)"
        >
          {{ action.label }}
        </BaseButton>
      </div>
    </BaseCard>

    <EntityFormModal
      :open="showEdit"
      title="Edit Work Order"
      save-label="Save Changes"
      @close="cancelEdit"
      @submit="saveEdit"
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
      </div>
    </EntityFormModal>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
