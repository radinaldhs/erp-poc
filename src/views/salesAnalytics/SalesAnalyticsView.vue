<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download, Database, BarChart3 } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseDateRangePicker from '@/components/ui/BaseDateRangePicker.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import LineChart from '@/components/charts/LineChart.vue'
import StackedBarChart from '@/components/charts/StackedBarChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import BaseProgress from '@/components/ui/BaseProgress.vue'
import { useFieldSalesStore } from '@/stores/fieldSales'
import { useMarketplaceSalesStore } from '@/stores/marketplaceSales'
import { downloadSheet } from '@/composables/useExcel'
import { formatCurrency, formatNumber } from '@/composables/useFormat'

const field = useFieldSalesStore()
const marketplace = useMarketplaceSalesStore()

type ChannelFilter = 'all' | 'offline' | 'online'
const channel = ref<ChannelFilter>('all')
const marketplaceFilter = ref<string>('')

const today = new Date()
const start = new Date(today.getFullYear(), today.getMonth(), 1)
const range = ref({
  start: start.toISOString().slice(0, 10),
  end: today.toISOString().slice(0, 10),
  preset: 'this_month' as const
})

interface Row {
  date: string
  channel: 'Offline' | string
  total: number
  quantity: number
  region?: string
  product: string
  salesRep?: string
}

const combinedRows = computed<Row[]>(() => {
  const offline = field.rows.map<Row>((r) => ({
    date: r.date,
    channel: 'Offline',
    total: r.total,
    quantity: r.quantity,
    region: r.region,
    product: r.product,
    salesRep: r.salesRep
  }))
  const online = marketplace.rows.map<Row>((r) => ({
    date: r.date,
    channel: r.marketplace,
    total: r.total,
    quantity: r.quantity,
    product: r.product
  }))
  return [...offline, ...online]
})

const filteredRows = computed<Row[]>(() => {
  const s = new Date(range.value.start).getTime()
  const e = new Date(range.value.end).getTime() + 86400000
  return combinedRows.value.filter((row) => {
    const t = new Date(row.date).getTime()
    if (t < s || t > e) return false
    if (channel.value === 'offline' && row.channel !== 'Offline') return false
    if (channel.value === 'online' && row.channel === 'Offline') return false
    if (channel.value === 'online' && marketplaceFilter.value && row.channel !== marketplaceFilter.value) return false
    return true
  })
})

const kpis = computed(() => {
  const revenue = filteredRows.value.reduce((sum, r) => sum + r.total, 0)
  const orders = filteredRows.value.length
  const aov = orders > 0 ? revenue / orders : 0
  const lengthDays = (new Date(range.value.end).getTime() - new Date(range.value.start).getTime()) / 86400000 || 1
  const priorStart = new Date(new Date(range.value.start).getTime() - lengthDays * 86400000).toISOString()
  const priorRows = combinedRows.value.filter((row) => {
    const t = new Date(row.date).getTime()
    return t >= new Date(priorStart).getTime() && t < new Date(range.value.start).getTime()
  })
  const priorRevenue = priorRows.reduce((sum, r) => sum + r.total, 0)
  const growth = priorRevenue > 0 ? ((revenue - priorRevenue) / priorRevenue) * 100 : 0
  return { revenue, orders, aov, growth }
})

const revenueTrend = computed(() => {
  const buckets: Record<string, number> = {}
  const months: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push(key)
    buckets[key] = 0
  }
  combinedRows.value.forEach((row) => {
    const d = new Date(row.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in buckets) buckets[key] += row.total
  })
  const labels = months.map((k) => {
    const [, m] = k.split('-')
    return new Date(2020, Number(m) - 1, 1).toLocaleString('en-US', { month: 'short' })
  })
  return { labels, data: months.map((k) => buckets[k]) }
})

const revenueByChannel = computed(() => {
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const channels: string[] = ['Offline', 'Marketplace A', 'Marketplace B', 'Marketplace C', 'Marketplace D', 'Marketplace E']
  const datasets = channels.map((ch) => ({
    label: ch,
    data: months.map((m) =>
      combinedRows.value
        .filter((r) => {
          const d = new Date(r.date)
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === m && r.channel === ch
        })
        .reduce((s, r) => s + r.total, 0)
    )
  }))
  return {
    labels: months.map((m) => {
      const parts = m.split('-')
      return new Date(2020, Number(parts[1]) - 1, 1).toLocaleString('en-US', { month: 'short' })
    }),
    datasets
  }
})

