<script setup lang="ts">
import type { SelectOption } from '@/types'

interface Props {
  modelValue: string
  label?: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), { required: false, disabled: false })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onChange(e: Event): void {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <label class="block space-y-1">
    <span v-if="label" class="text-xs font-medium text-text-muted">{{ label }}</span>
    <select :value="modelValue" :disabled="disabled" :required="required" class="input-base" @change="onChange">
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </label>
</template>
