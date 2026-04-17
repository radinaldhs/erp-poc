<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import { Sparkles, CheckCircle, UserPlus } from 'lucide-vue-next'
import { useCrmStore } from '@/stores/crm'
import { formatDate, formatNumber } from '@/composables/useFormat'
import type { Lead, TableColumn } from '@/types'

const crm = useCrmStore()

const rows = computed(() => crm.leads)
const qualifiedCount = computed(() => rows.value.filter((l) => l.status === 'qualified').length)
const convertedCount = computed(() => rows.value.filter((l) => l.status === 'converted').length)

const columns: TableColumn<Lead>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'company', label: 'Company' },
  { key: 'contact.email', label: 'Email' },
  { key: 'source', label: 'Source' },
  { key: 'owner', label: 'Owner' },
  { key: 'createdAt', label: 'Created', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Leads" subtitle="Prospective customers being nurtured by the sales team." />
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Total Leads" :value="formatNumber(rows.length)" :icon="UserPlus" tone="primary" />
    <BaseStatCard label="Qualified" :value="formatNumber(qualifiedCount)" :icon="Sparkles" tone="warning" />
    <BaseStatCard label="Converted" :value="formatNumber(convertedCount)" :icon="CheckCircle" tone="success" />
  </div>
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>
</template>
