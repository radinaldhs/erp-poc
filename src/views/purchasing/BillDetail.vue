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
import type { Bill, LineItem } from '@/types'

const route = useRoute()
const router = useRouter()
const purchasing = usePurchasingStore()
const toast = useToast()
const confirmDialog = useConfirm()

const bill = computed(() => purchasing.billById(String(route.params.id)))
const vendor = computed(() => (bill.value ? purchasing.vendorById(bill.value.vendorId) : null))

const isEditing = ref(false)
const editForm = reactive({ vendorId: '', issueDate: '', dueDate: '' })
const editLines = ref<LineItem[]>([])

const items = computed({
  get: () => (isEditing.value ? editLines.value : bill.value?.lineItems ?? []),
  set: (v: LineItem[]) => {
    if (isEditing.value) editLines.value = v
  }
})

function printPage(): void {
  window.print()
}

function startEdit(): void {
  if (!bill.value) return
  editForm.vendorId = bill.value.vendorId
  editForm.issueDate = bill.value.issueDate.slice(0, 10)
  editForm.dueDate = bill.value.dueDate.slice(0, 10)
  editLines.value = bill.value.lineItems.map((i) => ({ ...i }))
  isEditing.value = true
}

function cancelEdit(): void {
  isEditing.value = false
}

function saveEdit(): void {
  if (!bill.value) return
  if (!editForm.vendorId) {
    toast.error('Vendor is required')
    return
  }
  const subtotal = editLines.value.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const tax = editLines.value.reduce((s, i) => s + i.quantity * i.unitPrice * i.taxRate, 0)
  const total = subtotal + tax
  purchasing.updateBill({
    ...bill.value,
    vendorId: editForm.vendorId,
    issueDate: editForm.issueDate,
    dueDate: editForm.dueDate,
    lineItems: editLines.value,
    subtotal,
    tax,
    total,
    balance: Math.max(0, total - bill.value.paidAmount),
    updatedAt: new Date().toISOString()
  })
  toast.success('Bill updated', bill.value.number)
  isEditing.value = false
}

const nextActions: Record<Bill['status'], { label: string; variant: 'primary' | 'success' | 'danger'; run: (b: Bill) => Partial<Bill> }[]> = {
  draft: [
    { label: 'Send to Pending', variant: 'primary', run: () => ({ status: 'pending' }) },
    { label: 'Cancel', variant: 'danger', run: () => ({ status: 'cancelled' }) }
  ],
  pending: [
    { label: 'Approve', variant: 'success', run: () => ({ status: 'approved' }) },
    { label: 'Cancel', variant: 'danger', run: () => ({ status: 'cancelled' }) }
  ],
  approved: [
    { label: 'Record Payment', variant: 'success', run: (b) => ({ status: 'paid', paidAmount: b.total, balance: 0 }) },
    { label: 'Cancel', variant: 'danger', run: () => ({ status: 'cancelled' }) }
  ],
  overdue: [
    { label: 'Record Payment', variant: 'success', run: (b) => ({ status: 'paid', paidAmount: b.total, balance: 0 }) },
    { label: 'Cancel', variant: 'danger', run: () => ({ status: 'cancelled' }) }
  ],
  paid: [],
  cancelled: [],
  sent: [],
  received: [],
  rejected: []
}

const availableActions = computed(() => (bill.value ? nextActions[bill.value.status] ?? [] : []))

async function transition(label: string, run: (b: Bill) => Partial<Bill>): Promise<void> {
  if (!bill.value) return
  const ok = await confirmDialog.confirm({
    title: `${label}?`,
    message: `This will update ${bill.value.number}.`,
    tone: label === 'Cancel' ? 'danger' : 'default'
  })
  if (!ok) return
  purchasing.updateBill({ ...bill.value, ...run(bill.value), updatedAt: new Date().toISOString() })
  toast.success('Bill updated', bill.value.number)
}
</script>

<template>
  <div v-if="!bill">
    <BasePageHeader title="Bill Not Found" />
  </div>
  <div v-else>
    <BasePageHeader :title="`Bill ${bill.number}`" subtitle="Vendor invoice awaiting payment.">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'bills' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back
        </BaseButton>
        <BaseButton variant="outline" @click="printPage">
          <Printer class="h-4 w-4 mr-1" /> Print
        </BaseButton>
        <BaseButton v-if="bill.status === 'draft' && !isEditing" variant="secondary" @click="startEdit">
          <Pencil class="h-4 w-4 mr-1" /> Edit
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <BaseCard title="Bill Information" class="lg:col-span-2">
        <div v-if="!isEditing" class="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">Vendor</p>
            <p class="text-sm font-medium">{{ vendor?.name ?? '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Status</p>
            <StatusPill :status="bill.status" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Issue Date</p>
            <p class="text-sm font-medium">{{ formatDate(bill.issueDate) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Due Date</p>
            <p class="text-sm font-medium">{{ formatDate(bill.dueDate) }}</p>
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

      <BaseCard title="Payment">
        <div class="text-sm space-y-2">
          <div class="flex justify-between"><span class="text-text-muted">Total</span><CurrencyDisplay :value="bill.total" /></div>
          <div class="flex justify-between"><span class="text-text-muted">Paid</span><CurrencyDisplay :value="bill.paidAmount" /></div>
          <div class="flex justify-between font-semibold border-t border-border pt-2 text-base">
            <span>Balance</span>
            <CurrencyDisplay :value="bill.balance" :tone="bill.balance > 0 ? 'negative' : 'default'" />
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
          :key="action.label"
          :variant="action.variant"
          @click="transition(action.label, action.run)"
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
