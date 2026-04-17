<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, Upload } from 'lucide-vue-next'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseFileDropzone from '@/components/ui/BaseFileDropzone.vue'
import BaseStepper from '@/components/ui/BaseStepper.vue'
import ExcelPreviewTable from '@/components/shared/ExcelPreviewTable.vue'
import { parseFile, downloadTemplate } from '@/composables/useExcel'
import { useFieldSalesStore } from '@/stores/fieldSales'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { FieldSalesRow } from '@/types'

const field = useFieldSalesStore()
const auth = useAuthStore()
const toast = useToast()

const TEMPLATE_HEADERS = ['date', 'sales_rep', 'region', 'customer', 'product', 'quantity', 'unit_price', 'total']
const CANONICAL: Record<string, string[]> = {
  date: ['date', 'trans_date', 'transaction date'],
  sales_rep: ['sales_rep', 'rep', 'sales rep', 'salesperson'],
  region: ['region', 'area', 'territory'],
  customer: ['customer', 'client', 'store'],
  product: ['product', 'sku', 'item'],
  quantity: ['quantity', 'qty', 'units'],
  unit_price: ['unit_price', 'price', 'unit price'],
  total: ['total', 'amount', 'line total']
}

const step = ref<'upload' | 'preview' | 'done'>('upload')
const rawHeaders = ref<string[]>([])
const rawRows = ref<Record<string, unknown>[]>([])
const filename = ref('')
const warnings = ref<Record<number, string[]>>({})

const stepperSteps = [
  { key: 'upload', label: 'Upload File' },
  { key: 'preview', label: 'Review Data' },
  { key: 'done', label: 'Confirm' }
]

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim().replace(/[\s-]+/g, '_')
}

function mapHeader(h: string): string | null {
  const n = normalizeHeader(h)
  for (const [canon, synonyms] of Object.entries(CANONICAL)) {
    if (synonyms.includes(n)) return canon
  }
  return null
}

const mappedRows = computed<Record<string, unknown>[]>(() => {
  return rawRows.value.map((row) => {
    const mapped: Record<string, unknown> = {}
    Object.entries(row).forEach(([key, value]) => {
      const canonical = mapHeader(key) ?? normalizeHeader(key)
      mapped[canonical] = value
    })
    return mapped
  })
})

const mappedHeaders = computed<string[]>(() => {
  const set = new Set<string>()
  mappedRows.value.forEach((row) => Object.keys(row).forEach((k) => set.add(k)))
  return Array.from(set)
})

function validate(rows: Record<string, unknown>[]): Record<number, string[]> {
  const out: Record<number, string[]> = {}
  rows.forEach((row, idx) => {
    const issues: string[] = []
    if (!row.date) issues.push('missing date')
    if (!row.product) issues.push('missing product')
    if (!row.customer) issues.push('missing customer')
    const qty = Number(row.quantity)
    if (!Number.isFinite(qty) || qty <= 0) issues.push('invalid quantity')
    const unit = Number(row.unit_price)
    if (!Number.isFinite(unit) || unit < 0) issues.push('invalid unit_price')
    if (issues.length) out[idx] = issues
  })
  return out
}

async function handleFiles(files: File[]): Promise<void> {
  const file = files[0]
  if (!file) return
  try {
    const parsed = await parseFile(file)
    filename.value = file.name
    rawHeaders.value = parsed.headers
    rawRows.value = parsed.rows
    warnings.value = validate(mappedRows.value)
    step.value = 'preview'
    toast.info('File parsed', `${parsed.rows.length} rows detected.`)
  } catch (error) {
    toast.error('Failed to parse', (error as Error).message)
  }
}

function toDateIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  if (!value) return new Date().toISOString()
  const s = String(value)
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  return new Date().toISOString()
}

