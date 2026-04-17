<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

interface Props {
  message?: string
  title?: string
}
withDefaults(defineProps<Props>(), { message: 'No records found.', title: '' })
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 py-8 text-text-muted">
    <Inbox class="h-8 w-8 opacity-60" />
    <p v-if="title" class="text-sm font-semibold text-text">{{ title }}</p>
    <p class="text-xs">{{ message }}</p>
    <slot />
  </div>
</template>
