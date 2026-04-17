<script setup lang="ts">
import { Check } from 'lucide-vue-next'

interface Step {
  key: string
  label: string
}

interface Props {
  steps: Step[]
  current: string
  done?: string[]
}
defineProps<Props>()
</script>

<template>
  <ol class="flex items-center gap-2">
    <li
      v-for="(step, index) in steps"
      :key="step.key"
      class="flex items-center gap-2"
    >
      <div
        :class="[
          'h-7 w-7 rounded-full inline-flex items-center justify-center text-xs font-semibold border',
          done?.includes(step.key)
            ? 'bg-success text-white border-success'
            : step.key === current
            ? 'bg-primary text-white border-primary'
            : 'border-border text-text-muted'
        ]"
      >
        <Check v-if="done?.includes(step.key)" class="h-3.5 w-3.5" />
        <span v-else>{{ index + 1 }}</span>
      </div>
      <span class="text-xs font-medium">{{ step.label }}</span>
      <span v-if="index < steps.length - 1" class="h-px w-6 bg-border" />
    </li>
  </ol>
</template>
