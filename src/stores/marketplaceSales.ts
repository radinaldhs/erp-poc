import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { MarketplaceSalesRow } from '@/types'

export const useMarketplaceSalesStore = defineStore('marketplaceSales', () => {
  const rows = useStorage<MarketplaceSalesRow[]>(STORAGE_KEYS.marketplaceSales, [])

  const totalRevenue = computed(() => rows.value.reduce((s, r) => s + r.total, 0))
  const totalOrders = computed(() => rows.value.length)
  const channels = computed(() => Array.from(new Set(rows.value.map((r) => r.marketplace))).sort())

  return { rows, totalRevenue, totalOrders, channels }
})