const topRegions = computed(() => {
  const map: Record<string, number> = {}
  filteredRows.value.forEach((r) => {
    const key = r.region ?? r.channel
    map[key] = (map[key] ?? 0) + r.total
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  return { labels: entries.map((e) => e[0]), data: entries.map((e) => e[1]) }
})

const topProducts = computed(() => {
  const map: Record<string, number> = {}
  filteredRows.value.forEach((r) => {
    map[r.product] = (map[r.product] ?? 0) + r.total
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  return { labels: entries.map((e) => e[0]), data: entries.map((e) => e[1]) }
})

const topReps = computed(() => {
  const map: Record<string, number> = {}
  filteredRows.value.forEach((r) => {
    if (r.salesRep) map[r.salesRep] = (map[r.salesRep] ?? 0) + r.total
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = entries[0]?.[1] ?? 1
  return entries.map(([name, value]) => ({ name, value, pct: (value / max) * 100 }))
})

const channelTabs = [
  { key: 'all', label: 'All Channels' },
  { key: 'offline', label: 'Offline (Field)' },
  { key: 'online', label: 'Online (Marketplaces)' }
]

const marketplaceOptions = computed(() => [
  { value: '', label: 'All marketplaces' },
  ...marketplace.channels.map((m: string) => ({ value: m, label: m }))
])

function exportExcel(): void {
  downloadSheet('sales-analytics.xlsx', filteredRows.value as unknown as Record<string, unknown>[])
}
</script>

<template>
  <BasePageHeader
    title="Sales Analytics"
    subtitle="Integrated view across offline field sales and online marketplace channels."
  >
    <template #actions>
      <BaseButton variant="secondary" @click="exportExcel">
        <Download class="h-4 w-4" /> Export to Excel
      </BaseButton>
    </template>
  </BasePageHeader>

  <BaseCard>
    <div class="flex items-start gap-3">
      <div class="h-10 w-10 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center">
        <BarChart3 class="h-5 w-5" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold">Power BI Integration — ready to connect</p>
        <p class="text-xs text-text-muted">
          This analytics layer is ready to expose its datasets to Power BI via a dedicated read-only endpoint.
          Once connected, the data you see here appears natively inside your Power BI workspace for deeper self-service
          exploration, scheduled refresh, and governed distribution.
        </p>
      </div>
      <BaseButton variant="ghost" size="sm">Learn more</BaseButton>
    </div>
  </BaseCard>

  <BaseCard>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <BaseTabs v-model="channel" :tabs="channelTabs" />
      <div class="flex flex-wrap items-end gap-3">
        <BaseSelect
          v-if="channel === 'online'"
          v-model="marketplaceFilter"
          :options="marketplaceOptions"
          label="Marketplace"
        />
        <BaseDateRangePicker v-model="range" />
      </div>
    </div>
  </BaseCard>

  <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <BaseStatCard label="Total Revenue" :value="formatCurrency(kpis.revenue)" tone="primary" :trend="kpis.growth" />
    <BaseStatCard label="Total Orders" :value="formatNumber(kpis.orders)" tone="success" />
    <BaseStatCard label="Avg. Order Value" :value="formatCurrency(kpis.aov)" tone="info" />
    <BaseStatCard
      label="Data Sources"
      :value="channel === 'offline' ? 'Field Only' : channel === 'online' ? 'Marketplaces' : 'Blended'"
      :icon="Database"
      tone="neutral"
      hint="Offline + Online"
    />
  </div>

  <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
    <BaseCard title="Revenue Trend (12 Months)" subtitle="Combined channel view" class="lg:col-span-2">
      <LineChart
        :labels="revenueTrend.labels"
        :datasets="[{ label: 'Revenue', data: revenueTrend.data }]"
        :height="260"
      />
    </BaseCard>
    <BaseCard title="Revenue by Channel (Last 6 Months)">
      <StackedBarChart :labels="revenueByChannel.labels" :datasets="revenueByChannel.datasets" :height="260" />
    </BaseCard>
  </div>

  <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
    <BaseCard title="Top Regions">
      <BarChart
        :labels="topRegions.labels"
        :datasets="[{ label: 'Revenue', data: topRegions.data }]"
        horizontal
        :height="260"
      />
    </BaseCard>
    <BaseCard title="Top Products">
      <DoughnutChart :labels="topProducts.labels" :data="topProducts.data" :height="260" />
    </BaseCard>
    <BaseCard title="Top Sales Reps">
      <div class="space-y-3">
        <div v-for="rep in topReps" :key="rep.name">
          <div class="flex items-center justify-between text-sm">
            <span>{{ rep.name }}</span>
            <span class="text-text-muted">{{ formatCurrency(rep.value) }}</span>
          </div>
          <BaseProgress :value="rep.pct" tone="primary" />
        </div>
        <p v-if="topReps.length === 0" class="text-xs text-text-muted">No field rep data for this range.</p>
      </div>
    </BaseCard>
  </div>
</template>
