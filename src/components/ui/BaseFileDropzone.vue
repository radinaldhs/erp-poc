<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud } from 'lucide-vue-next'

interface Props {
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  hint?: string
}
withDefaults(defineProps<Props>(), {
  accept: '.xlsx,.xls,.csv',
  multiple: false,
  maxSizeMb: 10,
  hint: 'Drag and drop, or click to browse'
})

const emit = defineEmits<{ 'files-selected': [files: File[]] }>()

const input = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

function onDrop(e: DragEvent): void {
  e.preventDefault()
  isDragging.value = false
  const list = e.dataTransfer?.files
  if (list) emitFiles(Array.from(list))
}

function onDragOver(e: DragEvent): void {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(): void {
  isDragging.value = false
}

function openBrowser(): void {
  input.value?.click()
}

function onChange(e: Event): void {
  const target = e.target as HTMLInputElement
  if (target.files) emitFiles(Array.from(target.files))
  target.value = ''
}

function emitFiles(files: File[]): void {
  if (files.length > 0) emit('files-selected', files)
}
</script>

<template>
  <div
    :class="[
      'rounded-lg border-2 border-dashed transition-colors text-center px-6 py-10 cursor-pointer',
      isDragging ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:bg-surface/70'
    ]"
    @click="openBrowser"
    @drop="onDrop"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
  >
    <UploadCloud class="h-10 w-10 text-primary mx-auto mb-3" />
    <p class="text-sm font-medium">{{ hint }}</p>
    <p class="text-xs text-text-muted mt-1">Accepted: {{ accept }} — up to {{ maxSizeMb }}MB</p>
    <input ref="input" type="file" :accept="accept" :multiple="multiple" class="hidden" @change="onChange" />
  </div>
</template>
