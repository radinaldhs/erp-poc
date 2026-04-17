<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useAccountingStore } from '@/stores/accounting'

const accounting = useAccountingStore()

const assets = computed(() => accounting.accounts.filter((a) => a.type === 'asset'))
const liabilities = computed(() => accounting.accounts.filter((a) => a.type === 'liability'))
const equity = computed(() => accounting.accounts.filter((a) => a.type === 'equity'))

const totals = computed(() => ({
  assets: assets.value.reduce((s, a) => s + a.balance, 0),
  liabilities: liabilities.value.reduce((s, a) => s + a.balance, 0),
  equity: equity.value.reduce((s, a) => s + a.balance, 0)
}))

const balanceCheck = computed(() => totals.value.assets - totals.value.liabilities - totals.value.equity)
</script>

<template>
  <BasePageHeader title="Balance Sheet" subtitle="Assets, liabilities, and equity at a point in time." phase-tag="Phase 2 — Roadmap" />
  <div class="grid gap-4 grid-cols-1 lg:grid-cols-2">
    <BaseCard title="Assets">
      <div class="space-y-2 text-sm">
        <div v-for="account in assets" :key="account.id" class="flex justify-between">
          <span class="text-text-muted">{{ account.name }}</span>
          <CurrencyDisplay :value="account.balance" />
        </div>
        <div class="flex justify-between font-semibold border-t border-border pt-2 text-base">
          <span>Total Assets</span>
          <CurrencyDisplay :value="totals.assets" />
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Liabilities and Equity">
      <div class="space-y-2 text-sm">
        <p class="text-xs uppercase tracking-wide text-text-muted">Liabilities</p>
        <div v-for="account in liabilities" :key="account.id" class="flex justify-between">
          <span class="text-text-muted">{{ account.name }}</span>
          <CurrencyDisplay :value="account.balance" />
        </div>
        <p class="text-xs uppercase tracking-wide text-text-muted pt-2">Equity</p>
        <div v-for="account in equity" :key="account.id" class="flex justify-between">
          <span class="text-text-muted">{{ account.name }}</span>
          <CurrencyDisplay :value="account.balance" />
        </div>
        <div class="flex justify-between font-semibold border-t border-border pt-2 text-base">
          <span>Total Liabilities and Equity</span>
          <CurrencyDisplay :value="totals.liabilities + totals.equity" />
        </div>
      </div>
    </BaseCard>
  </div>

  <BaseCard :title="balanceCheck === 0 ? 'Balance Check: OK' : 'Balance Check: Variance'">
    <p class="text-sm">
      <span class="text-text-muted">Assets − Liabilities − Equity =</span>
      <span class="ml-2 font-semibold" :class="balanceCheck === 0 ? 'text-success' : 'text-warning'">
        <CurrencyDisplay :value="balanceCheck" />
      </span>
    </p>
  </BaseCard>
</template>
