<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseStatCard from '@/components/ui/BaseStatCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import KanbanBoard from '@/components/shared/KanbanBoard.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { Target, TrendingUp, DollarSign, Plus, SlidersHorizontal, X } from 'lucide-vue-next'
import { useCrmStore } from '@/stores/crm'
import { useToast } from '@/composables/useToast'
import { formatCurrency, formatDate, formatNumber } from '@/composables/useFormat'
import type { OpportunityStage } from '@/types'

const crm = useCrmStore()
const toast = useToast()

const STAGES: { key: OpportunityStage; label: string }[] = [
  { key: 'prospecting', label: 'Prospecting' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed_won', label: 'Closed Won' },
  { key: 'closed_lost', label: 'Closed Lost' }
]

const filters = reactive({ owner: '' })

const filteredOpportunities = computed(() =>
  crm.opportunities.filter((o) => {
    if (filters.owner && o.owner !== filters.owner) return false
    return true
  })
)

const columns = computed(() =>
  STAGES.map((s) => ({
    key: s.key,
    label: s.label,
    items: filteredOpportunities.value.filter((o) => o.stage === s.key)
  }))
)

const totalPipeline = computed(() =>
  filteredOpportunities.value.filter((o) => o.stage !== 'closed_lost').reduce((s, o) => s + o.amount, 0)
)
const wonAmount = computed(() =>
  filteredOpportunities.value.filter((o) => o.stage === 'closed_won').reduce((s, o) => s + o.amount, 0)
)
const winRate = computed(() => {
  const won = filteredOpportunities.value.filter((o) => o.stage === 'closed_won').length
  const closed = filteredOpportunities.value.filter((o) => o.stage.startsWith('closed')).length
  return closed === 0 ? 0 : (won / closed) * 100
})

const owners = computed(() => Array.from(new Set(crm.opportunities.map((o) => o.owner))).filter(Boolean))

const activeFilterCount = computed(() => (filters.owner ? 1 : 0))
const filterOpen = ref(false)

function resetFilters(): void {
  filters.owner = ''
}

const showCreate = ref(false)
const form = reactive({
  name: '',
  accountName: '',
  stage: 'prospecting' as OpportunityStage,
  amount: 0,
  probability: 20,
  closeDate: '',
  owner: ''
})

function openCreate(): void {
  form.name = ''
  form.accountName = ''
  form.stage = 'prospecting'
  form.amount = 0
  form.probability = 20
  form.closeDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  form.owner = owners.value[0] ?? 'Demo User'
  showCreate.value = true
}

function save(): void {
  if (!form.name.trim()) {
    toast.error('Name is required')
    return
  }
  const now = new Date().toISOString()
  crm.addOpportunity({
    id: uuid(),
    name: form.name,
    accountName: form.accountName,
    stage: form.stage,
    amount: Number(form.amount) || 0,
    probability: Number(form.probability) || 0,
    closeDate: form.closeDate,
    owner: form.owner,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Opportunity created', form.name)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Opportunities" subtitle="Pipeline view of active deals grouped by stage.">
    <template #actions>
      <BaseButton variant="secondary" @click="filterOpen = true">
        <SlidersHorizontal class="h-4 w-4" />
        <span>Filters</span>
        <span
          v-if="activeFilterCount > 0"
          class="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold"
        >{{ activeFilterCount }}</span>
      </BaseButton>
      <BaseButton variant="primary" @click="openCreate">
        <Plus class="h-4 w-4" />
        <span>New Opportunity</span>
      </BaseButton>
    </template>
  </BasePageHeader>
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <BaseStatCard label="Pipeline Value" :value="formatCurrency(totalPipeline)" :icon="Target" tone="primary" />
    <BaseStatCard label="Won Amount" :value="formatCurrency(wonAmount)" :icon="DollarSign" tone="success" />
    <BaseStatCard label="Win Rate" :value="`${formatNumber(winRate, 1)}%`" :icon="TrendingUp" tone="info" />
  </div>
  <KanbanBoard :columns="columns">
    <template #card="{ item }">
      <div>
        <p class="text-sm font-medium truncate">{{ item.name }}</p>
        <p class="text-[11px] text-text-muted truncate">{{ item.accountName }}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs font-semibold">{{ formatCurrency(item.amount) }}</span>
          <span class="text-[11px] text-text-muted">{{ item.probability }}%</span>
        </div>
        <p class="text-[11px] text-text-muted mt-1">Close {{ formatDate(item.closeDate) }}</p>
      </div>
    </template>
  </KanbanBoard>

  <Teleport to="body">
    <div v-if="filterOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="filterOpen = false" />
      <aside class="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-bg border-l border-border shadow-xl flex flex-col">
        <div class="flex items-center justify-between px-4 h-14 border-b border-border">
          <h3 class="text-sm font-semibold">Filters</h3>
          <button class="text-text-muted hover:text-text" @click="filterOpen = false">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <BaseSelect
            v-model="filters.owner"
            label="Owner"
            :options="[
              { value: '', label: 'Any owner' },
              ...owners.map((o) => ({ value: o, label: o }))
            ]"
          />
        </div>
        <div class="px-4 py-3 border-t border-border flex items-center justify-between gap-2">
          <BaseButton variant="ghost" @click="resetFilters">Reset</BaseButton>
          <BaseButton variant="primary" @click="filterOpen = false">Apply</BaseButton>
        </div>
      </aside>
    </div>
  </Teleport>

  <EntityFormModal
    :open="showCreate"
    title="New Opportunity"
    save-label="Create Opportunity"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.name" label="Name" required />
      <BaseInput v-model="form.accountName" label="Account" />
      <BaseSelect v-model="form.stage" label="Stage" :options="STAGES.map((s) => ({ value: s.key, label: s.label }))" />
      <BaseInput v-model.number="form.amount" type="number" label="Amount" />
      <BaseInput v-model.number="form.probability" type="number" label="Probability (%)" min="0" max="100" />
      <BaseInput v-model="form.closeDate" type="date" label="Close Date" />
      <BaseInput v-model="form.owner" label="Owner" />
    </div>
  </EntityFormModal>
</template>
