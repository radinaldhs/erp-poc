<script setup lang="ts">
import { ref, watch } from 'vue'

type Preset = 'this_month' | 'last_month' | 'last_90' | 'ytd' | 'custom'

interface Range {
  start: string
  end: string
  preset: Preset
}

interface Props {
  modelValue: Range
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: Range] }>()

const start = ref(props.modelValue.start)
const end = ref(props.modelValue.end)
const preset = ref<Preset>(props.modelValue.preset)

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function applyPreset(p: Preset): void {
  preset.value = p
  const now = new Date()
  if (p === 'this_month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1)
    start.value = isoDay(s)
    end.value = isoDay(now)
  } else if (p === 'last_month') {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const e = new Date(now.getFullYear(), now.getMonth(), 0)
    start.value = isoDay(s)
    end.value = isoDay(e)
  } else if (p === 'last_90') {
    const s = new Date(now)
    s.setDate(now.getDate() - 90)
    start.value = isoDay(s)
    end.value = isoDay(now)
  } else if (p === 'ytd') {
    const s = new Date(now.getFullYear(), 0, 1)
    start.value = isoDay(s)
    end.value = isoDay(now)
  }
  emit('update:modelValue', { start: start.value, end: end.value, preset: p })
}

watch([start, end], () => {
  emit('update:modelValue', { start: start.value, end: end.value, preset: 'custom' })
  preset.value = 'custom'
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="flex items-center gap-1">
      <button
        v-for="item in [
          { key: 'this_month', label: 'This Month' },
          { key: 'last_month', label: 'Last Month' },
          { key: 'last_90', label: 'Last 90 Days' },
          { key: 'ytd', label: 'YTD' }
        ]"
        :key="item.key"
        :class="[
          'px-2.5 py-1 text-xs rounded-md border',
          preset === item.key ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-surface'
        ]"
        @click="applyPreset(item.key as Preset)"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="flex items-center gap-2">
      <input v-model="start" type="date" class="input-base !py-1 !text-xs w-36" />
      <span class="text-text-muted text-xs">to</span>
      <input v-model="end" type="date" class="input-base !py-1 !text-xs w-36" />
    </div>
  </div>
</template>
