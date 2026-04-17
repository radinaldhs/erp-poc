<script setup lang="ts" generic="T extends object">
import { computed, ref } from 'vue'
import { ArrowUpDown, Search, SlidersHorizontal, Plus, X } from 'lucide-vue-next'
import BasePagination from './BasePagination.vue'
import BaseEmptyState from './BaseEmptyState.vue'
import type { TableColumn } from '@/types'

interface Props {
  columns: TableColumn<T>[]
  rows: T[]
  loading?: boolean
  searchable?: boolean
  pageSize?: number
  emptyMessage?: string
  rowKey?: keyof T
  clickable?: boolean
  createLabel?: string
  filterable?: boolean
  activeFilterCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchable: true,
  pageSize: 10,
  emptyMessage: 'No results to display.',
  clickable: false,
  filterable: false,
  activeFilterCount: 0
})

const emit = defineEmits<{
  'row-click': [row: T]
  create: []
  'reset-filters': []
}>()

const search = ref('')
const page = ref(1)
const sortKey = ref<string>('')
const sortDir = ref<'asc' | 'desc'>('asc')
const filterOpen = ref(false)

function extract(row: T, key: string): unknown {
  const rec = row as Record<string, unknown>
  if (key in rec) return rec[key]
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part]
    return undefined
  }, row)
}

const filteredRows = computed<T[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.rows
  return props.rows.filter((row) =>
    props.columns.some((col) => String(extract(row, col.key) ?? '').toLowerCase().includes(q))
  )
})

const sortedRows = computed<T[]>(() => {
  if (!sortKey.value) return filteredRows.value
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filteredRows.value].sort((a, b) => {
    const av = extract(a, key)
    const bv = extract(b, key)
    if (typeof av === 'number' && typeof bv === 'number') return dir * (av - bv)
    return dir * String(av ?? '').localeCompare(String(bv ?? ''))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / props.pageSize)))
const paginated = computed<T[]>(() => {
  const start = (page.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})

function toggleSort(col: TableColumn<T>): void {
  if (!col.sortable) return
  if (sortKey.value === col.key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = col.key
    sortDir.value = 'asc'
  }
}

function onSearchInput(e: Event): void {
  search.value = (e.target as HTMLInputElement).value
  page.value = 1
}

function formatCell(col: TableColumn<T>, row: T): string {
  const raw = extract(row, col.key)
  if (col.formatter) return col.formatter(raw, row)
  if (raw == null) return '-'
  return String(raw)
}

function openFilter(): void {
  filterOpen.value = true
}

function closeFilter(): void {
  filterOpen.value = false
}

function resetFilters(): void {
  emit('reset-filters')
}
</script>

<template>
  <div class="card overflow-hidden">
    <div
      v-if="searchable || $slots.actions || createLabel || filterable"
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b border-border"
    >
      <div v-if="searchable" class="relative w-full sm:max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
        <input
          :value="search"
          type="text"
          placeholder="Search..."
          class="input-base !pl-9"
          @input="onSearchInput"
        />
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <slot name="actions" />
        <button
          v-if="filterable"
          type="button"
          class="btn-base bg-surface text-text border border-border hover:bg-border/50 px-3 py-2 text-sm relative"
          @click="openFilter"
        >
          <SlidersHorizontal class="h-4 w-4" />
          <span>Filters</span>
          <span
            v-if="activeFilterCount > 0"
            class="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold"
          >{{ activeFilterCount }}</span>
        </button>
        <button
          v-if="createLabel"
          type="button"
          class="btn-base bg-primary text-primary-foreground hover:brightness-110 px-3 py-2 text-sm"
          @click="emit('create')"
        >
          <Plus class="h-4 w-4" />
          <span>{{ createLabel }}</span>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto scrollbar-thin">
      <table class="min-w-full text-sm">
        <thead class="bg-surface/60">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="col.width ? { width: col.width } : {}"
              :class="[
                'px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-muted text-left select-none',
                col.align === 'right' && 'text-right',
                col.align === 'center' && 'text-center',
                col.sortable && 'cursor-pointer'
              ]"
              @click="toggleSort(col)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <ArrowUpDown v-if="col.sortable" class="h-3 w-3" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-4 py-8 text-center text-text-muted">Loading...</td>
          </tr>
          <tr v-else-if="paginated.length === 0">
            <td :colspan="columns.length" class="px-4 py-8">
              <BaseEmptyState :message="emptyMessage" />
            </td>
          </tr>
          <tr
            v-for="(row, idx) in paginated"
            :key="String(rowKey ? (row as Record<string, unknown>)[rowKey as string] : idx)"
            :class="[
              'border-t border-border',
              clickable && 'cursor-pointer hover:bg-surface'
            ]"
            @click="clickable && emit('row-click', row)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-2.5',
                col.align === 'right' && 'text-right',
                col.align === 'center' && 'text-center'
              ]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="extract(row, col.key)">
                {{ formatCell(col, row) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="sortedRows.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-text-muted">
      <span>Showing {{ paginated.length }} of {{ sortedRows.length }} records</span>
      <BasePagination v-model:page="page" :total-pages="totalPages" />
    </div>

    <Teleport to="body">
      <div v-if="filterable && filterOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/40" @click="closeFilter" />
        <aside
          class="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-bg border-l border-border shadow-xl flex flex-col"
        >
          <div class="flex items-center justify-between px-4 h-14 border-b border-border">
            <div class="flex items-center gap-2">
              <SlidersHorizontal class="h-4 w-4 text-text-muted" />
              <h3 class="text-sm font-semibold">Filters</h3>
              <span
                v-if="activeFilterCount > 0"
                class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold"
              >{{ activeFilterCount }}</span>
            </div>
            <button class="text-text-muted hover:text-text" @click="closeFilter">
              <X class="h-4 w-4" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            <slot name="filters" />
          </div>
          <div class="px-4 py-3 border-t border-border flex items-center justify-between gap-2">
            <button
              type="button"
              class="btn-base text-text hover:bg-surface px-3 py-2 text-sm"
              @click="resetFilters"
            >
              Reset
            </button>
            <button
              type="button"
              class="btn-base bg-primary text-primary-foreground hover:brightness-110 px-4 py-2 text-sm"
              @click="closeFilter"
            >
              Apply
            </button>
          </div>
        </aside>
      </div>
    </Teleport>
  </div>
</template>
