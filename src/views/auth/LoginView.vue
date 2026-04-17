<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

const email = ref('demo@democompany.example.com')
const password = ref('demopass')

function submit(): void {
  if (!email.value || !password.value) {
    toast.warning('Missing credentials', 'Enter a valid email and password.')
    return
  }
  auth.login(email.value, password.value)
  toast.success('Welcome back', 'You are now signed in.')
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
  router.replace(redirect)
}
</script>

<template>
  <BaseCard>
    <form class="space-y-4" @submit.prevent="submit">
      <h2 class="text-lg font-semibold">Sign in</h2>
      <p class="text-xs text-text-muted">
        Any non-empty email and password will sign you in. Pre-filled demo credentials are provided.
      </p>
      <BaseInput v-model="email" label="Email" type="email" required placeholder="you@example.com" />
      <BaseInput v-model="password" label="Password" type="password" required placeholder="••••••••" />
      <BaseButton type="submit" block>Sign in</BaseButton>
      <div class="text-xs text-text-muted space-y-0.5 pt-2 border-t border-border">
        <p><span class="font-medium">Demo email:</span> demo@democompany.example.com</p>
        <p><span class="font-medium">Demo password:</span> demopass</p>
      </div>
    </form>
  </BaseCard>
</template>
