<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { ensureChartRegistered, CHART_PALETTE } from './chartSetup'

ensureChartRegistered()

interface Props {
  labels: string[]
  data: number[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), { height: 240 })

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.labels.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]),
      borderWidth: 0
    }
  ]
}))

const options: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: { legend: { position: 'bottom' } }
}
</script>

<template>
  <div :style="{ height: height + 'px' }">
    <Doughnut :data="chartData" :options="options" />
  </div>
</template>
