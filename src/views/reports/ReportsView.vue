<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { DollarSign, Users, Target, BadgePercent } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/sales'
import { useFieldSalesStore } from '@/stores/fieldSales'
import { useMarketplaceSalesStore } from '@/stores/marketplaceSales'
import { usePromoStore } from '@/stores/promos'
import { useCrmStore } from '@/stores/crm'
import { formatCurrency, formatNumber } from '@/composables/useFormat'

const sales = useSalesStore()
const field = useFieldSalesStore()
const marketplace = useMarketplaceSalesStore()
const promos = usePromoStore()
const crm = useCrmStore()

const totalRevenue = computed(() => field.totalRevenue + marketplace.totalRevenue)

function monthKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const revenueByMonth = computed(() => {
  const buckets: Record<string, number> = {}
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`] = 0
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

const revenueByRegion = computed(() => {
  const map: Record<string, number> = {}
  field.rows.forEach((r) => {
    map[r.region] = (map[r.region] ?? 0) + r.total
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  return { labels: entries.map((e) => e[0]), data: entries.map((e) => e[1]) }
})
</script>

<template>
  <BasePageHeader title="Reports" subtitle="Cross-module analytics across sales, promos, and pipeline." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-4">
    <BaseStatCard label="Total Revenue" :value="formatCurrency(totalRevenue)" :icon="DollarSign" tone="primary" />
    <BaseStatCard label="Customers" :value="formatNumber(sales.customers.length)" :icon="Users" tone="info" />
    <BaseStatCard label="Open Opportunities" :value="formatNumber(crm.opportunities.length)" :icon="Target" tone="success" />
    <BaseStatCard label="Active Promos" :value="formatNumber(promos.counts.Approved)" :icon="BadgePercent" tone="warning" />
  </div>

  <div class="grid gap-4 grid-cols-1 lg:grid-cols-2">
    <BaseCard title="Revenue by Month" subtitle="Combined offline and online">
      <LineChart :labels="revenueByMonth.labels" :datasets="[{ label: 'Revenue', data: revenueByMonth.data }]" :height="260" />
    </BaseCard>
    <BaseCard title="Revenue by Region (Field Sales)">
      <BarChart :labels="revenueByRegion.labels" :datasets="[{ label: 'Revenue', data: revenueByRegion.data }]" :height="260" />
    </BaseCard>
  </div>

  <BaseCard title="Promo Status Breakdown">
    <div class="grid gap-3 grid-cols-2 md:grid-cols-6">
      <div v-for="(value, key) in promos.counts" :key="key" class="rounded-md border border-border p-3">
        <p class="text-xs text-text-muted truncate">{{ key }}</p>
        <p class="text-xl font-semibold mt-0.5">{{ value }}</p>
      </div>
    </div>
  </BaseCard>

  <BaseCard title="Outstanding Receivables">
    <p class="text-3xl font-semibold">
      <CurrencyDisplay :value="sales.totalReceivables" />
    </p>
    <p class="text-xs text-text-muted mt-1">Across {{ sales.openInvoicesCount }} open invoices.</p>
  </BaseCard>
</template>
