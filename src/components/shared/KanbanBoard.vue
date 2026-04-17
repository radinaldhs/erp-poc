<script setup lang="ts" generic="T extends { id: string }">
interface Column<T> {
  key: string
  label: string
  items: T[]
}
interface Props {
  columns: Column<T>[]
}
defineProps<Props>()
</script>

<template>
  <div class="grid gap-3" :class="`grid-cols-1 md:grid-cols-${columns.length}`">
    <div v-for="col in columns" :key="col.key" class="card p-3 flex flex-col gap-2 min-h-[200px]">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wide text-text-muted">{{ col.label }}</span>
        <span class="text-[11px] rounded-full bg-border/60 px-2 py-0.5">{{ col.items.length }}</span>
      </div>
      <div class="flex flex-col gap-2 flex-1">
        <div v-for="item in col.items" :key="item.id" class="rounded-md border border-border bg-bg p-2">
          <slot name="card" :item="item" />
        </div>
        <div v-if="col.items.length === 0" class="text-[11px] text-text-muted text-center py-2">Empty</div>
      </div>
    </div>
  </div>
</template>
