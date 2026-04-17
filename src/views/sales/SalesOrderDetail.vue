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

const order = computed(() => sales.salesOrderById(String(route.params.id)))
const customer = computed(() => (order.value ? sales.customerById(order.value.customerId) : null))
const items = computed({
  get: () => order.value?.lineItems ?? [],
  set: () => {}
})

function printPage(): void {
  window.print()
}
</script>

<template>
  <div v-if="!order">
    <BasePageHeader title="Sales Order Not Found" />
  </div>
  <div v-else>
    <BasePageHeader :title="`Order ${order.number}`" subtitle="Confirmed sales order awaiting fulfillment.">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'sales-orders' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back
        </BaseButton>
        <BaseButton variant="outline" @click="printPage">
          <Printer class="h-4 w-4 mr-1" /> Print
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <BaseCard title="Order Information" class="lg:col-span-2">
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">Customer</p>
            <p class="text-sm font-medium">{{ customer?.name ?? '-' }}</p>
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
            <p class="text-xs text-text-muted">Delivery Date</p>
            <p class="text-sm font-medium">{{ formatDate(order.dueDate) }}</p>
          </div>
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
      <LineItemsEditor :model-value="items" readonly @update:model-value="() => {}" />
    </div>
  </div>
</template>
