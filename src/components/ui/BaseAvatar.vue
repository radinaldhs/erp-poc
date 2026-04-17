<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), { size: 'md' })

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-6 w-6 text-[10px]'
    case 'lg':
      return 'h-12 w-12 text-base'
    default:
      return 'h-9 w-9 text-xs'
  }
})
</script>

<template>
  <span :class="['inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold uppercase', sizeClass]">
    {{ initials }}
  </span>
</template>
