import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'erp:theme'

const theme = ref<Theme>('light')

function apply(next: Theme): void {
  const root = document.documentElement
  if (next === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function useTheme() {
  const initTheme = (): void => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'light'
    theme.value = stored
    apply(stored)
  }

  const toggleTheme = (): void => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(theme, (next) => {
    localStorage.setItem(STORAGE_KEY, next)
    apply(next)
  })

  return { theme, initTheme, toggleTheme }
}
