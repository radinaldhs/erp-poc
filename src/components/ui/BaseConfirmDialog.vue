<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

const { pending, handleResult } = useConfirm()
</script>

<template>
  <BaseModal
    :open="pending !== null"
    :title="pending?.title ?? ''"
    size="sm"
    @close="handleResult(false)"
  >
    <p class="text-sm text-text-muted">{{ pending?.message }}</p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" @click="handleResult(false)">
          {{ pending?.cancelText ?? 'Cancel' }}
        </BaseButton>
        <BaseButton
          :variant="pending?.tone === 'danger' ? 'danger' : 'primary'"
          @click="handleResult(true)"
        >
          {{ pending?.confirmText ?? 'Confirm' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
