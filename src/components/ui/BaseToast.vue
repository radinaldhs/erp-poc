<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info
}
const toneMap = {
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  error: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-primary/30 bg-primary/10 text-primary'
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-80">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['card border p-3 flex items-start gap-3 shadow-lg', toneMap[toast.type]]"
      >
        <component :is="iconMap[toast.type]" class="h-5 w-5 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-semibold text-text">{{ toast.title }}</p>
          <p v-if="toast.message" class="text-xs text-text-muted mt-0.5">{{ toast.message }}</p>
        </div>
        <button class="text-text-muted hover:text-text" @click="dismiss(toast.id)">
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
