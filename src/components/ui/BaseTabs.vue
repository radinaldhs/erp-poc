<script setup lang="ts">
interface Tab {
  key: string
  label: string
  count?: number
}

interface Props {
  modelValue: string
  tabs: Tab[]
}
defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [key: string] }>()
</script>

<template>
  <div class="border-b border-border">
    <nav class="flex gap-1 -mb-px">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'px-4 py-2 text-sm border-b-2 inline-flex items-center gap-2 transition-colors',
          tab.key === modelValue
            ? 'border-primary text-primary font-medium'
            : 'border-transparent text-text-muted hover:text-text'
        ]"
        @click="emit('update:modelValue', tab.key)"
      >
        {{ tab.label }}
        <span v-if="tab.count != null" class="text-xs bg-border/60 text-text px-1.5 py-0.5 rounded">{{ tab.count }}</span>
      </button>
    </nav>
  </div>
</template>
