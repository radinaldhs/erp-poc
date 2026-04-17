<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import BaseToast from '@/components/ui/BaseToast.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'

const { initTheme } = useTheme()
onMounted(() => {
  initTheme()
})
</script>

<template>
  <RouterView />
  <BaseToast />
  <BaseConfirmDialog />
</template>
