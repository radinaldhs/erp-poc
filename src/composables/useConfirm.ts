import { ref } from 'vue'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  tone?: 'default' | 'danger'
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (result: boolean) => void
}

const pending = ref<PendingConfirm | null>(null)

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> =>
    new Promise((resolve) => {
      pending.value = { ...options, resolve }
    })

  const handleResult = (result: boolean): void => {
    pending.value?.resolve(result)
    pending.value = null
  }

  return { confirm, pending, handleResult }
}
