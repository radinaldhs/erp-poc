<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { ensureChartRegistered, CHART_PALETTE } from './chartSetup'

ensureChartRegistered()

interface Props {
  labels: string[]
  datasets: { label: string; data: number[] }[]
  horizontal?: boolean
  height?: number
}

const props = withDefaults(defineProps<Props>(), { horizontal: false, height: 240 })

const data = computed<ChartData<'bar'>>(() => ({
  labels: props.labels,
  datasets: props.datasets.map((d, i) => ({
    label: d.label,
    data: d.data,
    backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length],
    borderRadius: 4
  }))
}))

const options = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: props.horizontal ? 'y' : 'x',
  plugins: { legend: { display: true, position: 'bottom' } },
  scales: {
    x: { grid: { display: !props.horizontal } },
    y: { beginAtZero: true, grid: { color: 'rgba(100,116,139,0.1)' } }
  }
}))
</script>

<template>
  <div :style="{ height: height + 'px' }">
    <Bar :data="data" :options="options" />
  </div>
</template>
