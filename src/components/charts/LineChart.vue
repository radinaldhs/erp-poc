<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { ensureChartRegistered, CHART_PALETTE } from './chartSetup'

ensureChartRegistered()

interface Props {
  labels: string[]
  datasets: { label: string; data: number[] }[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), { height: 240 })

const data = computed<ChartData<'line'>>(() => ({
  labels: props.labels,
  datasets: props.datasets.map((d, i) => ({
    label: d.label,
    data: d.data,
    borderColor: CHART_PALETTE[i % CHART_PALETTE.length],
    backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] + '33',
    tension: 0.3,
    fill: true,
    pointRadius: 2
  }))
}))

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, position: 'bottom' } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: 'rgba(100,116,139,0.1)' } }
  }
}
</script>

<template>
  <div :style="{ height: height + 'px' }">
    <Line :data="data" :options="options" />
  </div>
</template>
