<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false
})

const classes = computed(() => {
  const variantMap: Record<NonNullable<Props['variant']>, string> = {
    primary: 'bg-primary text-primary-foreground hover:brightness-110',
    secondary: 'bg-surface text-text border border-border hover:bg-border/50',
    ghost: 'text-text hover:bg-surface',
    danger: 'bg-danger text-white hover:brightness-110',
    success: 'bg-success text-white hover:brightness-110',
    outline: 'border border-border text-text hover:bg-surface'
  }
  const sizeMap: Record<NonNullable<Props['size']>, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  }
  const block = props.block ? 'w-full' : ''
  return `btn-base ${variantMap[props.variant]} ${sizeMap[props.size]} ${block}`
})
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="classes">
    <span v-if="loading" class="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
    <slot />
  </button>
</template>
