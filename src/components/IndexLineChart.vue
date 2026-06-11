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

const props = withDefaults(
    defineProps<{
        indexValues: IndexValue[] | CumulativeIndexValue[]
        periodStart: Date
        periodEnd: Date
        /** Which value to plot. "yoy" requires `indexValues` to be `CumulativeIndexValue[]`. */
        series?: "mom" | "yoy"
    }>(),
    { series: "mom" }
)

// rgb triplets so both the line and its translucent fill can share a color.
const SERIES_COLOR: Record<typeof props.series, string> = {
    mom: "30, 41, 59", // slate-800
    yoy: "5, 150, 105", // emerald-600
}

const seriesValue = (d: IndexValue | CumulativeIndexValue) => {
    switch (props.series) {
        case "yoy":
            return (d as CumulativeIndexValue).cumulativeLast12Months
        default:
            return d.value
    }
}

const chartData = computed<ChartData<"line", { x: number; y: number }[]>>(
    () => {
        const color = SERIES_COLOR[props.series]
        return {
            datasets: [
                {
                    data: props.indexValues.map((d) => ({
                        x: d.date.valueOf(),
                        y: seriesValue(d),
                    })),
                    borderColor: `rgb(${color})`,
                    backgroundColor: `rgba(${color}, 0.08)`,
                    fill: true,
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: `rgb(${color})`,
                },
            ],
        }
    }
)

// indexValues is sorted newest-first, so the last entry is the oldest date
// and the first entry is the most recent. Use these as the axis bounds
// instead of periodStart/periodEnd so we don't show ticks for months we
// don't have data for (e.g. the current month before BACEN publishes it).
const xMin = computed(() =>
    props.indexValues.length > 0
        ? props.indexValues[props.indexValues.length - 1].date.valueOf()
        : props.periodStart.valueOf()
)

const xMax = computed(() =>
    props.indexValues.length > 0
        ? props.indexValues[0].date.valueOf()
        : props.periodEnd.valueOf()
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
            min: xMin.value,
            max: xMax.value,
            time: {
                unit: "month",
                tooltipFormat: "MMM yy",
                displayFormats: { month: "MMM yy" },
            },
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
