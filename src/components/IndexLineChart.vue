<script setup lang="ts">
import { computed } from "vue"
import { Line } from "vue-chartjs"
import {
    Chart as ChartJS,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Filler,
    Tooltip,
    type ChartData,
    type ChartOptions,
} from "chart.js"
import "chartjs-adapter-date-fns"
import { IndexValue, CumulativeIndexValue } from "@/models/finance"

ChartJS.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Filler,
    Tooltip
)

const props = defineProps<{
    indexValues: IndexValue[] | CumulativeIndexValue[]
    periodStart: Date
    periodEnd: Date
}>()

const chartData = computed<ChartData<"line", { x: number; y: number }[]>>(
    () => ({
        datasets: [
            {
                data: props.indexValues.map((d) => ({
                    x: d.date.valueOf(),
                    y: d.value,
                })),
                borderColor: "#1e293b",
                backgroundColor: "rgba(30, 41, 59, 0.08)",
                fill: true,
                tension: 0.1,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: "#1e293b",
            },
        ],
    })
)

const chartOptions = computed<ChartOptions<"line">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            callbacks: {
                label: (ctx) => `${(100 * (ctx.parsed.y ?? 0)).toFixed(2)}%`,
            },
        },
    },
    scales: {
        x: {
            type: "time",
            min: props.periodStart.valueOf(),
            max: props.periodEnd.valueOf(),
            time: { unit: "month" },
            grid: { display: false },
        },
        y: {
            grid: { color: "#f1f5f9" },
            ticks: {
                callback: (value) => `${(100 * Number(value)).toFixed(1)}%`,
            },
        },
    },
}))
</script>

<template>
    <div class="h-80 w-full max-w-2xl p-4">
        <Line :data="chartData" :options="chartOptions" />
    </div>
</template>
