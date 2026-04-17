import { ref } from 'vue'
import { v4 as uuid } from 'uuid'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface ToastEntry {
  id: string
  type: ToastType
  title: string
  message?: string
}

const toasts = ref<ToastEntry[]>([])

function push(type: ToastType, title: string, message?: string): void {
  const entry: ToastEntry = { id: uuid(), type, title, message }
  toasts.value.push(entry)
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== entry.id)
  }, 3500)
}

function dismiss(id: string): void {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

export function useToast() {
  return {
    toasts,
    dismiss,
    info: (title: string, message?: string) => push('info', title, message),
    success: (title: string, message?: string) => push('success', title, message),
    warning: (title: string, message?: string) => push('warning', title, message),
    error: (title: string, message?: string) => push('error', title, message)
  }
}
