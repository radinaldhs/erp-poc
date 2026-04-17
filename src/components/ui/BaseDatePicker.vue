<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  required?: boolean
}
withDefaults(defineProps<Props>(), { required: false })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

function toInputValue(val: string): string {
  if (!val) return ''
  return val.length > 10 ? val.slice(0, 10) : val
}
</script>

<template>
  <label class="block space-y-1">
    <span v-if="label" class="text-xs font-medium text-text-muted">{{ label }}</span>
    <input
      type="date"
      :value="toInputValue(modelValue)"
      :required="required"
      class="input-base"
      @input="onInput"
    />
  </label>
</template>
