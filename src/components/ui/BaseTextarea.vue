<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  rows?: number
  required?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), { modelValue: '', rows: 3, required: false, disabled: false })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(e: Event): void {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <label class="block space-y-1">
    <span v-if="label" class="text-xs font-medium text-text-muted">{{ label }}</span>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :required="required"
      :disabled="disabled"
      class="input-base resize-y"
      @input="onInput"
    />
  </label>
</template>
