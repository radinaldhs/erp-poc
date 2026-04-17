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

  const addAccount = (x: Account): void => { accounts.value = [x, ...accounts.value] }
  const updateAccount = (x: Account): void => { accounts.value = accounts.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteAccount = (id: string): void => { accounts.value = accounts.value.filter((i) => i.id !== id) }

  const addJournal = (x: JournalEntry): void => { journals.value = [x, ...journals.value] }
  const updateJournal = (x: JournalEntry): void => { journals.value = journals.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteJournal = (id: string): void => { journals.value = journals.value.filter((i) => i.id !== id) }

  return {
    accounts,
    journals,
    byId,
    totalByType,
    totals,
    netIncome,
    addAccount,
    updateAccount,
    deleteAccount,
    addJournal,
    updateJournal,
    deleteJournal
  }
})
