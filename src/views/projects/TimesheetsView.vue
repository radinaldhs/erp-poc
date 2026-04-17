<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import { Clock, Users, Timer } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/projects'
import { formatDate, formatNumber } from '@/composables/useFormat'
import type { Timesheet, TableColumn } from '@/types'

const projects = useProjectStore()

const rows = computed(() =>
  projects.timesheets.map((t) => ({
    ...t,
    projectName: projects.projectById(t.projectId)?.name ?? '-'
  }))
)

const totalHours = computed(() => rows.value.reduce((s, t) => s + t.hours, 0))
const uniqueEmployees = computed(() => new Set(rows.value.map((t) => t.employee)).size)

const columns: TableColumn<Timesheet & { projectName: string }>[] = [
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'employee', label: 'Employee', sortable: true },
  { key: 'projectName', label: 'Project' },
  { key: 'hours', label: 'Hours', align: 'right', sortable: true },
  { key: 'notes', label: 'Notes' }
]
</script>

<template>
  <BasePageHeader title="Timesheets" subtitle="Hour logs across engagements and contributors." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Total Hours" :value="formatNumber(totalHours, 1)" :icon="Clock" tone="primary" />
    <BaseStatCard label="Entries" :value="formatNumber(rows.length)" :icon="Timer" tone="info" />
    <BaseStatCard label="Contributors" :value="formatNumber(uniqueEmployees)" :icon="Users" tone="success" />
  </div>
  <BaseTable :columns="columns" :rows="rows" row-key="id" />
</template>
