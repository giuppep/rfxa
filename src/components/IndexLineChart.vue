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
    Legend,
    type ChartData,
    type ChartDataset,
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
    Tooltip,
    Legend
)

const props = defineProps<{
    indexValues: IndexValue[] | CumulativeIndexValue[]
    periodStart: Date
    periodEnd: Date
    /** Also plot the cumulative value since the start of the year. Requires `indexValues` to be `CumulativeIndexValue[]`. */
    showYtd?: boolean
    /** Also plot the cumulative value over the trailing 12 months. Requires `indexValues` to be `CumulativeIndexValue[]`. */
    showYoy?: boolean
}>()

const chartData = computed<ChartData<"line", { x: number; y: number }[]>>(
    () => {
        const datasets: ChartDataset<"line", { x: number; y: number }[]>[] = [
            {
                label: "Value",
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
        ]

        if (props.showYtd) {
            datasets.push({
                label: "YTD",
                data: (props.indexValues as CumulativeIndexValue[]).map(
                    (d) => ({
                        x: d.date.valueOf(),
                        y: d.cumulativeSinceYearStart,
                    })
                ),
                borderColor: "#2563eb",
                fill: false,
                tension: 0.1,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: "#2563eb",
                yAxisID: "y1",
            })
        }

        if (props.showYoy) {
            datasets.push({
                label: "YoY",
                data: (props.indexValues as CumulativeIndexValue[]).map(
                    (d) => ({
                        x: d.date.valueOf(),
                        y: d.cumulativeLast12Monhts,
                    })
                ),
                borderColor: "#059669",
                fill: false,
                tension: 0.1,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: "#059669",
                yAxisID: "y1",
            })
        }

        return { datasets }
    }
)

const chartOptions = computed<ChartOptions<"line">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: !!(props.showYtd || props.showYoy),
        },
        tooltip: {
            callbacks: {
                label: (ctx) =>
                    `${ctx.dataset.label}: ${(100 * (ctx.parsed.y ?? 0)).toFixed(2)}%`,
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
            position: "left",
            grid: { color: "#f1f5f9" },
            ticks: {
                callback: (value) => `${(100 * Number(value)).toFixed(1)}%`,
            },
        },
        y1: {
            type: "linear",
            position: "right",
            display: !!(props.showYtd || props.showYoy),
            grid: { drawOnChartArea: false },
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
