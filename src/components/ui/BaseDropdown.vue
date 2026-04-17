<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Props {
  align?: 'left' | 'right'
  width?: string
}

withDefaults(defineProps<Props>(), { align: 'right', width: 'w-56' })

const open = ref(false)
const root = ref<HTMLDivElement | null>(null)

function toggle(): void {
  open.value = !open.value
}

function close(): void {
  open.value = false
}

function handleOutside(e: MouseEvent): void {
  if (!root.value) return
  if (!root.value.contains(e.target as Node)) close()
}

onMounted(() => document.addEventListener('click', handleOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleOutside))
</script>

<template>
  <div ref="root" class="relative inline-block">
    <div @click="toggle">
      <slot name="trigger" />
    </div>
    <div
      v-if="open"
      :class="[
        'absolute z-30 mt-2 card shadow-lg',
        align === 'right' ? 'right-0' : 'left-0',
        width
      ]"
      @click="close"
    >
      <slot :close="close" />
    </div>
  </div>
</template>
