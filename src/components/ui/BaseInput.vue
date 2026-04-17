<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  min?: number | string
  max?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function onInput(e: Event): void {
  const target = e.target as HTMLInputElement
  const value = props.type === 'number' ? target.valueAsNumber : target.value
  emit('update:modelValue', value as string | number)
}
</script>

<template>
  <label class="block space-y-1">
    <span v-if="label" class="text-xs font-medium text-text-muted">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :min="min"
      :max="max"
      class="input-base"
      @input="onInput"
    />
    <span v-if="error" class="text-xs text-danger block">{{ error }}</span>
    <span v-else-if="hint" class="text-xs text-text-muted block">{{ hint }}</span>
  </label>
</template>
