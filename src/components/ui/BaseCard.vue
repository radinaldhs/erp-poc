<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  padded?: boolean
}
withDefaults(defineProps<Props>(), { padded: true })
</script>

<template>
  <div class="card shadow-sm">
    <div v-if="title || $slots.header" class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
      <div>
        <h3 v-if="title" class="text-sm font-semibold">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-text-muted mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="header" />
    </div>
    <div :class="padded ? 'p-5' : ''">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-5 py-3 border-t border-border">
      <slot name="footer" />
    </div>
  </div>
</template>