function confirm(): void {
  const rows: FieldSalesRow[] = mappedRows.value.map((r) => {
    const qty = Number(r.quantity) || 0
    const unit = Number(r.unit_price) || 0
    const total = Number(r.total) || qty * unit
    return {
      id: uuid(),
      date: toDateIso(r.date),
      salesRep: String(r.sales_rep ?? 'Unassigned'),
      region: String(r.region ?? 'Region A'),
      customer: String(r.customer ?? 'Customer A'),
      product: String(r.product ?? 'SKU-001'),
      quantity: qty,
      unitPrice: unit,
      total
    }
  })
  field.commitUpload(filename.value, auth.user?.name ?? 'Demo User', rows)
  step.value = 'done'
  toast.success('Upload committed', `${rows.length} rows merged into sales analytics.`)
}

function reset(): void {
  step.value = 'upload'
  rawHeaders.value = []
  rawRows.value = []
  warnings.value = {}
  filename.value = ''
}

function download(): void {
  downloadTemplate('field-sales-template.xlsx', TEMPLATE_HEADERS, [
    { date: '2024-01-05', sales_rep: 'Alex Carter', region: 'Region A', customer: 'Customer A1', product: 'SKU-001', quantity: 10, unit_price: 25, total: 250 },
    { date: '2024-01-06', sales_rep: 'Maya Patel', region: 'Region B', customer: 'Customer B2', product: 'SKU-002', quantity: 5, unit_price: 30, total: 150 },
    { date: '2024-01-07', sales_rep: 'Jordan Lee', region: 'Region C', customer: 'Customer C1', product: 'SKU-003', quantity: 8, unit_price: 20, total: 160 }
  ])
}
</script>

<template>
  <BasePageHeader
    title="Field Sales Data Upload"
    subtitle="Upload field rep sales workbooks for immediate merging into analytics."
  >
    <template #actions>
      <BaseButton variant="secondary" @click="download">
        <Download class="h-4 w-4" /> Download Template
      </BaseButton>
    </template>
  </BasePageHeader>

  <BaseCard>
    <BaseStepper
      :steps="stepperSteps"
      :current="step"
      :done="step === 'preview' ? ['upload'] : step === 'done' ? ['upload', 'preview'] : []"
    />
  </BaseCard>

  <div v-if="step === 'upload'" class="space-y-4">
    <BaseCard>
      <BaseFileDropzone
        hint="Drop your Excel or CSV file here, or click to browse"
        @files-selected="handleFiles"
      />
    </BaseCard>

    <BaseCard title="What happens after upload" subtitle="Data is immediately available to the office team — no manual cleanup required.">
      <ul class="list-disc ps-4 text-sm text-text-muted space-y-1.5">
        <li>Columns are auto-mapped to the canonical schema (date, sales rep, region, customer, product, quantity, unit price, total).</li>
        <li>Rows with missing or invalid values are flagged inline for review.</li>
        <li>After confirming, records are merged into the Sales Analytics dashboard within seconds.</li>
        <li>Every upload is tracked in the Upload History tab with audit context (filename, uploader, timestamp, row count).</li>
      </ul>
    </BaseCard>
  </div>

  <div v-else-if="step === 'preview'" class="space-y-4">
    <BaseCard title="File Preview" :subtitle="`${filename} — ${rawRows.length} rows detected`">
      <template #header>
        <div class="flex items-center gap-2">
          <BaseButton variant="secondary" size="sm" @click="reset">Cancel</BaseButton>
          <BaseButton size="sm" @click="confirm">
            <Upload class="h-4 w-4" /> Confirm and Merge
          </BaseButton>
        </div>
      </template>
      <ExcelPreviewTable :headers="mappedHeaders" :rows="mappedRows" :warnings="warnings" />
    </BaseCard>
  </div>

  <div v-else class="space-y-4">
    <BaseCard title="Upload complete" subtitle="Rows merged successfully">
      <div class="space-y-3 text-sm">
        <p>Your data has been merged into the integrated sales analytics and is visible to the office team right now.</p>
        <div class="flex items-center gap-2">
          <BaseButton @click="reset">Upload Another File</BaseButton>
          <BaseButton variant="secondary" @click="$router.push('/sales-data/history')">View Upload History</BaseButton>
          <BaseButton variant="ghost" @click="$router.push('/sales-analytics')">Open Sales Analytics</BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
