<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  open: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  saveLabel?: string
  saving?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  saveLabel: 'Save',
  saving: false
})

const emit = defineEmits<{ close: []; submit: [] }>()

function onSubmit(e: Event): void {
  e.preventDefault()
  emit('submit')
}
</script>

<template>
  <BaseModal :open="open" :title="title" :size="size" @close="emit('close')">
    <form class="space-y-4" @submit="onSubmit">
      <slot />
      <div class="flex items-center justify-end gap-2 pt-2">
        <BaseButton type="button" variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" variant="primary" :loading="saving">{{ saveLabel }}</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
