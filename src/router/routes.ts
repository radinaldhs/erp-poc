import type { RouteRecordRaw } from 'vue-router'

const mainChildren: RouteRecordRaw[] = [
  { path: 'dashboard', name: 'dashboard', component: () => import('@/views/dashboard/DashboardView.vue'), meta: { title: 'Dashboard' } },
  { path: 'sales-analytics', name: 'sales-analytics', component: () => import('@/views/salesAnalytics/SalesAnalyticsView.vue'), meta: { title: 'Sales Analytics' } },
  { path: 'sales-data/upload', name: 'field-upload', component: () => import('@/views/salesData/FieldUploadView.vue'), meta: { title: 'Field Data Upload' } },
  { path: 'sales-data/history', name: 'field-upload-history', component: () => import('@/views/salesData/UploadHistoryView.vue'), meta: { title: 'Upload History' } },
  { path: 'sales/quotes', name: 'quotes', component: () => import('@/views/sales/QuotesList.vue'), meta: { title: 'Quotes' } },
  { path: 'sales/quotes/:id', name: 'quote-detail', component: () => import('@/views/sales/QuoteDetail.vue'), meta: { title: 'Quote Detail' } },
  { path: 'sales/orders', name: 'sales-orders', component: () => import('@/views/sales/SalesOrdersList.vue'), meta: { title: 'Sales Orders' } },
  { path: 'sales/orders/:id', name: 'sales-order-detail', component: () => import('@/views/sales/SalesOrderDetail.vue'), meta: { title: 'Sales Order Detail' } },
  { path: 'sales/invoices', name: 'invoices', component: () => import('@/views/sales/InvoicesList.vue'), meta: { title: 'Invoices' } },
  { path: 'sales/invoices/:id', name: 'invoice-detail', component: () => import('@/views/sales/InvoiceDetail.vue'), meta: { title: 'Invoice Detail' } },
  { path: 'sales/customers', name: 'customers', component: () => import('@/views/sales/CustomersList.vue'), meta: { title: 'Customers' } },
  { path: 'sales/customers/:id', name: 'customer-detail', component: () => import('@/views/sales/CustomerDetail.vue'), meta: { title: 'Customer Detail' } },
  { path: 'promos', name: 'promos', component: () => import('@/views/promos/PromoListView.vue'), meta: { title: 'Promos' } },
  { path: 'promos/submit', name: 'promo-submit', component: () => import('@/views/promos/PromoSubmitView.vue'), meta: { title: 'Submit Promo' } },
  { path: 'promos/approvals', name: 'promo-approvals', component: () => import('@/views/promos/PromoApprovalsView.vue'), meta: { title: 'Approval Queue' } },
  { path: 'promos/:id', name: 'promo-detail', component: () => import('@/views/promos/PromoDetailView.vue'), meta: { title: 'Promo Detail' } },
  { path: 'purchasing/orders', name: 'purchase-orders', component: () => import('@/views/purchasing/PurchaseOrdersList.vue'), meta: { title: 'Purchase Orders', phase2: true } },
  { path: 'purchasing/vendors', name: 'vendors', component: () => import('@/views/purchasing/VendorsList.vue'), meta: { title: 'Vendors', phase2: true } },
  { path: 'purchasing/bills', name: 'bills', component: () => import('@/views/purchasing/BillsList.vue'), meta: { title: 'Bills', phase2: true } },
  { path: 'inventory/products', name: 'products', component: () => import('@/views/inventory/ProductsList.vue'), meta: { title: 'Products', phase2: true } },
  { path: 'inventory/stock', name: 'stock', component: () => import('@/views/inventory/StockLevelsView.vue'), meta: { title: 'Stock Levels', phase2: true } },
  { path: 'inventory/warehouses', name: 'warehouses', component: () => import('@/views/inventory/WarehousesView.vue'), meta: { title: 'Warehouses', phase2: true } },
  { path: 'inventory/movements', name: 'movements', component: () => import('@/views/inventory/MovementsView.vue'), meta: { title: 'Stock Movements', phase2: true } },
  { path: 'accounting/accounts', name: 'accounts', component: () => import('@/views/accounting/ChartOfAccountsView.vue'), meta: { title: 'Chart of Accounts', phase2: true } },
  { path: 'accounting/journals', name: 'journals', component: () => import('@/views/accounting/JournalEntriesView.vue'), meta: { title: 'Journal Entries', phase2: true } },
  { path: 'accounting/ledger', name: 'ledger', component: () => import('@/views/accounting/GeneralLedgerView.vue'), meta: { title: 'General Ledger', phase2: true } },
  { path: 'accounting/trial-balance', name: 'trial-balance', component: () => import('@/views/accounting/TrialBalanceView.vue'), meta: { title: 'Trial Balance', phase2: true } },
  { path: 'accounting/pnl', name: 'pnl', component: () => import('@/views/accounting/ProfitLossView.vue'), meta: { title: 'Profit and Loss', phase2: true } },
  { path: 'accounting/balance-sheet', name: 'balance-sheet', component: () => import('@/views/accounting/BalanceSheetView.vue'), meta: { title: 'Balance Sheet', phase2: true } },
  { path: 'crm/leads', name: 'leads', component: () => import('@/views/crm/LeadsView.vue'), meta: { title: 'Leads' } },
  { path: 'crm/opportunities', name: 'opportunities', component: () => import('@/views/crm/OpportunitiesView.vue'), meta: { title: 'Opportunities' } },
  { path: 'crm/contacts', name: 'contacts', component: () => import('@/views/crm/ContactsView.vue'), meta: { title: 'Contacts' } },
  { path: 'crm/activities', name: 'activities', component: () => import('@/views/crm/ActivitiesView.vue'), meta: { title: 'Activities' } },
  { path: 'hr/employees', name: 'employees', component: () => import('@/views/hr/EmployeesView.vue'), meta: { title: 'Employees', phase2: true } },
  { path: 'hr/departments', name: 'departments', component: () => import('@/views/hr/DepartmentsView.vue'), meta: { title: 'Departments', phase2: true } },
  { path: 'hr/attendance', name: 'attendance', component: () => import('@/views/hr/AttendanceView.vue'), meta: { title: 'Attendance', phase2: true } },
  { path: 'hr/payroll', name: 'payroll', component: () => import('@/views/hr/PayrollView.vue'), meta: { title: 'Payroll', phase2: true } },
  { path: 'hr/leave', name: 'leave', component: () => import('@/views/hr/LeaveView.vue'), meta: { title: 'Leave Requests', phase2: true } },
  { path: 'manufacturing/bom', name: 'bom', component: () => import('@/views/manufacturing/BomView.vue'), meta: { title: 'Bill of Materials', phase2: true } },
  { path: 'manufacturing/work-orders', name: 'work-orders', component: () => import('@/views/manufacturing/WorkOrdersView.vue'), meta: { title: 'Work Orders', phase2: true } },
  { path: 'manufacturing/planning', name: 'planning', component: () => import('@/views/manufacturing/PlanningView.vue'), meta: { title: 'Production Planning', phase2: true } },
  { path: 'projects', name: 'projects', component: () => import('@/views/projects/ProjectsView.vue'), meta: { title: 'Projects' } },
  { path: 'projects/tasks', name: 'tasks', component: () => import('@/views/projects/TasksView.vue'), meta: { title: 'Tasks' } },
  { path: 'projects/timesheets', name: 'timesheets', component: () => import('@/views/projects/TimesheetsView.vue'), meta: { title: 'Timesheets' } },
  { path: 'reports', name: 'reports', component: () => import('@/views/reports/ReportsView.vue'), meta: { title: 'Reports' } },
  { path: 'settings', name: 'settings', component: () => import('@/views/settings/SettingsView.vue'), meta: { title: 'Settings' } }
]

const proposalChildren: RouteRecordRaw[] = [
  { path: 'company', name: 'proposal-company', component: () => import('@/views/proposal/CompanyProfile.vue'), meta: { title: 'Company Profile' } },
  { path: 'portfolio', name: 'proposal-portfolio', component: () => import('@/views/proposal/Portfolio.vue'), meta: { title: 'Portfolio' } },
  { path: 'solution', name: 'proposal-solution', component: () => import('@/views/proposal/SolutionOverview.vue'), meta: { title: 'Solution Overview' } },
  { path: 'cost', name: 'proposal-cost', component: () => import('@/views/proposal/CostEstimate.vue'), meta: { title: 'Cost Estimate' } },
  { path: 'timeline', name: 'proposal-timeline', component: () => import('@/views/proposal/Timeline.vue'), meta: { title: 'Timeline' } }
]

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [{ path: '', name: 'login', component: () => import('@/views/auth/LoginView.vue') }]
  },
  {
    path: '/proposal',
    component: () => import('@/layouts/ProposalLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', redirect: '/proposal/company' }, ...proposalChildren]
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', redirect: '/dashboard' }, ...mainChildren]
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') }
]
