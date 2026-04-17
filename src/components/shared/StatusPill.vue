<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

interface Props {
  status: string
}

const props = defineProps<Props>()

const toneMap: Record<string, 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'neutral',
  pending: 'warning',
  approved: 'success',
  sent: 'info',
  paid: 'success',
  overdue: 'danger',
  cancelled: 'neutral',
  received: 'success',
  rejected: 'danger',
  Approved: 'success',
  Rejected: 'danger',
  Draft: 'neutral',
  'Pending Area Manager': 'warning',
  'Pending Regional Manager': 'warning',
  'Pending Finance Director': 'warning',
  active: 'success',
  inactive: 'neutral',
  completed: 'success',
  planned: 'primary',
  in_progress: 'info',
  on_hold: 'warning',
  todo: 'neutral',
  review: 'info',
  done: 'success',
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
  open: 'info',
  late: 'warning',
  absent: 'danger',
  present: 'success',
  leave: 'info',
  finalized: 'info',
  new: 'info',
  contacted: 'primary',
  qualified: 'success',
  unqualified: 'neutral',
  converted: 'success',
  prospecting: 'neutral',
  qualification: 'info',
  proposal: 'primary',
  negotiation: 'warning',
  closed_won: 'success',
  closed_lost: 'danger',
  refunded: 'warning'
}

const tone = computed(() => toneMap[props.status] ?? 'neutral')
const label = computed(() => props.status.replace(/_/g, ' '))
</script>

<template>
  <BaseBadge :tone="tone">
    <span class="capitalize">{{ label }}</span>
  </BaseBadge>
</template>
