<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import { useCrmStore } from '@/stores/crm'
import { formatDate } from '@/composables/useFormat'
import type { Activity, TableColumn } from '@/types'

const crm = useCrmStore()
const rows = computed(() => crm.activities)

const columns: TableColumn<Activity>[] = [
  { key: 'subject', label: 'Subject', sortable: true },
  { key: 'type', label: 'Type' },
  { key: 'relatedTo', label: 'Related To' },
  { key: 'owner', label: 'Owner' },
  { key: 'dueDate', label: 'Due Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Activities" subtitle="Calls, meetings, emails, and follow-up tasks across CRM." />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
    <template #cell-type="{ row }">
      <span class="capitalize">{{ row.type }}</span>
    </template>
  </BaseTable>
</template>
