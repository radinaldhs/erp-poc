<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function onChange(e: Event): void {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <label class="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
    <input type="checkbox" :checked="modelValue" :disabled="disabled" class="h-4 w-4 rounded border-border text-primary focus-ring" @change="onChange" />
    <span v-if="label">{{ label }}</span>
  </label>
</template>
