import { computed, ref, type Ref } from 'vue'

type SortDirection = 'asc' | 'desc'

function extract(row: Record<string, unknown>, key: string): unknown {
  if (key in row) return row[key]
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part]
    return undefined
  }, row)
}

function matches(value: unknown, query: string): boolean {
  if (value == null) return false
  return String(value).toLowerCase().includes(query)
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''))
}

export function useTableFilters<T extends Record<string, unknown>>(
  rows: Ref<T[]> | (() => T[]),
  searchableKeys: string[] = []
) {
  const search = ref('')
  const sortKey = ref<string>('')
  const sortDir = ref<SortDirection>('asc')

  const source = (): T[] => (typeof rows === 'function' ? rows() : rows.value)

  const filtered = computed<T[]>(() => {
    const query = search.value.trim().toLowerCase()
    const base = source()
    if (!query) return base
    const keys = searchableKeys.length ? searchableKeys : Object.keys(base[0] ?? {})
    return base.filter((row) => keys.some((k) => matches(extract(row, k), query)))
  })

  const sorted = computed<T[]>(() => {
    if (!sortKey.value) return filtered.value
    const key = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    return [...filtered.value].sort((a, b) => dir * compare(extract(a, key), extract(b, key)))
  })

  const toggleSort = (key: string): void => {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = 'asc'
    }
  }

  return { search, sortKey, sortDir, filtered, sorted, toggleSort }
}
