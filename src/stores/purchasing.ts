import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Bill, PurchaseOrder, Vendor } from '@/types'

export const usePurchasingStore = defineStore('purchasing', () => {
  const vendors = useStorage<Vendor[]>(STORAGE_KEYS.vendors, [])
  const purchaseOrders = useStorage<PurchaseOrder[]>(STORAGE_KEYS.purchaseOrders, [])
  const bills = useStorage<Bill[]>(STORAGE_KEYS.bills, [])

  const vendorById = (id: string) => vendors.value.find((v) => v.id === id)
  const poById = (id: string) => purchaseOrders.value.find((p) => p.id === id)
  const billById = (id: string) => bills.value.find((b) => b.id === id)

  const openBillsCount = computed(() => bills.value.filter((b) => b.status !== 'paid').length)
  const totalPayable = computed(() => bills.value.reduce((sum, b) => sum + b.balance, 0))

  return { vendors, purchaseOrders, bills, vendorById, poById, billById, openBillsCount, totalPayable }
})
