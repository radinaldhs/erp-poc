<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ArrowLeft, Briefcase, Presentation, Wrench, DollarSign, Route } from 'lucide-vue-next'

const items = [
  { to: '/proposal/company', label: 'Company Profile', icon: Briefcase },
  { to: '/proposal/portfolio', label: 'Portfolio', icon: Presentation },
  { to: '/proposal/solution', label: 'Solution Overview', icon: Wrench },
  { to: '/proposal/cost', label: 'Cost Estimate', icon: DollarSign },
  { to: '/proposal/timeline', label: 'Timeline', icon: Route }
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/5 via-bg to-bg">
    <div class="border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-20">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 lg:px-6 h-14">
        <RouterLink to="/dashboard" class="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text shrink-0">
          <ArrowLeft class="h-4 w-4" /> Back to ERP
        </RouterLink>
        <nav class="hidden md:flex items-center gap-1">
          <RouterLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            active-class="bg-primary/10 text-primary"
            class="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md text-text-muted hover:text-text"
          >
            <component :is="item.icon" class="h-3.5 w-3.5" />
            {{ item.label }}
          </RouterLink>
        </nav>
        <a
          href="https://radinal.com"
          target="_blank"
          rel="noopener"
          class="md:hidden inline-flex items-center gap-2 text-sm font-semibold"
        >
          <span class="h-7 w-7 rounded-md bg-primary text-primary-foreground inline-flex items-center justify-center text-xs font-bold">R</span>
          Radinal
        </a>
      </div>
      <nav class="md:hidden flex items-center gap-1 overflow-x-auto scrollbar-thin px-4 pb-2 -mt-1">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          active-class="bg-primary/10 text-primary"
          class="inline-flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs rounded-md text-text-muted hover:text-text whitespace-nowrap"
        >
          <component :is="item.icon" class="h-3.5 w-3.5" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
    <div class="max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-12 pb-28">
      <RouterView />
    </div>
    <footer class="max-w-5xl mx-auto px-4 lg:px-8 pb-28 -mt-16 text-center text-xs text-text-muted">
      Proposal prepared by
      <a href="https://radinal.com" target="_blank" rel="noopener" class="font-medium text-primary hover:underline">Radinal</a>
    </footer>
  </div>
</template>
