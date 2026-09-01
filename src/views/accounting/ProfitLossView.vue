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

const revenue = computed(() => accounting.accounts.filter((a) => a.type === 'revenue'))
const expense = computed(() => accounting.accounts.filter((a) => a.type === 'expense'))

const totals = computed(() => ({
  revenue: revenue.value.reduce((s, a) => s + a.balance, 0),
  expense: expense.value.reduce((s, a) => s + a.balance, 0)
}))

const netIncome = computed(() => totals.value.revenue - totals.value.expense)

function exportExcel(): void {
  const rows = [
    ...revenue.value.map((a) => ({ section: 'Revenue', account: a.name, amount: a.balance })),
    ...expense.value.map((a) => ({ section: 'Expense', account: a.name, amount: a.balance })),
    { section: 'Net', account: 'Net Income', amount: netIncome.value }
  ]
  downloadSheet('profit-and-loss.xlsx', rows)
}
</script>

<template>
  <BasePageHeader title="Profit and Loss" subtitle="Summary of revenue, expenses, and net income.">
    <template #actions>
      <BaseButton variant="secondary" @click="exportExcel">
        <Download class="h-4 w-4 mr-1" /> Export to Excel
      </BaseButton>
    </template>
  </BasePageHeader>
  <div class="grid gap-4 grid-cols-1 lg:grid-cols-2">
    <BaseCard title="Revenue">
      <div class="space-y-2 text-sm">
        <div v-for="account in revenue" :key="account.id" class="flex justify-between">
          <span class="text-text-muted">{{ account.name }}</span>
          <CurrencyDisplay :value="account.balance" />
        </div>
        <div class="flex justify-between font-semibold border-t border-border pt-2 text-base">
          <span>Total Revenue</span>
          <CurrencyDisplay :value="totals.revenue" />
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Expenses">
      <div class="space-y-2 text-sm">
        <div v-for="account in expense" :key="account.id" class="flex justify-between">
          <span class="text-text-muted">{{ account.name }}</span>
          <CurrencyDisplay :value="account.balance" />
        </div>
        <div class="flex justify-between font-semibold border-t border-border pt-2 text-base">
          <span>Total Expenses</span>
          <CurrencyDisplay :value="totals.expense" />
        </div>
      </div>
    </BaseCard>
  </div>

  <BaseCard :title="netIncome >= 0 ? 'Net Income' : 'Net Loss'">
    <div class="text-sm space-y-2">
      <div class="flex justify-between"><span class="text-text-muted">Total Revenue</span><CurrencyDisplay :value="totals.revenue" /></div>
      <div class="flex justify-between"><span class="text-text-muted">Total Expenses</span><CurrencyDisplay :value="totals.expense" /></div>
      <div class="flex justify-between font-semibold border-t border-border pt-2 text-lg" :class="netIncome >= 0 ? 'text-success' : 'text-danger'">
        <span>Net</span>
        <CurrencyDisplay :value="netIncome" />
      </div>
    </div>
  </BaseCard>
</template>
