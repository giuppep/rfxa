<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { Line } from "vue-chartjs"
import {
    Chart as ChartJS,
    Filler,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    TimeScale,
    Tooltip,
    type ChartData,
    type ChartOptions,
} from "chart.js"
import "chartjs-adapter-date-fns"
import { ExchangeRateValue } from "@/models/finance"

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
    exchangeRates: ExchangeRateValue[]
    periodStart: Date
    periodEnd: Date
}>()

const { t, locale } = useI18n()

const currencyFormatter = computed(
    () =>
        new Intl.NumberFormat(locale.value, {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
        })
)

const chartRates = computed(() => [...props.exchangeRates].reverse())

const chartData = computed<ChartData<"line", { x: number; y: number }[]>>(
    () => ({
        datasets: [
            {
                label: t("exchange.sell"),
                data: chartRates.value.map((rate) => ({
                    x: rate.date.valueOf(),
                    y: rate.sell,
                })),
                borderColor: "rgb(37, 99, 235)",
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                fill: true,
                tension: 0.1,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: "rgb(37, 99, 235)",
            },
            {
                label: t("exchange.buy"),
                data: chartRates.value.map((rate) => ({
                    x: rate.date.valueOf(),
                    y: rate.buy,
                })),
                borderColor: "rgb(5, 150, 105)",
                backgroundColor: "rgba(5, 150, 105, 0.04)",
                fill: false,
                tension: 0.1,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: "rgb(5, 150, 105)",
            },
        ],
    })
)

const xMin = computed(() =>
    props.exchangeRates.length > 0
        ? props.exchangeRates[props.exchangeRates.length - 1].date.valueOf()
        : props.periodStart.valueOf()
)

const xMax = computed(() =>
    props.exchangeRates.length > 0
        ? props.exchangeRates[0].date.valueOf()
        : props.periodEnd.valueOf()
)

const formatCurrency = (value: number) => currencyFormatter.value.format(value)

const chartOptions = computed<ChartOptions<"line">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            labels: { boxWidth: 10, boxHeight: 10 },
        },
        tooltip: {
            callbacks: {
                label: (ctx) =>
                    `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
            },
        },
    },
    scales: {
        x: {
            type: "time",
            min: xMin.value,
            max: xMax.value,
            time: {
                unit: "day",
                tooltipFormat: "dd MMM yyyy",
                displayFormats: { day: "dd MMM" },
            },
            grid: { display: false },
        },
        y: {
            grid: { color: "#f1f5f9" },
            ticks: {
                callback: (value) => formatCurrency(Number(value)),
            },
        },
    },
}))
</script>

<template>
    <div class="h-80 w-full p-4">
        <Line :data="chartData" :options="chartOptions" />
    </div>
</template>
