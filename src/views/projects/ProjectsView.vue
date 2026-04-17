<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseProgress from '@/components/ui/BaseProgress.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { Briefcase, PlayCircle, CheckCircle2 } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/projects'
import { formatDate, formatNumber } from '@/composables/useFormat'
import type { Project, TableColumn } from '@/types'

const projects = useProjectStore()
const rows = computed(() => projects.projects)
const activeCount = computed(() => rows.value.filter((p) => p.status === 'active').length)
const completedCount = computed(() => rows.value.filter((p) => p.status === 'completed').length)

const columns: TableColumn<Project>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'client', label: 'Client' },
  { key: 'manager', label: 'Manager' },
  { key: 'startDate', label: 'Start', formatter: (v) => formatDate(String(v)) },
  { key: 'endDate', label: 'End', formatter: (v) => formatDate(String(v)) },
  { key: 'budget', label: 'Budget', align: 'right' },
  { key: 'progress', label: 'Progress' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Projects" subtitle="Engagements, budgets, and delivery progress." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Total Projects" :value="formatNumber(rows.length)" :icon="Briefcase" tone="primary" />
    <BaseStatCard label="Active" :value="formatNumber(activeCount)" :icon="PlayCircle" tone="info" />
    <BaseStatCard label="Completed" :value="formatNumber(completedCount)" :icon="CheckCircle2" tone="success" />
  </div>
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-budget="{ row }">
      <CurrencyDisplay :value="row.budget" />
    </template>
    <template #cell-progress="{ row }">
      <div class="w-40">
        <BaseProgress :value="row.progress" />
        <span class="text-[11px] text-text-muted">{{ row.progress }}%</span>
      </div>
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>
</template>
