import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Account, AccountType, JournalEntry } from '@/types'

export const useAccountingStore = defineStore('accounting', () => {
  const accounts = useStorage<Account[]>(STORAGE_KEYS.accounts, [])
  const journals = useStorage<JournalEntry[]>(STORAGE_KEYS.journals, [])

  const byId = (id: string) => accounts.value.find((a) => a.id === id)

  const totalByType = (type: AccountType): number =>
    accounts.value.filter((a) => a.type === type).reduce((s, a) => s + a.balance, 0)

  const totals = computed(() => ({
    asset: totalByType('asset'),
    liability: totalByType('liability'),
    equity: totalByType('equity'),
    revenue: totalByType('revenue'),
    expense: totalByType('expense')
  }))

  const netIncome = computed(() => totals.value.revenue - totals.value.expense)

  return { accounts, journals, byId, totalByType, totals, netIncome }
})
