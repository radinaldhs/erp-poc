import { SEED_VERSION, STORAGE_KEYS } from './keys'
import { resetPrng } from './prng'
import { writeStorage, readStorage } from '@/composables/useStorage'
import { buildCustomers, buildFieldSalesRows, buildInvoices, buildMarketplaceSales, buildQuotes, buildSalesOrders } from './seedSales'
import { buildPromos } from './seedPromos'
import { buildProducts, buildStockLevels, buildStockMovements, buildWarehouses } from './seedCatalog'
import { buildBills, buildPurchaseOrders, buildVendors } from './seedPurchasing'
import { buildAccounts, buildJournalEntries } from './seedAccounting'
import { buildActivities, buildContacts, buildLeads, buildOpportunities } from './seedCrm'
import { buildAttendance, buildDepartments, buildEmployees, buildLeaveRequests, buildPayroll } from './seedHr'
import { buildBoms, buildWorkOrders } from './seedManufacturing'
import { buildProjects, buildTasks, buildTimesheets } from './seedProjects'
import { buildActivity, buildCompanyProfile, buildCurrencies, buildNotifications, buildTaxes, buildUsers } from './seedSettings'

export function initializeSeedData(force = false): void {
  const current = readStorage<number>(STORAGE_KEYS.seedVersion, 0)
  if (!force && current === SEED_VERSION) return
  resetPrng()

  const company = buildCompanyProfile()
  const currencies = buildCurrencies()
  const taxes = buildTaxes()
  const users = buildUsers()

  const customers = buildCustomers(50)
  const customerIds = customers.map((c) => c.id)
  const customerNames = customers.map((c) => c.name)

  const products = buildProducts(100)
  const productIds = products.map((p) => p.id)
  const productNames = products.map((p) => p.name)

  const warehouses = buildWarehouses(4)
  const stockLevels = buildStockLevels(products, warehouses)
  const stockMovements = buildStockMovements(products, warehouses, 80)

  const quotes = buildQuotes(40, customerIds, productIds)
  const salesOrders = buildSalesOrders(60, customerIds, productIds)
  const invoices = buildInvoices(80, customerIds, productIds)
  const fieldRows = buildFieldSalesRows(200, productNames, customerNames)
  const marketplaceSales = buildMarketplaceSales(300, productNames, customerNames)

  const promos = buildPromos(15)

  const vendors = buildVendors(30)
  const vendorIds = vendors.map((v) => v.id)
  const purchaseOrders = buildPurchaseOrders(50, vendorIds, productIds)
  const bills = buildBills(40, vendorIds, productIds)

  const accounts = buildAccounts()
  const journals = buildJournalEntries(60, accounts)

  const leads = buildLeads(40)
  const opportunities = buildOpportunities(25)
  const contacts = buildContacts(30)
  const activities = buildActivities(40)

  const departments = buildDepartments()
  const employees = buildEmployees(60, departments)
  const attendance = buildAttendance(employees, 120)
  const payroll = buildPayroll(employees)
  const leaveRequests = buildLeaveRequests(employees, 30)

  const boms = buildBoms(products, 15)
  const workOrders = buildWorkOrders(boms, 20)

  const projects = buildProjects(10)
  const tasks = buildTasks(projects, 6)
  const timesheets = buildTimesheets(tasks, 80)

  const fieldUploads = [
    {
      id: 'u_seed_1',
      filename: 'seed-field-sales.xlsx',
      uploader: 'Demo User',
      uploadedAt: new Date().toISOString(),
      rowCount: fieldRows.length,
      status: 'processed' as const,
      rows: fieldRows
    }
  ]

  writeStorage(STORAGE_KEYS.company, company)
  writeStorage(STORAGE_KEYS.currencies, currencies)
  writeStorage(STORAGE_KEYS.taxes, taxes)
  writeStorage(STORAGE_KEYS.users, users)
  writeStorage(STORAGE_KEYS.customers, customers)
  writeStorage(STORAGE_KEYS.products, products)
  writeStorage(STORAGE_KEYS.warehouses, warehouses)
  writeStorage(STORAGE_KEYS.stockLevels, stockLevels)
  writeStorage(STORAGE_KEYS.stockMovements, stockMovements)
  writeStorage(STORAGE_KEYS.quotes, quotes)
  writeStorage(STORAGE_KEYS.salesOrders, salesOrders)
  writeStorage(STORAGE_KEYS.invoices, invoices)
  writeStorage(STORAGE_KEYS.fieldRows, fieldRows)
  writeStorage(STORAGE_KEYS.fieldUploads, fieldUploads)
  writeStorage(STORAGE_KEYS.marketplaceSales, marketplaceSales)
  writeStorage(STORAGE_KEYS.promos, promos)
  writeStorage(STORAGE_KEYS.vendors, vendors)
  writeStorage(STORAGE_KEYS.purchaseOrders, purchaseOrders)
  writeStorage(STORAGE_KEYS.bills, bills)
  writeStorage(STORAGE_KEYS.accounts, accounts)
  writeStorage(STORAGE_KEYS.journals, journals)
  writeStorage(STORAGE_KEYS.leads, leads)
  writeStorage(STORAGE_KEYS.opportunities, opportunities)
  writeStorage(STORAGE_KEYS.contacts, contacts)
  writeStorage(STORAGE_KEYS.activities, activities)
  writeStorage(STORAGE_KEYS.departments, departments)
  writeStorage(STORAGE_KEYS.employees, employees)
  writeStorage(STORAGE_KEYS.attendance, attendance)
  writeStorage(STORAGE_KEYS.payroll, payroll)
  writeStorage(STORAGE_KEYS.leaveRequests, leaveRequests)
  writeStorage(STORAGE_KEYS.boms, boms)
  writeStorage(STORAGE_KEYS.workOrders, workOrders)
  writeStorage(STORAGE_KEYS.projects, projects)
  writeStorage(STORAGE_KEYS.tasks, tasks)
  writeStorage(STORAGE_KEYS.timesheets, timesheets)
  writeStorage(STORAGE_KEYS.notifications, buildNotifications())
  writeStorage(STORAGE_KEYS.activity, buildActivity())
  writeStorage(STORAGE_KEYS.seedVersion, SEED_VERSION)
}
