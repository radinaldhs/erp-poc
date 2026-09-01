<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { Trash2 } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useAccountingStore } from '@/stores/accounting'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import type { Account, AccountType, TableColumn } from '@/types'

const accounting = useAccountingStore()
const toast = useToast()
const confirmDialog = useConfirm()

const filters = reactive({ type: '', active: '' })

const rows = computed(() =>
  accounting.accounts.filter((a) => {
    if (filters.type && a.type !== filters.type) return false
    if (filters.active === 'active' && !a.isActive) return false
    if (filters.active === 'inactive' && a.isActive) return false
    return true
  })
)

const activeFilterCount = computed(() =>
  (filters.type ? 1 : 0) + (filters.active ? 1 : 0)
)

function resetFilters(): void {
  filters.type = ''
  filters.active = ''
}

const columns: TableColumn<Account>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'isActive', label: 'Active' },
  { key: 'actions', label: '', align: 'right', width: '60px' }
]

const typeTone = (t: Account['type']): 'primary' | 'warning' | 'info' | 'success' | 'danger' => {
  const map = { asset: 'primary', liability: 'warning', equity: 'info', revenue: 'success', expense: 'danger' } as const
  return map[t]
}

const typeOptions = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' }
]

const showModal = ref(false)
const editingId = ref<string | null>(null)
// Opening balances are never user-editable: they'd desync the Assets = Liabilities +
// Equity identity the seed carefully balances. New accounts always start at 0; existing
// balances only move through journal entries.
const editingBalance = ref(0)
const form = reactive({
  code: '',
  name: '',
  type: 'asset' as AccountType,
  isActive: true
})

function openCreate(): void {
  editingId.value = null
  editingBalance.value = 0
  form.code = `ACC-${String(accounting.accounts.length + 1).padStart(4, '0')}`
  form.name = ''
  form.type = 'asset'
  form.isActive = true
  showModal.value = true
}

function openEdit(row: Account): void {
  editingId.value = row.id
  editingBalance.value = row.balance
  form.code = row.code
  form.name = row.name
  form.type = row.type
  form.isActive = row.isActive
  showModal.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  if (editingId.value) {
    const existing = accounting.byId(editingId.value)
    if (!existing) return
    accounting.updateAccount({
      ...existing,
      code: form.code,
      name: form.name,
      type: form.type,
      isActive: form.isActive,
      updatedAt: now
    })
    toast.success('Account updated', form.name)
  } else {
    accounting.addAccount({
      id: uuid(),
      code: form.code,
      name: form.name,
      type: form.type,
      balance: 0,
      isActive: form.isActive,
      createdAt: now,
      updatedAt: now
    })
    toast.success('Account created', form.name)
  }
  showModal.value = false
}

async function remove(row: Account): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Delete this account?',
    message: `${row.name} will be permanently removed.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
  accounting.deleteAccount(row.id)
  toast.success('Account deleted', row.name)
}
</script>

<template>
  <BasePageHeader title="Chart of Accounts" subtitle="Financial categorization used for journal posting." />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    clickable
    create-label="New Account"
    filterable
    :active-filter-count="activeFilterCount"
    @row-click="openEdit"
    @create="openCreate"
    @reset-filters="resetFilters"
  >
    <template #filters>
      <BaseSelect
        v-model="filters.type"
        label="Type"
        :options="[{ value: '', label: 'Any type' }, ...typeOptions]"
      />
      <BaseSelect
        v-model="filters.active"
        label="Status"
        :options="[
          { value: '', label: 'Any status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]"
      />
    </template>
    <template #cell-type="{ row }">
      <BaseBadge :tone="typeTone(row.type)" class="capitalize">{{ row.type }}</BaseBadge>
    </template>
    <template #cell-balance="{ row }">
      <CurrencyDisplay :value="row.balance" />
    </template>
    <template #cell-isActive="{ row }">
      <BaseBadge :tone="row.isActive ? 'success' : 'neutral'">{{ row.isActive ? 'Active' : 'Inactive' }}</BaseBadge>
    </template>
    <template #cell-actions="{ row }">
      <button class="text-text-muted hover:text-danger" @click.stop="remove(row)">
        <Trash2 class="h-4 w-4" />
      </button>
    </template>
  </BaseTable>

  <EntityFormModal
    :open="showModal"
    :title="editingId ? 'Edit Account' : 'New Account'"
    :save-label="editingId ? 'Save Changes' : 'Create Account'"
    @close="showModal = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.code" label="Code" required />
      <BaseInput v-model="form.name" label="Name" required />
      <BaseSelect v-if="!editingId" v-model="form.type" label="Type" :options="typeOptions" />
      <div v-else>
        <p class="text-xs font-medium text-text-muted">Type</p>
        <p class="text-sm font-medium mt-2 capitalize">{{ form.type }}</p>
        <p class="text-xs text-text-muted mt-1">Reclassifying an account moves through journal entries, not this form.</p>
      </div>
      <div v-if="editingId">
        <p class="text-xs font-medium text-text-muted">Balance</p>
        <p class="text-sm font-medium mt-2">
          <CurrencyDisplay :value="editingBalance" />
        </p>
        <p class="text-xs text-text-muted mt-1">Balances move through journal entries, not this form.</p>
      </div>
    </div>
    <label class="flex items-center gap-2 text-sm">
      <input v-model="form.isActive" type="checkbox" class="h-4 w-4" />
      <span>Active</span>
    </label>
  </EntityFormModal>
</template>
