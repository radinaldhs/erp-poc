<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  label: string
  removable?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ remove: [] }>()
</script>

<template>
  <span class="inline-flex items-center gap-1 rounded-md bg-surface border border-border px-2 py-0.5 text-xs">
    {{ label }}
    <button v-if="removable" class="text-text-muted hover:text-danger" @click="emit('remove')">
      <X class="h-3 w-3" />
    </button>
  </span>
</template>
