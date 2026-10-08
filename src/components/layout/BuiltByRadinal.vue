<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowUpRight, ChevronDown } from 'lucide-vue-next'

const STORAGE_KEY = 'erp:ctaMinimized'

const readMinimized = (): boolean => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const minimized = ref(readMinimized())

watch(minimized, (next) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  } catch {
    /* storage unavailable - keep in-memory state only */
  }
})
</script>

<template>
  <div class="no-print fixed z-[35] bottom-3 right-3 left-3 sm:left-auto sm:bottom-5 sm:right-5 flex justify-end pointer-events-none">
    <button
      v-if="minimized"
      type="button"
      class="pointer-events-auto h-11 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground pl-1.5 pr-4 shadow-lg shadow-primary/30 hover:opacity-95 focus-ring"
      aria-label="Want to build this for your company? Show details"
      @click="minimized = false"
    >
      <span class="h-8 w-8 rounded-full bg-primary-foreground/20 inline-flex items-center justify-center font-bold text-sm">R</span>
      <span class="text-sm font-medium">Build yours</span>
    </button>

    <div
      v-else
      class="pointer-events-auto w-full sm:w-auto sm:max-w-sm flex items-center gap-3 rounded-xl border border-border bg-surface/95 backdrop-blur p-2.5 pr-2 shadow-xl"
    >
      <span class="h-9 w-9 shrink-0 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center font-bold">R</span>
      <a
        href="https://radinal.com"
        target="_blank"
        rel="noopener"
        class="group min-w-0 flex-1 leading-tight"
      >
        <span class="block text-[13px] sm:text-sm font-semibold">Want to build this for your company?</span>
        <span class="mt-0.5 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
          Please visit radinal.com <ArrowUpRight class="h-3.5 w-3.5" />
        </span>
      </a>
      <button
        type="button"
        class="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-border/40 focus-ring"
        aria-label="Minimize"
        @click="minimized = true"
      >
        <ChevronDown class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
