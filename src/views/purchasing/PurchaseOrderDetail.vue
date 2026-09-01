<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Printer, Pencil } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import LineItemsEditor from '@/components/shared/LineItemsEditor.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { usePurchasingStore } from '@/stores/purchasing'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { formatDate } from '@/composables/useFormat'
import type { LineItem, PurchaseOrder } from '@/types'

const route = useRoute()
const router = useRouter()
const purchasing = usePurchasingStore()
const toast = useToast()
const confirmDialog = useConfirm()

const order = computed(() => purchasing.poById(String(route.params.id)))
const vendor = computed(() => (order.value ? purchasing.vendorById(order.value.vendorId) : null))

const isEditing = ref(false)
const editForm = reactive({ vendorId: '', issueDate: '', dueDate: '' })
const editLines = ref<LineItem[]>([])

const items = computed({
  get: () => (isEditing.value ? editLines.value : order.value?.lineItems ?? []),
  set: (v: LineItem[]) => {
    if (isEditing.value) editLines.value = v
  }
})

function printPage(): void {
  window.print()
}

const nextActions: Record<PurchaseOrder['status'], { label: string; to: PurchaseOrder['status']; variant: 'primary' | 'success' | 'danger' }[]> = {
  draft: [
    { label: 'Send', to: 'sent', variant: 'primary' },
    { label: 'Cancel', to: 'cancelled', variant: 'danger' }
  ],
  sent: [
    { label: 'Approve', to: 'approved', variant: 'success' },
    { label: 'Cancel', to: 'cancelled', variant: 'danger' }
  ],
  approved: [{ label: 'Mark Received', to: 'received', variant: 'success' }],
  received: [],
  cancelled: [],
  pending: [],
  paid: [],
  overdue: [],
  rejected: []
}

const availableActions = computed(() => (order.value ? nextActions[order.value.status] ?? [] : []))

async function transition(to: PurchaseOrder['status'], label: string): Promise<void> {
  if (!order.value) return
  const ok = await confirmDialog.confirm({
    title: `${label} this purchase order?`,
    message: `${order.value.number} will move to "${to}".`,
    tone: to === 'cancelled' ? 'danger' : 'default'
  })
  if (!ok) return
  purchasing.updatePurchaseOrder({ ...order.value, status: to, updatedAt: new Date().toISOString() })
  toast.success('Purchase order updated', `${order.value.number} is now ${to}`)
}

function startEdit(): void {
  if (!order.value) return
  editForm.vendorId = order.value.vendorId
  editForm.issueDate = order.value.issueDate.slice(0, 10)
  editForm.dueDate = order.value.dueDate.slice(0, 10)
  editLines.value = order.value.lineItems.map((i) => ({ ...i }))
  isEditing.value = true
}

function cancelEdit(): void {
  isEditing.value = false
}

function saveEdit(): void {
  if (!order.value) return
  if (!editForm.vendorId) {
    toast.error('Vendor is required')
    return
  }
  const subtotal = editLines.value.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const tax = editLines.value.reduce((s, i) => s + i.quantity * i.unitPrice * i.taxRate, 0)
  purchasing.updatePurchaseOrder({
    ...order.value,
    vendorId: editForm.vendorId,
    issueDate: editForm.issueDate,
    dueDate: editForm.dueDate,
    lineItems: editLines.value,
    subtotal,
    tax,
    total: subtotal + tax,
    updatedAt: new Date().toISOString()
  })
  toast.success('Purchase order updated', order.value.number)
  isEditing.value = false
}
</script>

<template>
  <div v-if="!order">
    <BasePageHeader title="Purchase Order Not Found" />
  </div>
  <div v-else>
    <BasePageHeader :title="`PO ${order.number}`" subtitle="Commitment issued to a vendor.">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'purchase-orders' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back
        </BaseButton>
        <BaseButton variant="outline" @click="printPage">
          <Printer class="h-4 w-4 mr-1" /> Print
        </BaseButton>
        <BaseButton v-if="order.status === 'draft' && !isEditing" variant="secondary" @click="startEdit">
          <Pencil class="h-4 w-4 mr-1" /> Edit
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <BaseCard title="Order Information" class="lg:col-span-2">
        <div v-if="!isEditing" class="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">Vendor</p>
            <p class="text-sm font-medium">{{ vendor?.name ?? '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Status</p>
            <StatusPill :status="order.status" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Issue Date</p>
            <p class="text-sm font-medium">{{ formatDate(order.issueDate) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Due Date</p>
            <p class="text-sm font-medium">{{ formatDate(order.dueDate) }}</p>
          </div>
        </div>
        <div v-else class="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <BaseSelect
            v-model="editForm.vendorId"
            label="Vendor"
            :options="purchasing.vendors.map((v) => ({ value: v.id, label: v.name }))"
          />
          <div />
          <BaseInput v-model="editForm.issueDate" type="date" label="Issue Date" />
          <BaseInput v-model="editForm.dueDate" type="date" label="Due Date" />
        </div>
      </BaseCard>

      <BaseCard title="Totals">
        <div class="text-sm space-y-2">
          <div class="flex justify-between"><span class="text-text-muted">Subtotal</span><CurrencyDisplay :value="order.subtotal" /></div>
          <div class="flex justify-between"><span class="text-text-muted">Tax</span><CurrencyDisplay :value="order.tax" /></div>
          <div class="flex justify-between font-semibold border-t border-border pt-2 text-base">
            <span>Total</span>
            <CurrencyDisplay :value="order.total" />
          </div>
        </div>
      </BaseCard>
    </div>

    <div class="mt-4">
      <LineItemsEditor v-model="items" :readonly="!isEditing" />
    </div>

    <BaseCard v-if="isEditing" class="mt-4 no-print">
      <div class="flex justify-end gap-2">
        <BaseButton variant="ghost" @click="cancelEdit">Cancel</BaseButton>
        <BaseButton variant="primary" @click="saveEdit">Save Changes</BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else-if="availableActions.length > 0" title="Actions" class="mt-4 no-print">
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-for="action in availableActions"
          :key="action.to"
          :variant="action.variant"
          @click="transition(action.to, action.label)"
        >
          {{ action.label }}
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
