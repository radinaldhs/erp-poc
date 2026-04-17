<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseDatePicker from '@/components/ui/BaseDatePicker.vue'
import FormSection from '@/components/shared/FormSection.vue'
import { usePromoStore } from '@/stores/promos'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { PromoType } from '@/types'

const promos = usePromoStore()
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  promoName: '',
  promoType: 'Discount' as PromoType,
  targetRegion: 'Region A',
  targetCustomerSegment: 'Retail',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  discountPercent: 10,
  estimatedBudget: 10000,
  expectedRevenueUplift: 50000,
  justification: '',
  termsAndConditions: 'Eligible for targeted customers only. Cannot be combined with other promotions. Subject to stock availability.'
})

const typeOptions = [
  { value: 'Discount', label: 'Discount' },
  { value: 'Bundle', label: 'Bundle' },
  { value: 'Cashback', label: 'Cashback' },
  { value: 'Gift', label: 'Gift' }
]

const regionOptions = ['Region A', 'Region B', 'Region C', 'Region D', 'Region E', 'Nationwide'].map((r) => ({
  value: r,
  label: r
}))

const segmentOptions = ['Retail', 'Wholesale', 'Corporate', 'Online'].map((s) => ({ value: s, label: s }))

function submit(): void {
  if (!form.promoName.trim()) {
    toast.warning('Promo name required', 'Give the promo a descriptive name before submitting.')
    return
  }
  if (!form.justification.trim()) {
    toast.warning('Justification required', 'Add a business justification for this promo.')
    return
  }
  const created = promos.submit({
    ...form,
    submittedBy: auth.user?.name ?? 'Demo User'
  })
  toast.success('Promo submitted', 'The promo has entered the Area Manager approval queue.')
  router.push({ name: 'promo-detail', params: { id: created.id } })
}
</script>

<template>
  <BasePageHeader
    title="Submit Promo"
    subtitle="New promo submissions enter a three-tier approval workflow (Area Manager → Regional Manager → Finance Director)."
  />

  <BaseCard>
    <form class="space-y-6" @submit.prevent="submit">
      <FormSection title="Promo Information" description="Core details that describe this promotion.">
        <BaseInput v-model="form.promoName" label="Promo Name" required placeholder="e.g. Spring Discount Launch" />
        <BaseSelect v-model="form.promoType" label="Promo Type" :options="typeOptions" />
      </FormSection>

      <FormSection title="Targeting" description="Audience and scope for this promo.">
        <BaseSelect v-model="form.targetRegion" label="Target Region" :options="regionOptions" />
        <BaseSelect v-model="form.targetCustomerSegment" label="Customer Segment" :options="segmentOptions" />
      </FormSection>

      <FormSection title="Timing" description="When the promo is active.">
        <BaseDatePicker v-model="form.startDate" label="Start Date" required />
        <BaseDatePicker v-model="form.endDate" label="End Date" required />
      </FormSection>

      <FormSection title="Financials" description="Budget and expected impact.">
        <BaseInput v-model="form.discountPercent" label="Discount (%)" type="number" :min="0" :max="100" />
        <BaseInput v-model="form.estimatedBudget" label="Estimated Budget (USD)" type="number" :min="0" />
        <BaseInput v-model="form.expectedRevenueUplift" label="Expected Revenue Uplift (USD)" type="number" :min="0" />
      </FormSection>

      <div class="space-y-4">
        <BaseTextarea v-model="form.justification" label="Business Justification" :rows="3" required />
        <BaseTextarea v-model="form.termsAndConditions" label="Terms and Conditions" :rows="3" />
      </div>

      <div class="flex items-center justify-end gap-2">
        <BaseButton variant="secondary" type="button" @click="$router.push('/promos')">Cancel</BaseButton>
        <BaseButton type="submit">Submit for Approval</BaseButton>
      </div>
    </form>
  </BaseCard>
</template>
