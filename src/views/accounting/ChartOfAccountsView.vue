<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { useAccountingStore } from '@/stores/accounting'
import { useToast } from '@/composables/useToast'
import type { Account, AccountType, TableColumn } from '@/types'

const accounting = useAccountingStore()
const toast = useToast()

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
  { key: 'isActive', label: 'Active' }
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

const showCreate = ref(false)
const form = reactive({
  code: '',
  name: '',
  type: 'asset' as AccountType,
  balance: 0,
  isActive: true
})

function openCreate(): void {
  form.code = `ACC-${String(accounting.accounts.length + 1).padStart(4, '0')}`
  form.name = ''
  form.type = 'asset'
  form.balance = 0
  form.isActive = true
  showCreate.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  accounting.addAccount({
    id: uuid(),
    code: form.code,
    name: form.name,
    type: form.type,
    balance: Number(form.balance) || 0,
    isActive: form.isActive,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Account created', form.name)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Chart of Accounts" subtitle="Financial categorization used for journal posting." phase-tag="Phase 2 — Roadmap" />
  <BaseTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    create-label="New Account"
    filterable
    :active-filter-count="activeFilterCount"
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
  </BaseTable>

  <EntityFormModal
    :open="showCreate"
    title="New Account"
    save-label="Create Account"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.code" label="Code" required />
      <BaseInput v-model="form.name" label="Name" required />
      <BaseSelect v-model="form.type" label="Type" :options="typeOptions" />
      <BaseInput v-model.number="form.balance" type="number" label="Opening Balance" />
    </div>
    <label class="flex items-center gap-2 text-sm">
      <input v-model="form.isActive" type="checkbox" class="h-4 w-4" />
      <span>Active</span>
    </label>
  </EntityFormModal>
</template>
