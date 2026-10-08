<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BarChart from '@/components/charts/BarChart.vue'
import GanttBar from '@/components/shared/GanttBar.vue'
import { Factory, Clock, CheckCircle2 } from 'lucide-vue-next'
import { useManufacturingStore } from '@/stores/manufacturing'
import { useInventoryStore } from '@/stores/inventory'
import { formatNumber } from '@/composables/useFormat'

const manufacturing = useManufacturingStore()
const inventory = useInventoryStore()

const inProgressCount = computed(() => manufacturing.workOrders.filter((w) => w.status === 'in_progress').length)
const completedCount = computed(() => manufacturing.workOrders.filter((w) => w.status === 'completed').length)

const statusLabels: Record<string, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  on_hold: 'On Hold'
}

const workOrdersByStatus = computed(() => {
  const order = ['planned', 'in_progress', 'completed', 'on_hold']
  const counts = order.map((s) => manufacturing.workOrders.filter((w) => w.status === s).length)
  return { labels: order.map((s) => statusLabels[s]), data: counts }
})

const MAX_WEEK = 12

const timelineRows = computed(() =>
  manufacturing.workOrders.slice(0, 8).map((w, idx) => ({
    id: w.id,
    label: `${w.number} • ${inventory.productById(w.productId)?.name ?? '-'}`,
    startWeek: (idx % 6) + 1,
    endWeek: (idx % 6) + 3 + Math.floor(idx / 4),
    tone: w.status === 'completed' ? 'success' : w.status === 'in_progress' ? 'primary' : 'warning'
  }))
)
</script>

<template>
  <BasePageHeader title="Production Planning" subtitle="Rolling plan for in-flight and upcoming work orders." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Total Work Orders" :value="formatNumber(manufacturing.workOrders.length)" :icon="Factory" tone="primary" />
    <BaseStatCard label="In Progress" :value="formatNumber(inProgressCount)" :icon="Clock" tone="info" />
    <BaseStatCard label="Completed" :value="formatNumber(completedCount)" :icon="CheckCircle2" tone="success" />
  </div>

  <BaseCard title="Work Orders by Status">
    <BarChart :labels="workOrdersByStatus.labels" :datasets="[{ label: 'Work Orders', data: workOrdersByStatus.data }]" :height="220" />
  </BaseCard>

  <BaseCard title="Gantt (Next 12 Weeks)">
    <div class="space-y-3">
      <div v-for="row in timelineRows" :key="row.id" class="grid items-center gap-1.5 sm:gap-3 grid-cols-1 sm:grid-cols-[260px_1fr]">
        <p class="text-sm font-medium truncate">{{ row.label }}</p>
        <GanttBar :start-week="row.startWeek" :end-week="row.endWeek" :max-week="MAX_WEEK" :tone="row.tone as 'primary' | 'success' | 'warning' | 'danger'" :label="`W${row.startWeek} - W${row.endWeek}`" />
      </div>
    </div>
  </BaseCard>
</template>
