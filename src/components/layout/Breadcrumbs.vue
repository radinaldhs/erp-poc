<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRight } from 'lucide-vue-next'

const route = useRoute()

const crumbs = computed<string[]>(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts.map((p) => p.replace(/-/g, ' '))
})
</script>

<template>
  <nav class="flex items-center text-xs text-text-muted gap-1 flex-wrap">
    <span class="capitalize">Home</span>
    <template v-for="(c, i) in crumbs" :key="i">
      <ChevronRight class="h-3 w-3" />
      <span class="capitalize">{{ c }}</span>
    </template>
  </nav>
</template>
