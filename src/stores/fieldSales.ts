import { defineStore } from 'pinia'
import { computed } from 'vue'
import { v4 as uuid } from 'uuid'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { FieldSalesRow, FieldSalesUpload } from '@/types'

export const useFieldSalesStore = defineStore('fieldSales', () => {
  const rows = useStorage<FieldSalesRow[]>(STORAGE_KEYS.fieldRows, [])
  const uploads = useStorage<FieldSalesUpload[]>(STORAGE_KEYS.fieldUploads, [])

  const totalRevenue = computed(() => rows.value.reduce((s, r) => s + r.total, 0))
  const totalOrders = computed(() => rows.value.length)

  const commitUpload = (filename: string, uploader: string, newRows: FieldSalesRow[]): FieldSalesUpload => {
    const upload: FieldSalesUpload = {
      id: uuid(),
      filename,
      uploader,
      uploadedAt: new Date().toISOString(),
      rowCount: newRows.length,
      status: 'processed',
      rows: newRows
    }
    uploads.value = [upload, ...uploads.value]
    rows.value = [...newRows, ...rows.value]
    return upload
  }

  const removeUpload = (id: string): void => {
    const upload = uploads.value.find((u) => u.id === id)
    if (!upload) return
    const removeIds = new Set(upload.rows.map((r) => r.id))
    rows.value = rows.value.filter((r) => !removeIds.has(r.id))
    uploads.value = uploads.value.filter((u) => u.id !== id)
  }

  return { rows, uploads, totalRevenue, totalOrders, commitUpload, removeUpload }
})
