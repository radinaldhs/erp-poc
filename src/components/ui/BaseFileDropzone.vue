<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

interface Props {
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  hint?: string
}
const props = withDefaults(defineProps<Props>(), {
  accept: '.xlsx,.xls,.csv',
  multiple: false,
  maxSizeMb: 10,
  hint: 'Drag and drop, or click to browse'
})

const emit = defineEmits<{ 'files-selected': [files: File[]] }>()

const input = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const toast = useToast()

const ALLOWED_MIME = new Set<string>([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
  ''
])

function allowedExtensions(): string[] {
  return props.accept.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
}

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return allowedExtensions().some((ext) => lower.endsWith(ext))
}

function validateFiles(files: File[]): File[] {
  const maxBytes = props.maxSizeMb * 1024 * 1024
  const accepted: File[] = []
  for (const file of files) {
    if (file.size > maxBytes) {
      toast.error('File too large', `${file.name} exceeds ${props.maxSizeMb}MB limit.`)
      continue
    }
    if (!hasAllowedExtension(file.name)) {
      toast.error('Unsupported file', `${file.name} is not an accepted type (${props.accept}).`)
      continue
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      toast.error('Unsupported MIME type', `${file.name} (${file.type}) is not permitted.`)
      continue
    }
    accepted.push(file)
  }
  return accepted
}

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

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    openBrowser()
  }
}

function onChange(e: Event): void {
  const target = e.target as HTMLInputElement
  if (target.files) emitFiles(Array.from(target.files))
  target.value = ''
}

function emitFiles(files: File[]): void {
  const safe = validateFiles(files)
  if (safe.length > 0) emit('files-selected', safe)
}
</script>

<template>
  <div
    role="button"
    tabindex="0"
    :aria-label="hint"
    :class="[
      'rounded-lg border-2 border-dashed transition-colors text-center px-6 py-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary',
      isDragging ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:bg-surface/70'
    ]"
    @click="openBrowser"
    @keydown="onKey"
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
