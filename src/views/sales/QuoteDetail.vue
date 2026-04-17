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

const quote = computed(() => sales.quoteById(String(route.params.id)))
const customer = computed(() => (quote.value ? sales.customerById(quote.value.customerId) : null))
const items = computed({
  get: () => quote.value?.lineItems ?? [],
  set: () => {}
})

function printPage(): void {
  window.print()
}
</script>

<template>
  <div v-if="!quote">
    <BasePageHeader title="Quote Not Found" />
  </div>
  <div v-else>
    <BasePageHeader :title="`Quote ${quote.number}`" subtitle="Read-only view of this quote proposal.">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'quotes' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back
        </BaseButton>
        <BaseButton variant="outline" @click="printPage">
          <Printer class="h-4 w-4 mr-1" /> Print
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <BaseCard title="Quote Information" class="lg:col-span-2">
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">Customer</p>
            <p class="text-sm font-medium">{{ customer?.name ?? '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Status</p>
            <StatusPill :status="quote.status" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Issue Date</p>
            <p class="text-sm font-medium">{{ formatDate(quote.issueDate) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Due Date</p>
            <p class="text-sm font-medium">{{ formatDate(quote.dueDate) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Subtotal</p>
            <CurrencyDisplay :value="quote.subtotal" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Tax</p>
            <CurrencyDisplay :value="quote.tax" />
          </div>
        </div>
        <div v-if="quote.notes" class="mt-4">
          <p class="text-xs text-text-muted uppercase tracking-wide">Notes</p>
          <p class="text-sm mt-1">{{ quote.notes }}</p>
        </div>
      </BaseCard>

      <BaseCard title="Summary">
        <div class="text-sm space-y-2">
          <div class="flex justify-between"><span class="text-text-muted">Subtotal</span><CurrencyDisplay :value="quote.subtotal" /></div>
          <div class="flex justify-between"><span class="text-text-muted">Tax</span><CurrencyDisplay :value="quote.tax" /></div>
          <div class="flex justify-between font-semibold border-t border-border pt-2 text-base">
            <span>Total</span>
            <CurrencyDisplay :value="quote.total" />
          </div>
        </div>
      </BaseCard>
    </div>

    <div class="mt-4">
      <LineItemsEditor :model-value="items" readonly @update:model-value="() => {}" />
    </div>
  </div>
</template>
