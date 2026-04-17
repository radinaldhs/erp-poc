<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useSalesStore } from '@/stores/sales'
import { formatDate } from '@/composables/useFormat'
import type { Invoice, TableColumn } from '@/types'

const route = useRoute()
const router = useRouter()
const sales = useSalesStore()

const customer = computed(() => sales.customerById(String(route.params.id)))
const customerInvoices = computed<Invoice[]>(() =>
  customer.value ? sales.invoices.filter((i) => i.customerId === customer.value!.id) : []
)

const columns: TableColumn<Invoice>[] = [
  { key: 'number', label: 'Invoice #', sortable: true },
  { key: 'issueDate', label: 'Issued', formatter: (v) => formatDate(String(v)) },
  { key: 'dueDate', label: 'Due', formatter: (v) => formatDate(String(v)) },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'status', label: 'Status' }
]

function openInvoice(row: Invoice): void {
  router.push({ name: 'invoice-detail', params: { id: row.id } })
}
</script>

<template>
  <div v-if="!customer">
    <BasePageHeader title="Customer Not Found" />
  </div>
  <div v-else>
    <BasePageHeader :title="customer.name" :subtitle="`Code ${customer.code}`">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'customers' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <BaseCard title="Profile" class="lg:col-span-2">
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">Status</p>
            <StatusPill :status="customer.status" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Email</p>
            <p class="text-sm font-medium">{{ customer.contact.email }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Phone</p>
            <p class="text-sm font-medium">{{ customer.contact.phone }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Credit Limit</p>
            <CurrencyDisplay :value="customer.creditLimit" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Outstanding Balance</p>
            <CurrencyDisplay :value="customer.balance" :class="customer.balance > 0 ? 'text-warning' : ''" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-xs text-text-muted uppercase tracking-wide">Billing Address</p>
          <p class="text-sm mt-1">
            {{ customer.billingAddress.line1 }}<span v-if="customer.billingAddress.line2">, {{ customer.billingAddress.line2 }}</span>
            <br />
            {{ customer.billingAddress.city }}, {{ customer.billingAddress.state }} {{ customer.billingAddress.postalCode }}
            <br />
            {{ customer.billingAddress.country }}
          </p>
        </div>
      </BaseCard>

      <BaseCard title="Quick Stats">
        <div class="text-sm space-y-2">
          <div class="flex justify-between"><span class="text-text-muted">Invoices</span><span class="font-semibold">{{ customerInvoices.length }}</span></div>
          <div class="flex justify-between"><span class="text-text-muted">Outstanding</span><CurrencyDisplay :value="customer.balance" /></div>
          <div class="flex justify-between"><span class="text-text-muted">Credit Available</span><CurrencyDisplay :value="Math.max(0, customer.creditLimit - customer.balance)" /></div>
        </div>
      </BaseCard>
    </div>

    <div class="mt-4">
      <BaseCard title="Invoices">
        <BaseTable :columns="columns" :rows="customerInvoices" row-key="id" clickable empty-message="No invoices for this customer." @row-click="openInvoice">
          <template #cell-total="{ row }">
            <CurrencyDisplay :value="row.total" />
          </template>
          <template #cell-balance="{ row }">
            <CurrencyDisplay :value="row.balance" />
          </template>
          <template #cell-status="{ row }">
            <StatusPill :status="row.status" />
          </template>
        </BaseTable>
      </BaseCard>
    </div>
  </div>
</template>
