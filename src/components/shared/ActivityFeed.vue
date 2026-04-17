<script setup lang="ts">
import { Activity } from 'lucide-vue-next'
import type { ActivityEntry } from '@/types'
import { formatRelative } from '@/composables/useFormat'

interface Props {
  entries: ActivityEntry[]
}
defineProps<Props>()
</script>

<template>
  <div class="space-y-3">
    <div v-for="entry in entries" :key="entry.id" class="flex items-start gap-3">
      <div class="h-8 w-8 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
        <Activity class="h-4 w-4" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium truncate">{{ entry.title }}</p>
        <p class="text-xs text-text-muted truncate">{{ entry.description }} — {{ entry.actor }}</p>
        <p class="text-[11px] text-text-muted mt-0.5">{{ formatRelative(entry.timestamp) }}</p>
      </div>
    </div>
    <div v-if="entries.length === 0" class="text-xs text-text-muted">No recent activity.</div>
  </div>
</template>
