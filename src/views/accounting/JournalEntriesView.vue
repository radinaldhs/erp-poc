<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useAccountingStore } from '@/stores/accounting'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/composables/useFormat'
import type { JournalEntry, TableColumn } from '@/types'

const accounting = useAccountingStore()
const toast = useToast()

const filters = reactive({ status: '' })

const rows = computed(() =>
  accounting.journals
    .filter((j) => (filters.status ? j.status === filters.status : true))
    .map((j) => ({
      ...j,
      totalDebit: j.lines.reduce((s, l) => s + l.debit, 0),
      totalCredit: j.lines.reduce((s, l) => s + l.credit, 0)
    }))
)

const activeFilterCount = computed(() => (filters.status ? 1 : 0))

function resetFilters(): void {
  filters.status = ''
}

type Row = JournalEntry & { totalDebit: number; totalCredit: number }

const columns: TableColumn<Row>[] = [
  { key: 'number', label: 'Entry #', sortable: true },
  { key: 'date', label: 'Date', formatter: (v) => formatDate(String(v)), sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'reference', label: 'Reference' },
  { key: 'totalDebit', label: 'Debit', align: 'right' },
  { key: 'totalCredit', label: 'Credit', align: 'right' },
  { key: 'status', label: 'Status' }
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'posted', label: 'Posted' }
]

const showCreate = ref(false)
const form = reactive({
  number: '',
  date: '',
  description: '',
  reference: '',
  status: 'draft' as JournalEntry['status']
})

function openCreate(): void {
  form.number = `JE-${String(accounting.journals.length + 1).padStart(5, '0')}`
  form.date = new Date().toISOString().slice(0, 10)
  form.description = ''
  form.reference = ''
  form.status = 'draft'
  showCreate.value = true
}

function save(): void {
  if (!form.description.trim()) {
    toast.error('Description is required')
    return
  }
  const now = new Date().toISOString()
  accounting.addJournal({
    id: uuid(),
    number: form.number,
    date: form.date,
    description: form.description,
    reference: form.reference,
    lines: [],
    status: form.status,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Journal entry created', form.number)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Journal Entries" subtitle="Manual and system-posted ledger entries." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Entry"
    filterable
    :active-filter-count="activeFilterCount"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
    </template>
    <template #cell-totalDebit="{ row }">
      <CurrencyDisplay :value="row.totalDebit" />
    </template>
    <template #cell-totalCredit="{ row }">
      <CurrencyDisplay :value="row.totalCredit" />
    </template>
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Journal Entry"
    save-label="Create Entry"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.number" label="Entry #" required />
      <BaseInput v-model="form.date" type="date" label="Date" />
      <BaseInput v-model="form.description" label="Description" required />
      <BaseInput v-model="form.reference" label="Reference" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions.slice(1)" />
    </div>
  </EntityFormModal>
</template>
