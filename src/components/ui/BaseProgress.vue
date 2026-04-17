<script setup lang="ts">
interface Props {
  value: number
  max?: number
  tone?: 'primary' | 'success' | 'warning' | 'danger'
}
withDefaults(defineProps<Props>(), { max: 100, tone: 'primary' })

const toneMap = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
}
</script>

<template>
  <div class="h-2 rounded-full bg-border/50 overflow-hidden">
    <div
      :class="[toneMap[tone], 'h-full transition-all']"
      :style="{ width: Math.min(100, (value / max) * 100) + '%' }"
    />
  </div>
</template>
