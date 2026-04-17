<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { v4 as uuid } from 'uuid'
import type { LineItem } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import { formatCurrency } from '@/composables/useFormat'

interface Props {
  modelValue: LineItem[]
  readonly?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: LineItem[]] }>()

const items = computed<LineItem[]>(() => props.modelValue)

function update(list: LineItem[]): void {
  emit('update:modelValue', list)
}

function addRow(): void {
  update([
    ...items.value,
    { id: uuid(), productId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0.08 }
  ])
}

function removeRow(id: string): void {
  update(items.value.filter((i) => i.id !== id))
}

function mutate(id: string, patch: Partial<LineItem>): void {
  update(items.value.map((i) => (i.id === id ? { ...i, ...patch } : i)))
}

const subtotal = computed(() => items.value.reduce((s, i) => s + i.quantity * i.unitPrice, 0))
const tax = computed(() => items.value.reduce((s, i) => s + i.quantity * i.unitPrice * i.taxRate, 0))
const total = computed(() => subtotal.value + tax.value)
</script>

<template>
  <div class="card overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-surface/60 text-text-muted text-xs uppercase tracking-wide">
        <tr>
          <th class="px-3 py-2 text-left">Description</th>
          <th class="px-3 py-2 text-right w-24">Qty</th>
          <th class="px-3 py-2 text-right w-32">Unit Price</th>
          <th class="px-3 py-2 text-right w-24">Tax</th>
          <th class="px-3 py-2 text-right w-32">Line Total</th>
          <th v-if="!readonly" class="px-3 py-2 w-10" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id" class="border-t border-border">
          <td class="px-3 py-2">
            <input
              :value="item.description"
              :readonly="readonly"
              class="input-base !py-1 !text-sm"
              @input="mutate(item.id, { description: ($event.target as HTMLInputElement).value })"
            />
          </td>
          <td class="px-3 py-2">
            <input
              type="number"
              :value="item.quantity"
              :readonly="readonly"
              class="input-base !py-1 !text-sm text-right"
              @input="mutate(item.id, { quantity: Number(($event.target as HTMLInputElement).value) })"
            />
          </td>
          <td class="px-3 py-2">
            <input
              type="number"
              :value="item.unitPrice"
              :readonly="readonly"
              class="input-base !py-1 !text-sm text-right"
              @input="mutate(item.id, { unitPrice: Number(($event.target as HTMLInputElement).value) })"
            />
          </td>
          <td class="px-3 py-2 text-right">
            {{ (item.taxRate * 100).toFixed(0) }}%
          </td>
          <td class="px-3 py-2 text-right">
            {{ formatCurrency(item.quantity * item.unitPrice * (1 + item.taxRate)) }}
          </td>
          <td v-if="!readonly" class="px-3 py-2">
            <button class="text-text-muted hover:text-danger" @click="removeRow(item.id)">
              <Trash2 class="h-4 w-4" />
            </button>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td colspan="6" class="px-3 py-6 text-center text-text-muted text-xs">No line items yet</td>
        </tr>
      </tbody>
    </table>
    <div class="flex items-start justify-between gap-4 px-3 py-3 border-t border-border">
      <BaseButton v-if="!readonly" variant="secondary" size="sm" @click="addRow">
        <Plus class="h-4 w-4" /> Add line
      </BaseButton>
      <div class="text-sm space-y-1 min-w-[200px]">
        <div class="flex justify-between"><span class="text-text-muted">Subtotal</span><span>{{ formatCurrency(subtotal) }}</span></div>
        <div class="flex justify-between"><span class="text-text-muted">Tax</span><span>{{ formatCurrency(tax) }}</span></div>
        <div class="flex justify-between font-semibold border-t border-border pt-1"><span>Total</span><span>{{ formatCurrency(total) }}</span></div>
      </div>
    </div>
  </div>
</template>
