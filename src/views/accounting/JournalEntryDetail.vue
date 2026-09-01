<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Printer, Check, Pencil } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import JournalLinesEditor, { type JournalLineRow } from '@/components/shared/JournalLinesEditor.vue'
import { useAccountingStore } from '@/stores/accounting'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { formatDate } from '@/composables/useFormat'

const route = useRoute()
const router = useRouter()
const accounting = useAccountingStore()
const toast = useToast()
const confirmDialog = useConfirm()

const entry = computed(() => accounting.journals.find((j) => j.id === String(route.params.id)))

const lineRows = computed(() =>
  (entry.value?.lines ?? []).map((l) => ({
    id: l.id,
    account: accounting.byId(l.accountId)?.name ?? '-',
    description: l.description || entry.value?.description || '',
    debit: l.debit,
    credit: l.credit
  }))
)

const totalDebit = computed(() => lineRows.value.reduce((s, l) => s + l.debit, 0))
const totalCredit = computed(() => lineRows.value.reduce((s, l) => s + l.credit, 0))

const accountOptions = computed(() => accounting.accounts.map((a) => ({ value: a.id, label: `${a.code} ${a.name}` })))

function printPage(): void {
  window.print()
}

async function post(): Promise<void> {
  if (!entry.value) return
  const ok = await confirmDialog.confirm({
    title: 'Post this journal entry?',
    message: 'Posted entries are final and can no longer be edited or deleted.',
    tone: 'default'
  })
  if (!ok) return
  accounting.updateJournal({ ...entry.value, status: 'posted', updatedAt: new Date().toISOString() })
  toast.success('Journal entry posted', entry.value.number)
}

const showEdit = ref(false)
const form = reactive({
  number: '',
  date: '',
  description: '',
  reference: '',
  lines: [] as JournalLineRow[]
})

function openEdit(): void {
  if (!entry.value) return
  form.number = entry.value.number
  form.date = entry.value.date.slice(0, 10)
  form.description = entry.value.description
  form.reference = entry.value.reference ?? ''
  form.lines = entry.value.lines.map((l) => ({ id: l.id, accountId: l.accountId, debit: l.debit, credit: l.credit }))
  showEdit.value = true
}

function saveEdit(): void {
  if (!entry.value) return
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
  const debit = form.lines.reduce((s, l) => s + l.debit, 0)
  const credit = form.lines.reduce((s, l) => s + l.credit, 0)
  if (debit !== credit) {
    toast.error('Debits and credits must be equal')
    return
  }
  accounting.updateJournal({
    ...entry.value,
    number: form.number,
    date: form.date,
    description: form.description,
    reference: form.reference,
    lines: form.lines.map((l) => ({ id: l.id, accountId: l.accountId, debit: l.debit, credit: l.credit })),
    updatedAt: new Date().toISOString()
  })
  toast.success('Journal entry updated', form.number)
  showEdit.value = false
}
</script>

<template>
  <div v-if="!entry">
    <BasePageHeader title="Journal Entry Not Found" />
  </div>
  <div v-else>
    <BasePageHeader :title="`Entry ${entry.number}`" subtitle="Posted or draft ledger entry detail.">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'journals' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back
        </BaseButton>
        <BaseButton variant="outline" @click="printPage">
          <Printer class="h-4 w-4 mr-1" /> Print
        </BaseButton>
        <BaseButton v-if="entry.status === 'draft'" variant="secondary" @click="openEdit">
          <Pencil class="h-4 w-4 mr-1" /> Edit
        </BaseButton>
        <BaseButton v-if="entry.status === 'draft'" variant="success" @click="post">
          <Check class="h-4 w-4 mr-1" /> Post
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <BaseCard title="Entry Information" class="lg:col-span-2">
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">Status</p>
            <StatusPill :status="entry.status" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Date</p>
            <p class="text-sm font-medium">{{ formatDate(entry.date) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Description</p>
            <p class="text-sm font-medium">{{ entry.description }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Reference</p>
            <p class="text-sm font-medium">{{ entry.reference || '-' }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Totals">
        <div class="text-sm space-y-2">
          <div class="flex justify-between"><span class="text-text-muted">Total Debit</span><CurrencyDisplay :value="totalDebit" /></div>
          <div class="flex justify-between"><span class="text-text-muted">Total Credit</span><CurrencyDisplay :value="totalCredit" /></div>
        </div>
      </BaseCard>
    </div>

    <BaseCard title="Lines" class="mt-4">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-surface/60 text-text-muted text-xs uppercase tracking-wide">
            <tr>
              <th class="px-3 py-2 text-left">Account</th>
              <th class="px-3 py-2 text-left">Description</th>
              <th class="px-3 py-2 text-right">Debit</th>
              <th class="px-3 py-2 text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in lineRows" :key="line.id" class="border-t border-border">
              <td class="px-3 py-2">{{ line.account }}</td>
              <td class="px-3 py-2">{{ line.description }}</td>
              <td class="px-3 py-2 text-right">
                <CurrencyDisplay v-if="line.debit" :value="line.debit" />
              </td>
              <td class="px-3 py-2 text-right">
                <CurrencyDisplay v-if="line.credit" :value="line.credit" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <EntityFormModal
      :open="showEdit"
      title="Edit Journal Entry"
      save-label="Save Changes"
      size="lg"
      @close="showEdit = false"
      @submit="saveEdit"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BaseInput v-model="form.number" label="Entry #" required />
        <BaseInput v-model="form.date" type="date" label="Date" />
        <BaseInput v-model="form.description" label="Description" required />
        <BaseInput v-model="form.reference" label="Reference" />
      </div>
      <JournalLinesEditor v-model="form.lines" :account-options="accountOptions" />
    </EntityFormModal>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
