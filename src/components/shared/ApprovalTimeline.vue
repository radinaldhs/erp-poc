<script setup lang="ts">
import { Check, X, MessageCircle, Send } from 'lucide-vue-next'
import type { PromoAuditEntry } from '@/types'
import { formatDateTime } from '@/composables/useFormat'

interface Props {
  entries: PromoAuditEntry[]
}
defineProps<Props>()

const iconMap = {
  submit: Send,
  approve: Check,
  reject: X,
  comment: MessageCircle
}

const toneMap = {
  submit: 'bg-primary/10 text-primary',
  approve: 'bg-success/10 text-success',
  reject: 'bg-danger/10 text-danger',
  comment: 'bg-border/60 text-text-muted'
}
</script>

<template>
  <ol class="relative border-s border-border ml-3 space-y-4">
    <li v-for="entry in entries" :key="entry.id" class="ms-4">
      <div :class="['absolute -start-3 h-6 w-6 rounded-full inline-flex items-center justify-center ring-4 ring-bg', toneMap[entry.action]]">
        <component :is="iconMap[entry.action]" class="h-3 w-3" />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-semibold">{{ entry.actor }}</span>
        <span class="text-xs text-text-muted">— {{ entry.role }}</span>
      </div>
      <p class="text-xs text-text-muted capitalize">{{ entry.action }}
        <template v-if="entry.fromStatus || entry.toStatus">
          : <span class="font-medium text-text">{{ entry.fromStatus ?? '—' }}</span>
          <span class="mx-1">→</span>
          <span class="font-medium text-text">{{ entry.toStatus ?? '—' }}</span>
        </template>
      </p>
      <p v-if="entry.comment" class="text-sm mt-1">{{ entry.comment }}</p>
      <p class="text-[11px] text-text-muted mt-0.5">{{ formatDateTime(entry.timestamp) }}</p>
    </li>
  </ol>
</template>
