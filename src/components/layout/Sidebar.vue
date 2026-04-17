<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  LayoutDashboard,
  BarChart3,
  Upload,
  History,
  FileText,
  ClipboardList,
  Receipt,
  Users,
  BadgePercent,
  Inbox,
  Send,
  ListChecks,
  Package,
  Warehouse as WarehouseIcon,
  ArrowRightLeft,
  ShoppingCart,
  Building2,
  CircleDollarSign,
  Book,
  BookOpen,
  Scale,
  TrendingUp,
  Landmark,
  UserPlus,
  Target,
  Contact,
  Activity,
  UserCog,
  Building,
  ClipboardCheck,
  CalendarCheck,
  Banknote,
  Factory,
  Wrench,
  Calendar,
  FolderKanban,
  ListTodo,
  Clock3,
  FileBarChart,
  Settings,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Layers,
  DollarSign,
  Presentation,
  Route
} from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const route = useRoute()

interface NavItem {
  to: string
  label: string
  icon: unknown
}
interface NavGroup {
  key: string
  label: string
  items: NavItem[]
  collapsible?: boolean
  accent?: boolean
}

const groups: NavGroup[] = [
  {
    key: 'overview',
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
  },
  {
    key: 'sales',
    label: 'Sales',
    items: [
      { to: '/sales-analytics', label: 'Sales Analytics', icon: BarChart3 },
      { to: '/sales-data/upload', label: 'Field Data Upload', icon: Upload },
      { to: '/sales-data/history', label: 'Upload History', icon: History },
      { to: '/sales/quotes', label: 'Quotes', icon: FileText },
      { to: '/sales/orders', label: 'Sales Orders', icon: ClipboardList },
      { to: '/sales/invoices', label: 'Invoices', icon: Receipt },
      { to: '/sales/customers', label: 'Customers', icon: Users }
    ]
  },
  {
    key: 'promos',
    label: 'Promo Management',
    items: [
      { to: '/promos/submit', label: 'Submit Promo', icon: Send },
      { to: '/promos', label: 'My Promos', icon: BadgePercent },
      { to: '/promos/approvals', label: 'Approval Queue', icon: Inbox }
    ]
  },
  {
    key: 'crm',
    label: 'CRM',
    items: [
      { to: '/crm/leads', label: 'Leads', icon: UserPlus },
      { to: '/crm/opportunities', label: 'Opportunities', icon: Target },
      { to: '/crm/contacts', label: 'Contacts', icon: Contact },
      { to: '/crm/activities', label: 'Activities', icon: Activity }
    ]
  },
  {
    key: 'projects',
    label: 'Projects',
    items: [
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/projects/tasks', label: 'Tasks', icon: ListTodo },
      { to: '/projects/timesheets', label: 'Timesheets', icon: Clock3 }
    ]
  },
  {
    key: 'phase2',
    label: 'Phase 2 — Roadmap',
    collapsible: true,
    items: [
      { to: '/purchasing/orders', label: 'Purchase Orders', icon: ShoppingCart },
      { to: '/purchasing/vendors', label: 'Vendors', icon: Building2 },
      { to: '/purchasing/bills', label: 'Bills', icon: CircleDollarSign },
      { to: '/inventory/products', label: 'Products', icon: Package },
      { to: '/inventory/stock', label: 'Stock Levels', icon: Layers },
      { to: '/inventory/warehouses', label: 'Warehouses', icon: WarehouseIcon },
      { to: '/inventory/movements', label: 'Stock Movements', icon: ArrowRightLeft },
      { to: '/accounting/accounts', label: 'Chart of Accounts', icon: Book },
      { to: '/accounting/journals', label: 'Journals', icon: BookOpen },
      { to: '/accounting/ledger', label: 'General Ledger', icon: Landmark },
      { to: '/accounting/trial-balance', label: 'Trial Balance', icon: Scale },
      { to: '/accounting/pnl', label: 'Profit and Loss', icon: TrendingUp },
      { to: '/accounting/balance-sheet', label: 'Balance Sheet', icon: Landmark },
      { to: '/hr/employees', label: 'Employees', icon: UserCog },
      { to: '/hr/departments', label: 'Departments', icon: Building },
      { to: '/hr/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/hr/payroll', label: 'Payroll', icon: Banknote },
      { to: '/hr/leave', label: 'Leave Requests', icon: ClipboardCheck },
      { to: '/manufacturing/bom', label: 'BOM', icon: Layers },
      { to: '/manufacturing/work-orders', label: 'Work Orders', icon: Factory },
      { to: '/manufacturing/planning', label: 'Planning', icon: Calendar }
    ]
  },
  {
    key: 'reports',
    label: 'Reports and Settings',
    items: [
      { to: '/reports', label: 'Reports', icon: FileBarChart },
      { to: '/settings', label: 'Settings', icon: Settings }
    ]
  }
]

const isActive = (path: string): boolean => route.path === path

const showPhase2 = computed(() => !ui.phase2Collapsed)

function togglePhase2(): void {
  ui.togglePhase2()
}
</script>

<template>
  <aside
    :class="[
      'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform',
      ui.sidebarCollapsed ? '-translate-x-full' : 'translate-x-0',
      'lg:translate-x-0'
    ]"
  >
    <div class="h-14 flex items-center justify-between px-4 border-b border-border">
      <RouterLink to="/dashboard" class="flex items-center gap-2 font-semibold">
        <div class="h-8 w-8 rounded-md bg-primary text-primary-foreground inline-flex items-center justify-center font-bold">E</div>
        <span>ERP POC</span>
      </RouterLink>
    </div>

    <nav class="flex-1 overflow-y-auto py-3 scrollbar-thin">
      <div v-for="group in groups" :key="group.key" class="px-2 pb-4">
        <div
          v-if="group.collapsible"
          class="flex items-center justify-between px-2 py-1 cursor-pointer"
          @click="togglePhase2"
        >
          <span class="text-[11px] uppercase tracking-wider text-text-muted">{{ group.label }}</span>
          <component :is="showPhase2 ? ChevronDown : ChevronRight" class="h-3.5 w-3.5 text-text-muted" />
        </div>
        <div v-else class="px-2 py-1 text-[11px] uppercase tracking-wider text-text-muted">
          {{ group.label }}
        </div>
        <div
          v-if="!group.collapsible || showPhase2"
          :class="[
            'mt-1 space-y-0.5',
            group.accent && 'rounded-md bg-primary/5 p-1'
          ]"
        >
          <RouterLink
            v-for="item in group.items"
            :key="item.to + item.label"
            :to="item.to"
            :class="[
              'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
              isActive(item.to)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-text hover:bg-border/40'
            ]"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="border-t border-border p-3 text-[11px] text-text-muted">
      <p>Demo Company — ERP POC</p>
      <p class="mt-0.5">All data is mock, stored locally.</p>
    </div>
  </aside>
</template>
