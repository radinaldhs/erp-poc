<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Printer } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LineItemsEditor from '@/components/shared/LineItemsEditor.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useSalesStore } from '@/stores/sales'
import { formatDate } from '@/composables/useFormat'

const route = useRoute()
const router = useRouter()
const sales = useSalesStore()

const invoice = computed(() => sales.invoiceById(String(route.params.id)))
const customer = computed(() => (invoice.value ? sales.customerById(invoice.value.customerId) : null))
const items = computed({
  get: () => invoice.value?.lineItems ?? [],
  set: () => {}
})

function printPage(): void {
  window.print()
}
</script>

<template>
  <div v-if="!invoice">
    <BasePageHeader title="Invoice Not Found" />
  </div>
  <div v-else>
    <BasePageHeader :title="`Invoice ${invoice.number}`" subtitle="Billing document with payment and balance summary.">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'invoices' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back
        </BaseButton>
        <BaseButton variant="outline" @click="printPage">
          <Printer class="h-4 w-4 mr-1" /> Print
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <BaseCard title="Invoice Information" class="lg:col-span-2">
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">Customer</p>
            <p class="text-sm font-medium">{{ customer?.name ?? '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Status</p>
            <StatusPill :status="invoice.status" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Issue Date</p>
            <p class="text-sm font-medium">{{ formatDate(invoice.issueDate) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Due Date</p>
            <p class="text-sm font-medium">{{ formatDate(invoice.dueDate) }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Payment">
        <div class="text-sm space-y-2">
          <div class="flex justify-between"><span class="text-text-muted">Subtotal</span><CurrencyDisplay :value="invoice.subtotal" /></div>
          <div class="flex justify-between"><span class="text-text-muted">Tax</span><CurrencyDisplay :value="invoice.tax" /></div>
          <div class="flex justify-between font-semibold border-t border-border pt-2">
            <span>Total</span>
            <CurrencyDisplay :value="invoice.total" />
          </div>
          <div class="flex justify-between text-success"><span>Paid</span><CurrencyDisplay :value="invoice.paidAmount" /></div>
          <div class="flex justify-between font-semibold border-t border-border pt-2 text-base" :class="invoice.balance > 0 ? 'text-warning' : 'text-success'">
            <span>Balance</span>
            <CurrencyDisplay :value="invoice.balance" />
          </div>
        </div>
      </BaseCard>
    </div>

    <div class="mt-4">
      <LineItemsEditor :model-value="items" readonly @update:model-value="() => {}" />
    </div>
  </div>
</template>
