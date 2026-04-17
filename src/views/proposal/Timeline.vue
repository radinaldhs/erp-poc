<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import GanttBar from '@/components/shared/GanttBar.vue'

interface Phase {
  name: string
  description: string
  startWeek: number
  endWeek: number
  tone: 'primary' | 'success' | 'warning' | 'danger'
  deliverables: string[]
}

const MAX_WEEK = 21

const phases: Phase[] = [
  {
    name: 'Discovery and Design',
    description: 'Workshops, data modeling, wireframes, architectural decisions.',
    startWeek: 1,
    endWeek: 2,
    tone: 'primary',
    deliverables: ['Discovery report', 'Design brief', 'Target architecture']
  },
  {
    name: 'Priority Features',
    description: 'Field upload, sales analytics, promo workflow end-to-end.',
    startWeek: 3,
    endWeek: 10,
    tone: 'success',
    deliverables: ['Excel ingestion', 'Integrated analytics', 'Tiered approvals', 'PDF approval letter']
  },
  {
    name: 'Core ERP Surface',
    description: 'Sales documents, CRM pipeline, projects, reports.',
    startWeek: 6,
    endWeek: 14,
    tone: 'primary',
    deliverables: ['Quotes, orders, invoices', 'CRM leads and opportunities', 'Project tracking']
  },
  {
    name: 'Phase 2 Scaffolding',
    description: 'Stubbed modules, roadmap messaging, role-based navigation.',
    startWeek: 12,
    endWeek: 15,
    tone: 'warning',
    deliverables: ['Phase 2 module shells', 'Roadmap documentation']
  },
  {
    name: 'QA and Hardening',
    description: 'Accessibility, cross-browser testing, polish, UAT.',
    startWeek: 15,
    endWeek: 19,
    tone: 'warning',
    deliverables: ['Accessibility audit', 'UAT feedback loop', 'Bug triage']
  },
  {
    name: 'Launch',
    description: 'Release, onboarding, post-launch support plan.',
    startWeek: 19,
    endWeek: 21,
    tone: 'success',
    deliverables: ['Production release', 'Training sessions', '30-day hypercare']
  }
]

const weekTicks = Array.from({ length: MAX_WEEK }, (_, i) => i + 1)
</script>

<template>
  <section class="space-y-6">
    <div class="text-center space-y-2">
      <BaseBadge tone="primary">Timeline</BaseBadge>
      <h1 class="text-4xl font-semibold tracking-tight">Delivery Plan</h1>
      <p class="text-text-muted max-w-2xl mx-auto">
        A parallelized 21-week plan. Priority features unlock value early; Phase 2 scaffolding keeps long-term
        direction visible without blocking the proof-of-concept launch.
      </p>
    </div>

    <BaseCard title="Gantt View">
      <div class="space-y-3">
        <div class="grid items-center gap-2" style="grid-template-columns: 200px 1fr">
          <div />
          <div class="relative">
            <div class="flex justify-between text-[10px] text-text-muted">
              <span v-for="w in [1, 5, 10, 15, 20]" :key="w">W{{ w }}</span>
            </div>
          </div>
        </div>
        <div v-for="phase in phases" :key="phase.name" class="grid items-center gap-3" style="grid-template-columns: 200px 1fr">
          <div>
            <p class="text-sm font-semibold">{{ phase.name }}</p>
            <p class="text-[11px] text-text-muted">W{{ phase.startWeek }} - W{{ phase.endWeek }}</p>
          </div>
          <GanttBar :start-week="phase.startWeek" :end-week="phase.endWeek" :max-week="MAX_WEEK" :tone="phase.tone" :label="phase.name" />
        </div>
      </div>
    </BaseCard>

    <div class="grid gap-4 md:grid-cols-2">
      <BaseCard v-for="phase in phases" :key="phase.name">
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="text-lg font-semibold">{{ phase.name }}</h3>
          <BaseBadge tone="neutral">W{{ phase.startWeek }} - W{{ phase.endWeek }}</BaseBadge>
        </div>
        <p class="text-sm text-text-muted mt-1">{{ phase.description }}</p>
        <ul class="text-sm mt-3 space-y-1">
          <li v-for="d in phase.deliverables" :key="d" class="flex gap-2">
            <span class="text-primary">•</span> {{ d }}
          </li>
        </ul>
      </BaseCard>
    </div>
  </section>
</template>
