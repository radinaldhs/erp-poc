<script setup lang="ts">
import { BarChart3, FileSpreadsheet, ShieldCheck, Workflow, Layers, Zap } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const pillars = [
  {
    icon: FileSpreadsheet,
    title: 'Field Sales Data Ingestion',
    body: 'Drag-and-drop Excel upload with automatic column mapping, per-row validation, and an instant preview before commit.'
  },
  {
    icon: BarChart3,
    title: 'Unified Sales Analytics',
    body: 'Offline and online channels on a single dashboard, with channel tabs, date range presets, and Excel export for deeper analysis.'
  },
  {
    icon: Workflow,
    title: 'Promo Approval Workflow',
    body: 'Tiered approvals routed from Sales through Area Manager, Regional Manager, and Finance Director, with auditable trails and PDF approval letters.'
  },
  {
    icon: Layers,
    title: 'Modular ERP Surface',
    body: 'Sales, CRM, and Projects are available today. Purchasing, Inventory, Accounting, HR, and Manufacturing are scoped as a second phase.'
  },
  {
    icon: ShieldCheck,
    title: 'Role-Aware Access',
    body: 'A role switcher makes demonstrations simple, and the underlying model is ready to be wired to real RBAC with a proper identity provider.'
  },
  {
    icon: Zap,
    title: 'Fast, Demonstrable Value',
    body: 'Frontend-only proof-of-concept seeded with realistic data so stakeholders can interact with the experience without infrastructure setup.'
  }
]

const architecture = [
  { layer: 'Experience', items: 'Vue 3, TypeScript, Tailwind, Chart.js' },
  { layer: 'State', items: 'Pinia, composables, reactive localStorage' },
  { layer: 'Integration', items: 'Excel (SheetJS), PDF (jsPDF), future REST adapters' },
  { layer: 'Delivery', items: 'Vite build, static hosting, incremental Phase 2 modules' }
]
</script>

<template>
  <section class="space-y-8">
    <div class="text-center space-y-2">
      <BaseBadge tone="primary">Solution Overview</BaseBadge>
      <h1 class="text-4xl font-semibold tracking-tight">What We Are Delivering</h1>
      <p class="text-text-muted max-w-2xl mx-auto">
        A focused proof-of-concept that lets your team feel the target workflow end to end, anchored around the
        priority features you identified.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <BaseCard v-for="p in pillars" :key="p.title">
        <component :is="p.icon" class="h-6 w-6 text-primary" />
        <h3 class="text-lg font-semibold mt-2">{{ p.title }}</h3>
        <p class="text-sm text-text-muted mt-1 leading-relaxed">{{ p.body }}</p>
      </BaseCard>
    </div>

    <BaseCard title="Architecture Snapshot" subtitle="How the solution is layered">
      <div class="grid gap-3 md:grid-cols-4">
        <div v-for="a in architecture" :key="a.layer" class="rounded-md border border-border p-3 bg-surface/60">
          <p class="text-xs uppercase tracking-wide text-text-muted">{{ a.layer }}</p>
          <p class="text-sm mt-1 font-medium">{{ a.items }}</p>
        </div>
      </div>
    </BaseCard>
  </section>
</template>
