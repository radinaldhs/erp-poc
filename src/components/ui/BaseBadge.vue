<script setup lang="ts">
import { computed } from 'vue'

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface Props {
  tone?: Tone
  subtle?: boolean
}

const props = withDefaults(defineProps<Props>(), { tone: 'neutral', subtle: true })

const classes = computed(() => {
  const tone = props.tone
  const subtle = props.subtle
  const map: Record<Tone, { solid: string; subtle: string }> = {
    neutral: { solid: 'bg-border text-text', subtle: 'bg-border/40 text-text-muted' },
    primary: { solid: 'bg-primary text-primary-foreground', subtle: 'bg-primary/10 text-primary' },
    success: { solid: 'bg-success text-white', subtle: 'bg-success/10 text-success' },
    warning: { solid: 'bg-warning text-white', subtle: 'bg-warning/10 text-warning' },
    danger: { solid: 'bg-danger text-white', subtle: 'bg-danger/10 text-danger' },
    info: { solid: 'bg-primary text-primary-foreground', subtle: 'bg-primary/10 text-primary' }
  }
  return subtle ? map[tone].subtle : map[tone].solid
})
</script>

<template>
  <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', classes]">
    <slot />
  </span>
</template>
