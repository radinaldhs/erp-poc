<script setup lang="ts">
interface Props {
  title: string
  description?: string
}
defineProps<Props>()
</script>

<template>
  <section class="space-y-3">
    <div>
      <h3 class="text-sm font-semibold">{{ title }}</h3>
      <p v-if="description" class="text-xs text-text-muted">{{ description }}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <slot />
    </div>
  </section>
</template>
