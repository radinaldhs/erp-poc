<script setup lang="ts">
interface Props {
  headers: string[]
  rows: Record<string, unknown>[]
  warnings?: Record<number, string[]>
  maxRows?: number
}

const props = withDefaults(defineProps<Props>(), { maxRows: 50 })

function hasWarning(index: number): boolean {
  return Boolean(props.warnings && props.warnings[index]?.length)
}

function warningText(index: number): string {
  return props.warnings?.[index]?.join(', ') ?? ''
}
</script>

<template>
  <div class="card overflow-hidden">
    <div class="overflow-x-auto scrollbar-thin max-h-[420px]">
      <table class="min-w-full text-xs">
        <thead class="bg-surface/60 sticky top-0">
          <tr>
            <th class="px-3 py-2 text-left text-text-muted w-10">#</th>
            <th v-for="h in headers" :key="h" class="px-3 py-2 text-left text-text-muted whitespace-nowrap">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in rows.slice(0, maxRows)"
            :key="index"
            :class="['border-t border-border', hasWarning(index) && 'bg-warning/10']"
          >
            <td class="px-3 py-2 text-text-muted">{{ index + 1 }}</td>
            <td v-for="h in headers" :key="h" class="px-3 py-2 whitespace-nowrap">
              <span>{{ row[h] ?? '' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="rows.length > maxRows" class="px-3 py-2 text-xs text-text-muted border-t border-border">
      Showing first {{ maxRows }} of {{ rows.length }} rows.
    </div>
    <div v-if="warnings && Object.keys(warnings).length > 0" class="px-3 py-2 text-xs border-t border-border bg-warning/10">
      <p class="font-medium text-warning mb-1">Validation warnings</p>
      <ul class="list-disc ps-4 text-text-muted space-y-0.5">
        <li v-for="(msgs, idx) in warnings" :key="idx">Row {{ Number(idx) + 1 }}: {{ msgs.join(', ') }}</li>
      </ul>
    </div>
  </div>
</template>
