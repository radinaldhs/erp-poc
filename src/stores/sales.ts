import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Customer, Invoice, Quote, SalesOrder } from '@/types'

export const useSalesStore = defineStore('sales', () => {
  const customers = useStorage<Customer[]>(STORAGE_KEYS.customers, [])
  const quotes = useStorage<Quote[]>(STORAGE_KEYS.quotes, [])
  const salesOrders = useStorage<SalesOrder[]>(STORAGE_KEYS.salesOrders, [])
  const invoices = useStorage<Invoice[]>(STORAGE_KEYS.invoices, [])

  const customerById = (id: string) => customers.value.find((c) => c.id === id)
  const quoteById = (id: string) => quotes.value.find((q) => q.id === id)
  const salesOrderById = (id: string) => salesOrders.value.find((s) => s.id === id)
  const invoiceById = (id: string) => invoices.value.find((i) => i.id === id)

  const totalRevenue = computed(() => invoices.value.reduce((sum, i) => sum + (i.paidAmount || 0), 0))
  const openInvoicesCount = computed(() => invoices.value.filter((i) => i.status !== 'paid').length)
  const totalReceivables = computed(() => invoices.value.reduce((sum, i) => sum + (i.balance || 0), 0))

  const addCustomer = (c: Customer): void => { customers.value = [c, ...customers.value] }
  const updateCustomer = (c: Customer): void => { customers.value = customers.value.map((x) => (x.id === c.id ? c : x)) }
  const deleteCustomer = (id: string): void => { customers.value = customers.value.filter((c) => c.id !== id) }

  const addQuote = (q: Quote): void => { quotes.value = [q, ...quotes.value] }
  const updateQuote = (q: Quote): void => { quotes.value = quotes.value.map((x) => (x.id === q.id ? q : x)) }
  const deleteQuote = (id: string): void => { quotes.value = quotes.value.filter((q) => q.id !== id) }

  const addSalesOrder = (s: SalesOrder): void => { salesOrders.value = [s, ...salesOrders.value] }
  const updateSalesOrder = (s: SalesOrder): void => { salesOrders.value = salesOrders.value.map((x) => (x.id === s.id ? s : x)) }
  const deleteSalesOrder = (id: string): void => { salesOrders.value = salesOrders.value.filter((s) => s.id !== id) }

  const addInvoice = (i: Invoice): void => { invoices.value = [i, ...invoices.value] }
  const updateInvoice = (i: Invoice): void => { invoices.value = invoices.value.map((x) => (x.id === i.id ? i : x)) }
  const deleteInvoice = (id: string): void => { invoices.value = invoices.value.filter((i) => i.id !== id) }

  return {
    customers,
    quotes,
    salesOrders,
    invoices,
    customerById,
    quoteById,
    salesOrderById,
    invoiceById,
    totalRevenue,
    openInvoicesCount,
    totalReceivables,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addQuote,
    updateQuote,
    deleteQuote,
    addSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    addInvoice,
    updateInvoice,
    deleteInvoice
  }
})
