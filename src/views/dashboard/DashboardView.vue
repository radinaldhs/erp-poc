<script setup lang="ts">
import { computed } from 'vue'
import { DollarSign, ShoppingBag, Users, ClipboardList, Package, BadgePercent } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import ActivityFeed from '@/components/shared/ActivityFeed.vue'
import { useSalesStore } from '@/stores/sales'
import { useFieldSalesStore } from '@/stores/fieldSales'
import { useMarketplaceSalesStore } from '@/stores/marketplaceSales'
import { usePromoStore } from '@/stores/promos'
import { useInventoryStore } from '@/stores/inventory'
import { useNotificationsStore } from '@/stores/notifications'
import { formatCurrency, formatNumber } from '@/composables/useFormat'

const sales = useSalesStore()
const field = useFieldSalesStore()
const marketplace = useMarketplaceSalesStore()
const promos = usePromoStore()
const inventory = useInventoryStore()
const notifications = useNotificationsStore()

const totalRevenue = computed(() => sales.totalRevenue + field.totalRevenue + marketplace.totalRevenue)
const totalOrders = computed(() => sales.invoices.length + field.totalOrders + marketplace.totalOrders)
const pendingPromos = computed(() =>
  promos.counts['Pending Area Manager'] + promos.counts['Pending Regional Manager'] + promos.counts['Pending Finance Director']
)

function monthKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const revenueTrend = computed(() => {
  const buckets: Record<string, number> = {}
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets[`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`] = 0
  }
  ;[...field.rows, ...marketplace.rows].forEach((row) => {
    const key = monthKey(row.date)
    if (key in buckets) buckets[key] += row.total
  })
  const labels = Object.keys(buckets).map((k) => {
    const [, m] = k.split('-')
    return new Date(2020, Number(m) - 1, 1).toLocaleString('en-US', { month: 'short' })
  })
  return { labels, data: Object.values(buckets) }
})

const productMix = computed(() => {
  const map: Record<string, number> = {}
  field.rows.forEach((r) => {
    map[r.product] = (map[r.product] ?? 0) + r.total
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  return { labels: entries.map((e) => e[0]), data: entries.map((e) => e[1]) }
})
</script>

<template>
  <BasePageHeader
    title="Executive Dashboard"
    subtitle="Real-time view of sales performance, operations, and pending approvals."
  />

  <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <BaseStatCard
      label="Total Revenue"
      :value="formatCurrency(totalRevenue)"
      :icon="DollarSign"
      tone="primary"
      :trend="12.4"
      hint="vs prior 12 months"
    />
    <BaseStatCard
      label="Total Orders"
      :value="formatNumber(totalOrders)"
      :icon="ShoppingBag"
      tone="success"
      :trend="8.1"
    />
    <BaseStatCard
      label="Customers"
      :value="formatNumber(sales.customers.length)"
      :icon="Users"
      tone="info"
    />
    <BaseStatCard
      label="Pending Promos"
      :value="formatNumber(pendingPromos)"
      :icon="BadgePercent"
      tone="warning"
      hint="across approval tiers"
    />
  </div>

  <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
    <BaseCard title="Revenue Trend (Last 12 Months)" subtitle="Offline + Online channels combined" class="lg:col-span-2">
      <LineChart
        :labels="revenueTrend.labels"
        :datasets="[{ label: 'Revenue', data: revenueTrend.data }]"
        :height="260"
      />
    </BaseCard>
    <BaseCard title="Top Products (Field Sales)">
      <DoughnutChart :labels="productMix.labels" :data="productMix.data" :height="260" />
    </BaseCard>
  </div>

  <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
    <BaseCard title="Operations Overview" class="lg:col-span-2">
      <div class="grid gap-3 grid-cols-2 md:grid-cols-4">
        <div class="rounded-md border border-border p-3">
          <p class="text-xs text-text-muted">Sales Orders</p>
          <p class="text-lg font-semibold mt-0.5">{{ sales.salesOrders.length }}</p>
        </div>
        <div class="rounded-md border border-border p-3">
          <p class="text-xs text-text-muted">Quotes</p>
          <p class="text-lg font-semibold mt-0.5">{{ sales.quotes.length }}</p>
        </div>
        <div class="rounded-md border border-border p-3">
          <p class="text-xs text-text-muted">Open Invoices</p>
          <p class="text-lg font-semibold mt-0.5">{{ sales.openInvoicesCount }}</p>
        </div>
        <div class="rounded-md border border-border p-3">
          <p class="text-xs text-text-muted">Products</p>
          <p class="text-lg font-semibold mt-0.5">{{ inventory.products.length }}</p>
        </div>
      </div>
      <div class="grid gap-3 grid-cols-2 md:grid-cols-4 mt-3">
        <div class="rounded-md border border-border p-3 flex items-start gap-2">
          <ClipboardList class="h-4 w-4 text-primary mt-0.5" />
          <div>
            <p class="text-xs text-text-muted">Field Uploads</p>
            <p class="text-lg font-semibold">{{ field.uploads.length }}</p>
          </div>
        </div>
        <div class="rounded-md border border-border p-3 flex items-start gap-2">
          <Package class="h-4 w-4 text-warning mt-0.5" />
          <div>
            <p class="text-xs text-text-muted">Low Stock</p>
            <p class="text-lg font-semibold">{{ inventory.lowStockCount }}</p>
          </div>
        </div>
        <div class="rounded-md border border-border p-3">
          <p class="text-xs text-text-muted">Marketplace Orders</p>
          <p class="text-lg font-semibold">{{ marketplace.totalOrders }}</p>
        </div>
        <div class="rounded-md border border-border p-3">
          <p class="text-xs text-text-muted">Field Orders</p>
          <p class="text-lg font-semibold">{{ field.totalOrders }}</p>
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Recent Activity">
      <ActivityFeed :entries="notifications.activity" />
    </BaseCard>
  </div>
</template>
