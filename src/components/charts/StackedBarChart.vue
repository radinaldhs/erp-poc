<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { ensureChartRegistered, CHART_PALETTE } from './chartSetup'

ensureChartRegistered()

interface Props {
  labels: string[]
  datasets: { label: string; data: number[] }[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), { height: 260 })

const data = computed<ChartData<'bar'>>(() => ({
  labels: props.labels,
  datasets: props.datasets.map((d, i) => ({
    label: d.label,
    data: d.data,
    backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length],
    borderRadius: 3,
    stack: 'stack1'
  }))
}))

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
  scales: {
    x: { stacked: true, grid: { display: false } },
    y: { stacked: true, beginAtZero: true, grid: { color: 'rgba(100,116,139,0.1)' } }
  }
}
</script>

<template>
  <div :style="{ height: height + 'px' }">
    <Bar :data="data" :options="options" />
  </div>
</template>
