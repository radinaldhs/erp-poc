<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

interface CaseStudy {
  title: string
  client: string
  industry: string
  challenge: string
  solution: string
  outcome: string
  tags: string[]
}

const studies: CaseStudy[] = [
  {
    title: 'Sales Operations Modernization',
    client: 'Regional Distributor',
    industry: 'Distribution',
    challenge:
      'Field sales data was arriving in disparate Excel files, blocking real-time performance reporting and slowing promo approvals.',
    solution:
      'Rolled out a Vue-based operational cockpit with Excel ingestion, role-based promo workflow, and integrated dashboards bridging offline and online channels.',
    outcome:
      'Reduced monthly close effort by 60 percent. Promo approval cycle time cut from 8 days to under 48 hours.',
    tags: ['Vue 3', 'Excel Ingestion', 'Role Workflow', 'Dashboards']
  },
  {
    title: 'Customer Portal Redesign',
    client: 'Mid-Market SaaS',
    industry: 'SaaS',
    challenge:
      'Legacy portal had 27 percent drop-off during onboarding and a support queue dominated by navigation issues.',
    solution:
      'Redesigned the information architecture, introduced a component library, and rebuilt the portal on a modern TypeScript stack with robust accessibility.',
    outcome:
      'Drop-off reduced to 11 percent. NPS climbed from +14 to +38 within two quarters of launch.',
    tags: ['UX Research', 'Design System', 'TypeScript', 'A11y']
  },
  {
    title: 'Warehouse Operations App',
    client: 'National Retailer',
    industry: 'Retail',
    challenge:
      'Paper-based picking flow caused 4.2 percent order error rate and slow replenishment cycles.',
    solution:
      'Delivered a mobile-friendly web app for scan-driven picking, bin replenishment, and real-time stock adjustments, integrated with the existing ERP.',
    outcome:
      'Order error rate reduced to 0.6 percent. Replenishment cycle time improved by 34 percent.',
    tags: ['PWA', 'Barcode', 'Real-Time Sync', 'ERP Integration']
  },
  {
    title: 'Finance Reporting Pipeline',
    client: 'Professional Services Firm',
    industry: 'Services',
    challenge:
      'Monthly P&L took two full weeks to produce, relying on manual reconciliation of general ledger exports.',
    solution:
      'Built a nightly data pipeline, a reconciliation engine, and a finance-grade dashboard suite with drill-through to source records.',
    outcome:
      'Month-end reporting delivered by day 3. Finance team freed up 70 hours per month for advisory work.',
    tags: ['Data Pipeline', 'Reconciliation', 'BI', 'Automation']
  }
]
</script>

<template>
  <section class="space-y-6">
    <div class="text-center space-y-2">
      <BaseBadge tone="primary">Portfolio</BaseBadge>
      <h1 class="text-4xl font-semibold tracking-tight">Selected Case Studies</h1>
      <p class="text-text-muted max-w-2xl mx-auto">
        A sample of how we approach real client challenges, blending product strategy with technical execution.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <BaseCard v-for="study in studies" :key="study.title">
        <div class="flex items-center gap-2 flex-wrap">
          <BaseBadge tone="primary">{{ study.industry }}</BaseBadge>
          <span class="text-xs text-text-muted">{{ study.client }}</span>
        </div>
        <h3 class="text-lg font-semibold mt-2">{{ study.title }}</h3>

        <div class="mt-3 space-y-3 text-sm">
          <div>
            <p class="text-[11px] text-text-muted uppercase tracking-wide">Challenge</p>
            <p class="mt-0.5">{{ study.challenge }}</p>
          </div>
          <div>
            <p class="text-[11px] text-text-muted uppercase tracking-wide">Solution</p>
            <p class="mt-0.5">{{ study.solution }}</p>
          </div>
          <div>
            <p class="text-[11px] text-text-muted uppercase tracking-wide">Outcome</p>
            <p class="mt-0.5 text-success font-medium">{{ study.outcome }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 mt-4">
          <BaseBadge v-for="tag in study.tags" :key="tag" tone="neutral">{{ tag }}</BaseBadge>
        </div>
      </BaseCard>
    </div>
  </section>
</template>
