<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { Trash2 } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import JournalLinesEditor, { type JournalLineRow } from '@/components/shared/JournalLinesEditor.vue'
import { useAccountingStore } from '@/stores/accounting'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { formatDate } from '@/composables/useFormat'
import type { JournalEntry, TableColumn } from '@/types'

const accounting = useAccountingStore()
const router = useRouter()
const toast = useToast()
const confirmDialog = useConfirm()

const accountOptions = computed(() => accounting.accounts.map((a) => ({ value: a.id, label: `${a.code} ${a.name}` })))

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
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

function openDetail(row: JournalEntry): void {
  router.push({ name: 'journal-detail', params: { id: row.id } })
}

async function remove(row: JournalEntry): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Delete this journal entry?',
    message: `${row.number} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  accounting.deleteJournal(row.id)
  toast.success('Journal entry deleted', row.number)
}

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
  status: 'draft' as JournalEntry['status'],
  lines: [] as JournalLineRow[]
})

function openCreate(): void {
  form.number = `JE-${String(accounting.journals.length + 1).padStart(5, '0')}`
  form.date = new Date().toISOString().slice(0, 10)
  form.description = ''
  form.reference = ''
  form.status = 'draft'
  form.lines = []
  showCreate.value = true
}

function save(): void {
  if (!form.description.trim()) {
    toast.error('Description is required')
    return
  }
  if (form.lines.length < 2) {
    toast.error('At least 2 lines are required')
    return
  }
  if (form.lines.some((l) => l.debit < 0 || l.credit < 0)) {
    toast.error('Debit and credit amounts cannot be negative')
    return
  }
  const totalDebit = form.lines.reduce((s, l) => s + l.debit, 0)
  const totalCredit = form.lines.reduce((s, l) => s + l.credit, 0)
  if (totalDebit !== totalCredit) {
    toast.error('Debits and credits must be equal')
    return
  }
  const now = new Date().toISOString()
  accounting.addJournal({
    id: uuid(),
    number: form.number,
    date: form.date,
    description: form.description,
    reference: form.reference,
    lines: form.lines.map((l) => ({ id: l.id, accountId: l.accountId, debit: l.debit, credit: l.credit })),
    status: form.status,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Journal entry created', form.number)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Journal Entries" subtitle="Manual and system-posted ledger entries." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Entry"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openDetail"
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
    <template #cell-actions="{ row }">
      <button
        v-if="row.status === 'draft'"
        class="text-text-muted hover:text-danger"
        @click.stop="remove(row)"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Journal Entry"
    save-label="Create Entry"
    size="lg"
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
    <JournalLinesEditor v-model="form.lines" :account-options="accountOptions" />
  </EntityFormModal>
</template>
