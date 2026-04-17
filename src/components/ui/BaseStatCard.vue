<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

interface Props {
  label: string
  value: string | number
  icon?: Component
  trend?: number
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  hint?: string
}

const props = withDefaults(defineProps<Props>(), { tone: 'neutral' })

const tintClass = computed(() => {
  switch (props.tone) {
    case 'primary':
      return 'bg-primary/10 text-primary'
    case 'success':
      return 'bg-success/10 text-success'
    case 'warning':
      return 'bg-warning/10 text-warning'
    case 'danger':
      return 'bg-danger/10 text-danger'
    case 'info':
      return 'bg-sky-500/10 text-sky-500'
    default:
      return 'bg-border/40 text-text-muted'
  }
})

const trendClass = computed(() => {
  if (props.trend == null) return ''
  return props.trend >= 0 ? 'text-success' : 'text-danger'
})
</script>

<template>
  <div class="card p-5 flex items-start gap-4 shadow-sm">
    <div :class="['h-10 w-10 rounded-lg inline-flex items-center justify-center shrink-0', tintClass]">
      <component :is="icon" v-if="icon" class="h-5 w-5" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-xs uppercase tracking-wide text-text-muted">{{ label }}</p>
      <p class="text-xl font-semibold mt-0.5 truncate">{{ value }}</p>
      <div class="flex items-center gap-2 mt-1 text-xs">
        <span v-if="trend != null" :class="trendClass">{{ trend >= 0 ? '+' : '' }}{{ trend.toFixed(1) }}%</span>
        <span v-if="hint" class="text-text-muted">{{ hint }}</span>
      </div>
    </div>
  </div>
</template>
