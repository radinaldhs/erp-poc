<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { v4 as uuid } from 'uuid'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import type { SelectOption } from '@/types'
import { formatCurrency } from '@/composables/useFormat'

export interface JournalLineRow {
  id: string
  accountId: string
  debit: number
  credit: number
}

interface Props {
  modelValue: JournalLineRow[]
  accountOptions: SelectOption[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: JournalLineRow[]] }>()

const lines = computed(() => props.modelValue)

function update(list: JournalLineRow[]): void {
  emit('update:modelValue', list)
}

function addRow(): void {
  update([...lines.value, { id: uuid(), accountId: props.accountOptions[0]?.value ?? '', debit: 0, credit: 0 }])
}

function removeRow(id: string): void {
  update(lines.value.filter((l) => l.id !== id))
}

function mutate(id: string, patch: Partial<JournalLineRow>): void {
  update(lines.value.map((l) => (l.id === id ? { ...l, ...patch } : l)))
}

const totalDebit = computed(() => lines.value.reduce((s, l) => s + l.debit, 0))
const totalCredit = computed(() => lines.value.reduce((s, l) => s + l.credit, 0))
</script>

<template>
  <div class="card overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-surface/60 text-text-muted text-xs uppercase tracking-wide">
        <tr>
          <th class="px-3 py-2 text-left">Account</th>
          <th class="px-3 py-2 text-right w-28">Debit</th>
          <th class="px-3 py-2 text-right w-28">Credit</th>
          <th class="px-3 py-2 w-10" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="line in lines" :key="line.id" class="border-t border-border">
          <td class="px-3 py-2">
            <BaseSelect
              :model-value="line.accountId"
              :options="accountOptions"
              @update:model-value="(v) => mutate(line.id, { accountId: v })"
            />
          </td>
          <td class="px-3 py-2">
            <input
              type="number"
              min="0"
              :value="line.debit"
              class="input-base !py-1 !text-sm text-right"
              @input="mutate(line.id, { debit: Number(($event.target as HTMLInputElement).value) })"
            />
          </td>
          <td class="px-3 py-2">
            <input
              type="number"
              min="0"
              :value="line.credit"
              class="input-base !py-1 !text-sm text-right"
              @input="mutate(line.id, { credit: Number(($event.target as HTMLInputElement).value) })"
            />
          </td>
          <td class="px-3 py-2">
            <button type="button" class="text-text-muted hover:text-danger" @click="removeRow(line.id)">
              <Trash2 class="h-4 w-4" />
            </button>
          </td>
        </tr>
        <tr v-if="lines.length === 0">
          <td colspan="4" class="px-3 py-6 text-center text-text-muted text-xs">No lines yet</td>
        </tr>
      </tbody>
    </table>
    <div class="flex items-center justify-between gap-4 px-3 py-3 border-t border-border">
      <BaseButton type="button" variant="secondary" size="sm" @click="addRow">
        <Plus class="h-4 w-4" /> Add Line
      </BaseButton>
      <div class="text-xs text-text-muted">
        Debit {{ formatCurrency(totalDebit) }} / Credit {{ formatCurrency(totalCredit) }}
      </div>
    </div>
  </div>
</template>
