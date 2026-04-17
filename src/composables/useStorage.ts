import { ref, watch, type Ref } from 'vue'

export function useStorage<T>(key: string, defaultValue: T): Ref<T> {
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      localStorage.removeItem(key)
      return defaultValue
    }
  }

  const value = ref(read()) as Ref<T>

  watch(
    value,
    (next) => {
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* quota-exceeded - swallow */
      }
    },
    { deep: true }
  )

  return value
}

export function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}
