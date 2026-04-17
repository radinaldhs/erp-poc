<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { ensureChartRegistered, CHART_PALETTE } from './chartSetup'

ensureChartRegistered()

interface Props {
  labels: string[]
  data: number[]
  label?: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), { label: 'Value', height: 200 })

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label,
      data: props.data,
      borderColor: CHART_PALETTE[0],
      backgroundColor: CHART_PALETTE[0] + '33',
      tension: 0.3,
      fill: true,
      pointRadius: 2
    }
  ]
}))

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: 'rgba(100,116,139,0.1)' } }
  }
}
</script>

<template>
  <div :style="{ height: height + 'px' }">
    <Line :data="chartData" :options="options" />
  </div>
</template>
