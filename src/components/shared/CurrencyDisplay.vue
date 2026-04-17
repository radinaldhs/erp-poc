<script setup lang="ts">
import { formatCurrency } from '@/composables/useFormat'

interface Props {
  value: number
  currency?: string
  tone?: 'default' | 'positive' | 'negative'
}
withDefaults(defineProps<Props>(), { currency: 'USD', tone: 'default' })

const toneClass = {
  default: '',
  positive: 'text-success',
  negative: 'text-danger'
}
</script>

<template>
  <span :class="toneClass[tone]">{{ formatCurrency(value, currency) }}</span>
</template>
