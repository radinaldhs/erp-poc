<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-bg to-bg px-4 pt-10 pb-28">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <div class="mx-auto mb-3 h-12 w-12 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center text-xl font-bold">R</div>
        <h1 class="text-3xl font-semibold tracking-tight">Radinal ERP</h1>
        <p class="text-sm text-text-muted">
          Designed and built by
          <a href="https://radinal.com" target="_blank" rel="noopener" class="font-medium text-primary hover:underline">Radinal</a>
        </p>
      </div>
      <RouterView />
    </div>
  </div>
</template>
