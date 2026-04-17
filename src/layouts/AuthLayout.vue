<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-bg to-bg px-4 py-10">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-semibold tracking-tight">ERP POC</h1>
        <p class="text-sm text-text-muted">Demo Company Business Platform</p>
      </div>
      <RouterView />
    </div>
  </div>
</template>
