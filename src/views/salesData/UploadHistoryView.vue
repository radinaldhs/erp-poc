<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useFieldSalesStore } from '@/stores/fieldSales'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { formatDateTime, formatNumber } from '@/composables/useFormat'
import type { TableColumn, FieldSalesUpload } from '@/types'

const field = useFieldSalesStore()
const confirmDialog = useConfirm()
const toast = useToast()

const columns: TableColumn<FieldSalesUpload>[] = [
  { key: 'filename', label: 'Filename', sortable: true },
  { key: 'uploader', label: 'Uploader' },
  { key: 'uploadedAt', label: 'Uploaded', formatter: (v) => formatDateTime(String(v)), sortable: true },
  { key: 'rowCount', label: 'Rows', align: 'right', formatter: (v) => formatNumber(Number(v)) },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', width: '80px' }
]

async function remove(upload: FieldSalesUpload): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Remove upload',
    message: `This will delete ${upload.rowCount} rows contributed by ${upload.filename}. Proceed?`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  field.removeUpload(upload.id)
  toast.success('Upload removed', 'Associated rows were cleared from analytics.')
}
</script>

<template>
  <BasePageHeader title="Upload History" subtitle="Review prior Excel/CSV ingestion runs and their audit trail." />

  <BaseTable
    :columns="columns"
    :rows="field.uploads"
    :page-size="10"
    empty-message="No uploads recorded yet."
    row-key="id"
  >
    <template #cell-status="{ row }">
      <BaseBadge :tone="row.status === 'processed' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'">
        {{ row.status }}
      </BaseBadge>
    </template>
    <template #cell-actions="{ row }">
      <button class="text-text-muted hover:text-danger" @click="remove(row)">
        <Trash2 class="h-4 w-4" />
      </button>
    </template>
  </BaseTable>
</template>
