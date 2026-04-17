<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { usePromoStore } from '@/stores/promos'
import { formatDate } from '@/composables/useFormat'
import type { Promo, PromoStatus, PromoType, TableColumn } from '@/types'

const promos = usePromoStore()
const router = useRouter()

const statusFilter = ref<string>('')
const typeFilter = ref<string>('')

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Pending Area Manager', label: 'Pending Area Manager' },
  { value: 'Pending Regional Manager', label: 'Pending Regional Manager' },
  { value: 'Pending Finance Director', label: 'Pending Finance Director' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' }
]

const typeOptions = [
  { value: '', label: 'All types' },
  { value: 'Discount', label: 'Discount' },
  { value: 'Bundle', label: 'Bundle' },
  { value: 'Cashback', label: 'Cashback' },
  { value: 'Gift', label: 'Gift' }
]

const filtered = computed<Promo[]>(() =>
  promos.items.filter((p) => {
    if (statusFilter.value && p.status !== (statusFilter.value as PromoStatus)) return false
    if (typeFilter.value && p.promoType !== (typeFilter.value as PromoType)) return false
    return true
  })
)

const columns: TableColumn<Promo>[] = [
  { key: 'promoName', label: 'Promo Name', sortable: true },
  { key: 'promoType', label: 'Type' },
  { key: 'targetRegion', label: 'Region' },
  { key: 'startDate', label: 'Start', formatter: (v) => formatDate(String(v)) },
  { key: 'endDate', label: 'End', formatter: (v) => formatDate(String(v)) },
  { key: 'estimatedBudget', label: 'Budget', align: 'right' },
  { key: 'status', label: 'Status' }
]

function openDetail(row: Promo): void {
  router.push({ name: 'promo-detail', params: { id: row.id } })
}
</script>

<template>
  <BasePageHeader title="My Promos" subtitle="All promos you or your team have submitted.">
    <template #actions>
      <BaseButton @click="$router.push('/promos/submit')">
        <Plus class="h-4 w-4" /> Submit Promo
      </BaseButton>
    </template>
  </BasePageHeader>

  <div class="flex flex-wrap items-end gap-3">
    <BaseSelect v-model="statusFilter" :options="statusOptions" label="Status" />
    <BaseSelect v-model="typeFilter" :options="typeOptions" label="Type" />
  </div>

  <BaseTable
    :columns="columns"
    :rows="filtered"
    :page-size="10"
    empty-message="No promos yet — start by submitting one."
    clickable
    row-key="id"
    @row-click="openDetail"
  >
    <template #cell-status="{ row }">
      <StatusPill :status="row.status" />
    </template>
    <template #cell-estimatedBudget="{ row }">
      <CurrencyDisplay :value="row.estimatedBudget" />
    </template>
  </BaseTable>
</template>
