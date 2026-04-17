<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { useAccountingStore } from '@/stores/accounting'

const accounting = useAccountingStore()

const rows = computed(() =>
  [...accounting.accounts]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((a) => {
      const isDebitNatural = a.type === 'asset' || a.type === 'expense'
      return {
        code: a.code,
        name: a.name,
        debit: isDebitNatural && a.balance > 0 ? a.balance : 0,
        credit: !isDebitNatural && a.balance > 0 ? a.balance : 0
      }
    })
)

const totals = computed(() => ({
  debit: rows.value.reduce((s, r) => s + r.debit, 0),
  credit: rows.value.reduce((s, r) => s + r.credit, 0)
}))
</script>

<template>
  <BasePageHeader title="Trial Balance" subtitle="Snapshot of debit and credit totals for each account." phase-tag="Phase 2 — Roadmap" />
  <BaseCard>
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-surface/60 text-text-muted text-xs uppercase tracking-wide">
          <tr>
            <th class="px-3 py-2 text-left">Code</th>
            <th class="px-3 py-2 text-left">Account</th>
            <th class="px-3 py-2 text-right">Debit</th>
            <th class="px-3 py-2 text-right">Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.code" class="border-t border-border">
            <td class="px-3 py-2 font-medium">{{ row.code }}</td>
            <td class="px-3 py-2">{{ row.name }}</td>
            <td class="px-3 py-2 text-right">
              <CurrencyDisplay v-if="row.debit" :value="row.debit" />
              <span v-else>-</span>
            </td>
            <td class="px-3 py-2 text-right">
              <CurrencyDisplay v-if="row.credit" :value="row.credit" />
              <span v-else>-</span>
            </td>
          </tr>
          <tr class="border-t-2 border-border font-semibold bg-surface/40">
            <td class="px-3 py-2" colspan="2">Totals</td>
            <td class="px-3 py-2 text-right"><CurrencyDisplay :value="totals.debit" /></td>
            <td class="px-3 py-2 text-right"><CurrencyDisplay :value="totals.credit" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseCard>
</template>
