<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import { useHrStore } from '@/stores/hr'
import { formatDate } from '@/composables/useFormat'
import type { AttendanceRecord, TableColumn } from '@/types'

const hr = useHrStore()

const rows = computed(() =>
  hr.attendance.map((a) => {
    const emp = hr.employeeById(a.employeeId)
    return { ...a, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '-' }
  })
)

const columns: TableColumn<AttendanceRecord & { employeeName: string }>[] = [
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'employeeName', label: 'Employee', sortable: true },
  { key: 'checkIn', label: 'Check In' },
  { key: 'checkOut', label: 'Check Out' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <BasePageHeader title="Attendance" subtitle="Daily check-in logs for the workforce." phase-tag="Phase 2 — Roadmap" />
  <BaseTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>
</template>
