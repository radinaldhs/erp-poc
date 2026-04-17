<script setup lang="ts">
interface Props {
  startWeek: number
  endWeek: number
  maxWeek: number
  label?: string
  tone?: 'primary' | 'success' | 'warning' | 'danger'
}

const props = withDefaults(defineProps<Props>(), { tone: 'primary' })

const toneMap = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
}

const leftPct = ((props.startWeek - 1) / props.maxWeek) * 100
const widthPct = ((props.endWeek - props.startWeek + 1) / props.maxWeek) * 100
</script>

<template>
  <div class="relative h-6 rounded-md bg-surface border border-border">
    <div
      :class="[toneMap[tone], 'absolute h-full rounded-md text-[11px] text-white flex items-center justify-center px-2 whitespace-nowrap']"
      :style="{ left: leftPct + '%', width: widthPct + '%' }"
    >
      {{ label }}
    </div>
  </div>
</template>
