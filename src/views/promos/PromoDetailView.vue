<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, X, FileDown, Printer, ArrowLeft, MessageCircle } from 'lucide-vue-next'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import StatusPill from '@/components/shared/StatusPill.vue'
import ApprovalTimeline from '@/components/shared/ApprovalTimeline.vue'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay.vue'
import { usePromoStore } from '@/stores/promos'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { generateApprovalLetter } from '@/composables/usePdf'
import { formatDate } from '@/composables/useFormat'
import { statusRole } from '@/data/seedPromos'

const route = useRoute()
const router = useRouter()
const promos = usePromoStore()
const auth = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const promo = computed(() => promos.byId(String(route.params.id)))
const commentText = ref('')

const canAct = computed(() => {
  if (!promo.value) return false
  const required = statusRole(promo.value.status)
  if (!required) return false
  return auth.currentRole === required || auth.currentRole === 'Admin'
})

const actingRole = computed(() => {
  if (auth.currentRole === 'Admin' && promo.value) {
    return statusRole(promo.value.status) ?? 'Admin'
  }
  return auth.currentRole
})

async function onApprove(): Promise<void> {
  if (!promo.value) return
  const ok = await confirm.confirm({
    title: 'Approve this promo?',
    message: 'This will move the promo to the next approval tier.',
    tone: 'default'
  })
  if (!ok) return
  const done = promos.approve(promo.value.id, (auth.user?.name ?? 'User'), actingRole.value, commentText.value || undefined)
  if (!done) {
    toast.error('Not permitted', 'Your current role cannot act on this stage.')
    return
  }
  commentText.value = ''
  toast.success('Promo approved')
}

async function onReject(): Promise<void> {
  if (!promo.value) return
  const ok = await confirm.confirm({
    title: 'Reject this promo?',
    message: 'The promo will be marked as rejected. Provide a reason in the comment below.',
    tone: 'danger'
  })
  if (!ok) return
  const done = promos.reject(promo.value.id, (auth.user?.name ?? 'User'), actingRole.value, commentText.value || undefined)
  if (!done) {
    toast.error('Not permitted', 'Your current role cannot act on this stage.')
    return
  }
  commentText.value = ''
  toast.success('Promo rejected')
}

function onComment(): void {
  if (!promo.value || !commentText.value.trim()) return
  promos.comment(promo.value.id, (auth.user?.name ?? 'User'), auth.currentRole, commentText.value.trim())
  commentText.value = ''
  toast.success('Comment added')
}

function downloadPdf(): void {
  if (!promo.value) return
  if (promo.value.status !== 'Approved') {
    toast.info('Not yet approved', 'The approval letter is available once the promo reaches Approved status.')
    return
  }
  generateApprovalLetter(promo.value)
}

function printPage(): void {
  window.print()
}
</script>

<template>
  <div v-if="!promo">
    <BasePageHeader title="Promo Not Found" subtitle="The requested promo could not be located.">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'promos' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back to List
        </BaseButton>
      </template>
    </BasePageHeader>
  </div>
  <div v-else>
    <BasePageHeader :title="promo.promoName" subtitle="Full proposal details, audit log, and approval chain.">
      <template #actions>
        <BaseButton variant="secondary" @click="router.push({ name: 'promos' })">
          <ArrowLeft class="h-4 w-4 mr-1" /> Back
        </BaseButton>
        <BaseButton variant="outline" @click="printPage">
          <Printer class="h-4 w-4 mr-1" /> Print
        </BaseButton>
        <BaseButton variant="primary" :disabled="promo.status !== 'Approved'" @click="downloadPdf">
          <FileDown class="h-4 w-4 mr-1" /> Approval Letter
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <BaseCard title="Proposal Details" class="lg:col-span-2">
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">Status</p>
            <StatusPill :status="promo.status" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Promo Type</p>
            <BaseBadge>{{ promo.promoType }}</BaseBadge>
          </div>
          <div>
            <p class="text-xs text-text-muted">Target Region</p>
            <p class="text-sm font-medium">{{ promo.targetRegion }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Customer Segment</p>
            <p class="text-sm font-medium">{{ promo.targetCustomerSegment }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Start Date</p>
            <p class="text-sm font-medium">{{ formatDate(promo.startDate) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">End Date</p>
            <p class="text-sm font-medium">{{ formatDate(promo.endDate) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Discount</p>
            <p class="text-sm font-medium">{{ promo.discountPercent }}%</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Submitted By</p>
            <p class="text-sm font-medium">{{ promo.submittedBy }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">Estimated Budget</p>
            <CurrencyDisplay :value="promo.estimatedBudget" class="text-sm font-semibold" />
          </div>
          <div>
            <p class="text-xs text-text-muted">Expected Revenue Uplift</p>
            <CurrencyDisplay :value="promo.expectedRevenueUplift" class="text-sm font-semibold text-success" />
          </div>
        </div>

        <div class="mt-6">
          <p class="text-xs text-text-muted uppercase tracking-wide">Justification</p>
          <p class="text-sm leading-relaxed mt-1">{{ promo.justification }}</p>
        </div>

        <div class="mt-4">
          <p class="text-xs text-text-muted uppercase tracking-wide">Terms and Conditions</p>
          <p class="text-sm leading-relaxed mt-1">{{ promo.termsAndConditions }}</p>
        </div>
      </BaseCard>

      <BaseCard title="Approval Timeline">
        <ApprovalTimeline :entries="promo.auditLog" />
      </BaseCard>
    </div>

    <BaseCard title="Actions" class="no-print">
      <div v-if="!canAct" class="text-sm text-text-muted">
        This promo requires a {{ statusRole(promo.status) ?? 'different' }} role to act. Your current role is
        <BaseBadge tone="primary">{{ auth.currentRole }}</BaseBadge>.
        You can still add a comment below.
      </div>

      <BaseTextarea
        v-model="commentText"
        label="Comment"
        placeholder="Add an optional note that accompanies your decision or feedback"
        :rows="3"
      />

      <div class="flex flex-wrap gap-2 mt-3">
        <BaseButton variant="success" :disabled="!canAct" @click="onApprove">
          <Check class="h-4 w-4 mr-1" /> Approve
        </BaseButton>
        <BaseButton variant="danger" :disabled="!canAct" @click="onReject">
          <X class="h-4 w-4 mr-1" /> Reject
        </BaseButton>
        <BaseButton variant="secondary" :disabled="!commentText.trim()" @click="onComment">
          <MessageCircle class="h-4 w-4 mr-1" /> Comment Only
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
