<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  page: number
  totalPages: number
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:page': [value: number] }>()

function prev(): void {
  if (props.page > 1) emit('update:page', props.page - 1)
}
function next(): void {
  if (props.page < props.totalPages) emit('update:page', props.page + 1)
}
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <button class="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border hover:bg-surface disabled:opacity-40" :disabled="page <= 1" @click="prev">
      <ChevronLeft class="h-3.5 w-3.5" />
    </button>
    <span class="px-2">Page {{ page }} of {{ totalPages }}</span>
    <button class="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border hover:bg-surface disabled:opacity-40" :disabled="page >= totalPages" @click="next">
      <ChevronRight class="h-3.5 w-3.5" />
    </button>
  </div>
</template>
