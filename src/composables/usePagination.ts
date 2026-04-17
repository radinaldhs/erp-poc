import { computed, ref } from 'vue'

export function usePagination<T>(items: () => T[], pageSize = 10) {
  const page = ref(1)
  const size = ref(pageSize)

  const total = computed(() => items().length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))

  const paged = computed<T[]>(() => {
    const start = (page.value - 1) * size.value
    return items().slice(start, start + size.value)
  })

  const reset = (): void => {
    page.value = 1
  }

  const goTo = (target: number): void => {
    page.value = Math.min(Math.max(1, target), totalPages.value)
  }

  const next = (): void => goTo(page.value + 1)
  const prev = (): void => goTo(page.value - 1)

  return { page, size, total, totalPages, paged, reset, goTo, next, prev }
}
