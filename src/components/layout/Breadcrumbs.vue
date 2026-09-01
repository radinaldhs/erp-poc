<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRight } from 'lucide-vue-next'

const route = useRoute()

const crumbs = computed<string[]>(() => {
  const parts = route.path.split('/').filter(Boolean)
  const idParam = typeof route.params.id === 'string' ? route.params.id : undefined
  return parts.map((p) => {
    // A detail route's last segment is a raw entity id (e.g. "Po_8nwscbzg5a"), not
    // something a user should see. Swap it for the route's own descriptive title.
    if (idParam && p === idParam) {
      return typeof route.meta.title === 'string' ? route.meta.title : p.replace(/-/g, ' ')
    }
    return p.replace(/-/g, ' ')
  })
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
