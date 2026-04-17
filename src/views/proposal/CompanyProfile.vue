<script setup lang="ts">
import { Building2, Users, Target, Award, ShieldCheck, Clock } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const stats = [
  { label: 'Team Members', value: '120+', icon: Users },
  { label: 'Years in Business', value: '10+', icon: Clock },
  { label: 'Completed Projects', value: '180+', icon: Award },
  { label: 'Enterprise Clients', value: '40+', icon: Building2 }
]

const values = [
  {
    icon: Target,
    title: 'Outcome-Driven',
    body: 'We align delivery milestones to measurable business outcomes, not just feature checklists.'
  },
  {
    icon: ShieldCheck,
    title: 'Security-First',
    body: 'Secure-by-default architecture with role-based access, audit trails, and encrypted data flows.'
  },
  {
    icon: Users,
    title: 'Partnership Mindset',
    body: 'Transparent communication, shared backlogs, and embedded product thinking with every engagement.'
  }
]
</script>

<template>
  <section class="space-y-8">
    <div class="text-center space-y-3">
      <BaseBadge tone="primary">About Our Agency</BaseBadge>
      <h1 class="text-4xl font-semibold tracking-tight">A Partner for Enterprise Delivery</h1>
      <p class="text-text-muted max-w-2xl mx-auto">
        We help ambitious organizations modernize critical business systems through pragmatic engineering,
        thoughtful product design, and delivery rigor that sticks.
      </p>
    </div>

    <div class="grid gap-4 grid-cols-2 md:grid-cols-4">
      <BaseCard v-for="s in stats" :key="s.label" class="text-center">
        <component :is="s.icon" class="h-6 w-6 text-primary mx-auto" />
        <p class="text-2xl font-semibold mt-2">{{ s.value }}</p>
        <p class="text-xs text-text-muted uppercase tracking-wide">{{ s.label }}</p>
      </BaseCard>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <BaseCard v-for="v in values" :key="v.title">
        <component :is="v.icon" class="h-6 w-6 text-primary" />
        <h3 class="text-lg font-semibold mt-2">{{ v.title }}</h3>
        <p class="text-sm text-text-muted mt-1 leading-relaxed">{{ v.body }}</p>
      </BaseCard>
    </div>

    <BaseCard title="Capability Highlights">
      <ul class="grid gap-2 md:grid-cols-2 text-sm">
        <li class="flex gap-2"><span class="text-primary">•</span> Vue, React, Next.js, TypeScript</li>
        <li class="flex gap-2"><span class="text-primary">•</span> Node.js, Go, Python backend services</li>
        <li class="flex gap-2"><span class="text-primary">•</span> Cloud-native on AWS, GCP, Azure</li>
        <li class="flex gap-2"><span class="text-primary">•</span> Data platforms and BI (warehouses, dashboards)</li>
        <li class="flex gap-2"><span class="text-primary">•</span> Mobile (iOS, Android, React Native)</li>
        <li class="flex gap-2"><span class="text-primary">•</span> UX research, design systems, accessibility</li>
      </ul>
    </BaseCard>
  </section>
</template>
