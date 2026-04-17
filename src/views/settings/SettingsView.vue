<script setup lang="ts">
import { computed, ref } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { RefreshCw } from 'lucide-vue-next'
import { useCompanyStore } from '@/stores/company'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { STORAGE_KEYS } from '@/data/keys'
import type { Currency, Tax, TableColumn, User } from '@/types'

const company = useCompanyStore()
const settings = useSettingsStore()
const toast = useToast()
const confirm = useConfirm()

const active = ref<'company' | 'currencies' | 'taxes' | 'users' | 'data'>('company')

const tabs = [
  { key: 'company', label: 'Company' },
  { key: 'currencies', label: 'Currencies' },
  { key: 'taxes', label: 'Taxes' },
  { key: 'users', label: 'Users' },
  { key: 'data', label: 'Data' }
]

const currencyColumns: TableColumn<Currency>[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'rate', label: 'Rate', align: 'right' },
  { key: 'isBase', label: 'Base' }
]

const taxColumns: TableColumn<Tax>[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'rate', label: 'Rate', align: 'right' },
  { key: 'type', label: 'Type' },
  { key: 'isActive', label: 'Active' }
]

const userColumns: TableColumn<User>[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
]

const currencyRows = computed(() => settings.currencies)
const taxRows = computed(() => settings.taxes)
const userRows = computed(() => settings.users)

async function resetData(): Promise<void> {
  const ok = await confirm.confirm({
    title: 'Reset demo data?',
    message: 'This clears all localStorage and re-seeds the application. You will be returned to the login screen.',
    tone: 'danger'
  })
  if (!ok) return
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k as string))
  localStorage.removeItem('erp:seedVersion')
  toast.success('Data reset complete. Reloading...')
  setTimeout(() => window.location.reload(), 500)
}
</script>

<template>
  <BasePageHeader title="Settings" subtitle="Workspace configuration, reference data, and demo tools." />
  <BaseTabs v-model="active" :tabs="tabs" />

  <div v-if="active === 'company'">
    <BaseCard title="Company Profile">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div>
          <p class="text-xs text-text-muted">Name</p>
          <p class="text-sm font-medium">{{ company.profile.name }}</p>
        </div>
        <div>
          <p class="text-xs text-text-muted">Legal Name</p>
          <p class="text-sm font-medium">{{ company.profile.legalName }}</p>
        </div>
        <div>
          <p class="text-xs text-text-muted">Tax ID</p>
          <p class="text-sm font-medium">{{ company.profile.taxId }}</p>
        </div>
        <div>
          <p class="text-xs text-text-muted">Base Currency</p>
          <p class="text-sm font-medium">{{ company.profile.currency }}</p>
        </div>
        <div>
          <p class="text-xs text-text-muted">Fiscal Year Start</p>
          <p class="text-sm font-medium">{{ company.profile.fiscalYearStart }}</p>
        </div>
        <div>
          <p class="text-xs text-text-muted">Email</p>
          <p class="text-sm font-medium">{{ company.profile.contact.email }}</p>
        </div>
        <div class="sm:col-span-2">
          <p class="text-xs text-text-muted">Address</p>
          <p class="text-sm font-medium">
            {{ company.profile.address.line1 }}, {{ company.profile.address.city }},
            {{ company.profile.address.state }} {{ company.profile.address.postalCode }}
          </p>
        </div>
      </div>
    </BaseCard>
  </div>

  <div v-else-if="active === 'currencies'">
    <BaseTable :columns="currencyColumns" :rows="currencyRows" row-key="id">
      <template #cell-isBase="{ row }">
        <BaseBadge :tone="row.isBase ? 'success' : 'neutral'">{{ row.isBase ? 'Base' : '' }}</BaseBadge>
      </template>
    </BaseTable>
  </div>

  <div v-else-if="active === 'taxes'">
    <BaseTable :columns="taxColumns" :rows="taxRows" row-key="id">
      <template #cell-rate="{ row }">{{ (row.rate * 100).toFixed(1) }}%</template>
      <template #cell-type="{ row }"><span class="capitalize">{{ row.type }}</span></template>
      <template #cell-isActive="{ row }">
        <BaseBadge :tone="row.isActive ? 'success' : 'neutral'">{{ row.isActive ? 'Active' : 'Inactive' }}</BaseBadge>
      </template>
    </BaseTable>
  </div>

  <div v-else-if="active === 'users'">
    <BaseTable :columns="userColumns" :rows="userRows" row-key="id" />
  </div>

  <div v-else>
    <BaseCard title="Demo Data">
      <p class="text-sm text-text-muted">
        This proof-of-concept stores all data locally. Use the reset button to regenerate the demo dataset.
      </p>
      <div class="mt-3">
        <BaseButton variant="danger" @click="resetData">
          <RefreshCw class="h-4 w-4 mr-1" /> Reset Demo Data
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>
