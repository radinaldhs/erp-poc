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

  const addVendor = (x: Vendor): void => { vendors.value = [x, ...vendors.value] }
  const updateVendor = (x: Vendor): void => { vendors.value = vendors.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteVendor = (id: string): void => { vendors.value = vendors.value.filter((i) => i.id !== id) }

  const addPurchaseOrder = (x: PurchaseOrder): void => { purchaseOrders.value = [x, ...purchaseOrders.value] }
  const updatePurchaseOrder = (x: PurchaseOrder): void => { purchaseOrders.value = purchaseOrders.value.map((i) => (i.id === x.id ? x : i)) }
  const deletePurchaseOrder = (id: string): void => { purchaseOrders.value = purchaseOrders.value.filter((i) => i.id !== id) }

  const addBill = (x: Bill): void => { bills.value = [x, ...bills.value] }
  const updateBill = (x: Bill): void => { bills.value = bills.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteBill = (id: string): void => { bills.value = bills.value.filter((i) => i.id !== id) }

  return {
    vendors,
    purchaseOrders,
    bills,
    vendorById,
    poById,
    billById,
    openBillsCount,
    totalPayable,
    addVendor,
    updateVendor,
    deleteVendor,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    addBill,
    updateBill,
    deleteBill
  }
})
