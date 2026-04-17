<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-3">
      <p class="text-6xl font-bold text-primary">404</p>
      <h1 class="text-2xl font-semibold">Page not found</h1>
      <p class="text-sm text-text-muted">The page you are looking for doesn't exist or has been moved.</p>
      <RouterLink to="/dashboard">
        <BaseButton>Go to Dashboard</BaseButton>
      </RouterLink>
    </div>
  </div>
</template>
