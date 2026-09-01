<script setup lang="ts">
import { computed } from 'vue'
import { Download } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useAccountingStore } from '@/stores/accounting'
import { downloadSheet } from '@/composables/useExcel'

const accounting = useAccountingStore()

const assets = computed(() => accounting.accounts.filter((a) => a.type === 'asset'))
const liabilities = computed(() => accounting.accounts.filter((a) => a.type === 'liability'))
const equity = computed(() => accounting.accounts.filter((a) => a.type === 'equity'))

// Revenue and expense accounts stay open (not closed to Retained Earnings) so the P&L can
// show live activity. A balance sheet drawn mid-period must fold that activity into equity
// as "Current Year Earnings", the standard treatment, or Assets = Liabilities + Equity won't
// hold until the books are formally closed.
const currentYearEarnings = computed(() => accounting.totals.revenue - accounting.totals.expense)

const totals = computed(() => ({
  assets: assets.value.reduce((s, a) => s + a.balance, 0),
  liabilities: liabilities.value.reduce((s, a) => s + a.balance, 0),
  equity: equity.value.reduce((s, a) => s + a.balance, 0) + currentYearEarnings.value
}))

const balanceCheck = computed(() => totals.value.assets - totals.value.liabilities - totals.value.equity)

function exportExcel(): void {
  const rows = [
    ...assets.value.map((a) => ({ section: 'Assets', account: a.name, amount: a.balance })),
    ...liabilities.value.map((a) => ({ section: 'Liabilities', account: a.name, amount: a.balance })),
    ...equity.value.map((a) => ({ section: 'Equity', account: a.name, amount: a.balance })),
    { section: 'Equity', account: 'Current Year Earnings', amount: currentYearEarnings.value }
  ]
  downloadSheet('balance-sheet.xlsx', rows)
}
</script>

<template>
  <BasePageHeader title="Balance Sheet" subtitle="Assets, liabilities, and equity at a point in time.">
    <template #actions>
      <BaseButton variant="secondary" @click="exportExcel">
        <Download class="h-4 w-4 mr-1" /> Export to Excel
      </BaseButton>
    </template>
  </BasePageHeader>
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
        <div class="flex justify-between">
          <span class="text-text-muted">Current Year Earnings</span>
          <CurrencyDisplay :value="currentYearEarnings" />
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
