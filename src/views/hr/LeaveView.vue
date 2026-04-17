<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import { useHrStore } from '@/stores/hr'
import { formatDate } from '@/composables/useFormat'
import type { LeaveRequest, TableColumn } from '@/types'

const hr = useHrStore()

const rows = computed(() =>
  hr.leaveRequests.map((lr) => {
    const emp = hr.employeeById(lr.employeeId)
    return { ...lr, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '-' }
  })
)

const columns: TableColumn<LeaveRequest & { employeeName: string }>[] = [
  { key: 'employeeName', label: 'Employee', sortable: true },
  { key: 'type', label: 'Type' },
  { key: 'startDate', label: 'Start', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'endDate', label: 'End', formatter: (v) => formatDate(String(v)) },
  { key: 'days', label: 'Days', align: 'right' },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Leave Requests" subtitle="Time-off requests and approval states." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-status="{ row }"><StatusPill :status="row.status" /></template>
    <template #cell-type="{ row }"><span class="capitalize">{{ row.type }}</span></template>
  </BaseTable>
</template>
