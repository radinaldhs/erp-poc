<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  phaseTag?: string
}
defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
    <div>
      <div class="flex items-center gap-2 flex-wrap">
        <h1 class="text-2xl font-semibold tracking-tight">{{ title }}</h1>
        <span v-if="phaseTag" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
          {{ phaseTag }}
        </span>
      </div>
      <p v-if="subtitle" class="text-sm text-text-muted mt-1">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <slot name="actions" />
    </div>
  </div>
</template>
