<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'

interface LineEstimate {
  module: string
  description: string
  weeks: number
  rate: number
}

const baseRate = 1800
const lines: LineEstimate[] = [
  { module: 'Discovery and Architecture', description: 'Workshops, data model, integration plan', weeks: 2, rate: baseRate },
  { module: 'Field Sales Upload', description: 'Excel pipeline, validation, upload history', weeks: 3, rate: baseRate },
  { module: 'Sales Analytics', description: 'Dashboards, channel tabs, export, KPIs', weeks: 3, rate: baseRate },
  { module: 'Promo Workflow', description: 'Tiered approvals, audit log, PDF letters', weeks: 4, rate: baseRate },
  { module: 'Core Sales and CRM', description: 'Customers, quotes, orders, invoices, leads', weeks: 4, rate: baseRate },
  { module: 'Projects Module', description: 'Projects, Kanban tasks, timesheets', weeks: 2, rate: baseRate },
  { module: 'Phase 2 Scaffold', description: 'Stubbed modules with navigation and seed data', weeks: 1, rate: baseRate },
  { module: 'UX Polish and QA', description: 'Accessibility pass, cross-browser, release readiness', weeks: 2, rate: baseRate }
]

const totalWeeks = computed(() => lines.reduce((s, l) => s + l.weeks, 0))
const subtotal = computed(() => lines.reduce((s, l) => s + l.weeks * l.rate, 0))
const contingency = computed(() => Math.round(subtotal.value * 0.1))
const grandTotal = computed(() => subtotal.value + contingency.value)
</script>

<template>
  <section class="space-y-6">
    <div class="text-center space-y-2">
      <BaseBadge tone="primary">Cost Estimate</BaseBadge>
      <h1 class="text-4xl font-semibold tracking-tight">Investment Summary</h1>
      <p class="text-text-muted max-w-2xl mx-auto">
        Time-and-materials estimate based on a fixed weekly blended rate. Final SOW will refine ranges after a
        two-week discovery sprint.
      </p>
    </div>

    <BaseCard>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-surface/60 text-text-muted text-xs uppercase tracking-wide">
            <tr>
              <th class="px-3 py-2 text-left">Module</th>
              <th class="px-3 py-2 text-left">Description</th>
              <th class="px-3 py-2 text-right">Weeks</th>
              <th class="px-3 py-2 text-right">Rate / Week</th>
              <th class="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in lines" :key="line.module" class="border-t border-border">
              <td class="px-3 py-2 font-medium">{{ line.module }}</td>
              <td class="px-3 py-2 text-text-muted">{{ line.description }}</td>
              <td class="px-3 py-2 text-right">{{ line.weeks }}</td>
              <td class="px-3 py-2 text-right"><CurrencyDisplay :value="line.rate" /></td>
              <td class="px-3 py-2 text-right">
                <CurrencyDisplay :value="line.weeks * line.rate" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <div class="grid gap-4 md:grid-cols-3">
      <BaseCard title="Total Weeks">
        <p class="text-3xl font-semibold">{{ totalWeeks }}</p>
        <p class="text-xs text-text-muted">Delivery across parallel workstreams, not strictly sequential.</p>
      </BaseCard>
      <BaseCard title="Subtotal">
        <CurrencyDisplay :value="subtotal" class="text-3xl font-semibold" />
        <p class="text-xs text-text-muted">Excludes optional managed service, hosting, and third-party licenses.</p>
      </BaseCard>
      <BaseCard title="Estimate Including Contingency">
        <CurrencyDisplay :value="grandTotal" class="text-3xl font-semibold text-primary" />
        <p class="text-xs text-text-muted">Includes a 10 percent contingency for scope discovery and late requests.</p>
      </BaseCard>
    </div>
  </section>
</template>
