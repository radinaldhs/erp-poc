<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), { size: 'md' })
const emit = defineEmits<{ close: [] }>()

function handleKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKey))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey))

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  }
)

const sizeClass: Record<NonNullable<Props['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl'
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('close')" />
      <div :class="['relative w-full card shadow-xl', sizeClass[size]]">
        <div v-if="title || $slots.header" class="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 class="text-sm font-semibold">{{ title }}</h3>
          <button class="text-text-muted hover:text-text" @click="emit('close')">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="p-5 max-h-[75vh] overflow-auto scrollbar-thin">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-5 py-3 border-t border-border bg-surface">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
