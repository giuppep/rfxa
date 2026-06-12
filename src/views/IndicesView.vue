<script setup lang="ts">
import { computed, ref, watchEffect } from "vue"
import { PhSpinnerGap } from "@phosphor-icons/vue"
import { IndexValue, CumulativeIndexValue } from "@/models/finance"
import { bacenRequest } from "@/utils/bacen"
import { ipeaRequest } from "@/utils/ipea"
import { cachedIndexRequest } from "@/utils/cache"
import DateInput from "@/components/DateInput.vue"
import IndexLineChart from "@/components/IndexLineChart.vue"
import IndexStat from "@/components/IndexStat.vue"
import IndexTable from "@/components/IndexTable.vue"
import {
    computeCumulativeIndexValues,
    computeCumulativeInterest,
} from "@/utils/finance"
import { ECONOMIC_INDICES, IndexId } from "@/config/indices"

const props = defineProps<{ type: IndexId }>()

const indexValues = ref<IndexValue[]>([])
const monthlyIndexValues = ref<CumulativeIndexValue[]>([])
const loading = ref(false)
const chartSeries = ref<"mom" | "yoy" | "total">("mom")
const SERIES_OPTIONS: { value: typeof chartSeries.value; label: string }[] = [
    { value: "mom", label: "MoM" },
    { value: "yoy", label: "YoY" },
    { value: "total", label: "Total" },
]

// monthlyIndexValues is sorted descending by date, so the first entry is
// the most recent month.
const latest = computed(() => monthlyIndexValues.value[0])

// indexValues covers 12 months before periodStart (for the YoY lookback), so
// it always reaches back to January of latest's year, regardless of the
// selected period.
const currentYtd = computed(() => {
    if (!latest.value) return 0

    const year = latest.value.date.getFullYear()
    return computeCumulativeInterest(
        indexValues.value.filter((iv) => iv.date.getFullYear() === year)
    )
})

// cumulativeLast12Months covers the latest month plus the 11 preceding ones.
const yoyPeriodStart = computed(() => {
    const date = new Date(latest.value?.date ?? 0)
    date.setMonth(date.getMonth() - 11)
    return date
})

const ytdPeriodStart = computed(
    () => new Date(latest.value?.date.getFullYear() ?? 0, 0, 1)
)

// monthlyIndexValues is sorted descending by date, so the last entry is the
// oldest month in the displayed range.
const oldest = computed(
    () => monthlyIndexValues.value[monthlyIndexValues.value.length - 1]
)

// Cumulative growth of 1 unit invested at periodStart, evaluated at each
// month in the displayed range. monthlyIndexValues is sorted descending, so
// it's reversed to accumulate from the oldest month, then reversed back.
const cumulativeTotalSeries = computed<IndexValue[]>(() => {
    let cumulative = 1
    return [...monthlyIndexValues.value]
        .reverse()
        .map((indexValue) => {
            cumulative *= 1 + indexValue.value
            return { date: indexValue.date, value: cumulative - 1 }
        })
        .reverse()
})

// The first entry of cumulativeTotalSeries is the cumulative growth over the
// whole displayed range.
const currentTotal = computed(() => cumulativeTotalSeries.value[0]?.value ?? 0)

// Default to the trailing 12 months, from the 1st of the month 12 months
// ago up to today. The user can adjust this range via the date inputs.
const periodEnd = ref(new Date())
const periodStart = ref(new Date(periodEnd.value))
periodStart.value.setMonth(periodStart.value.getMonth() - 12)
periodStart.value.setDate(1)

watchEffect(async () => {
    const index = ECONOMIC_INDICES.find((index) => index.id === props.type)
    if (!index) return

    // computeCumulativeIndexValues looks back up to 12 months from each
    // entry to compute cumulativeLast12Months (YoY), so for the oldest
    // entry in the displayed range (periodStart) to have a full trailing
    // window, we need data going back another 12 months before that.
    const fetchPeriodStart = new Date(periodStart.value)
    fetchPeriodStart.setMonth(fetchPeriodStart.getMonth() - 12)

    loading.value = true
    const request = index.provider === "ipea" ? ipeaRequest : bacenRequest
    indexValues.value = await cachedIndexRequest(
        request,
        index,
        fetchPeriodStart,
        periodEnd.value
    )
    loading.value = false

    // Compute cumulative values over the full (24-month) series, then trim
    // back down to the displayed range (12 months) for the table/chart.
    monthlyIndexValues.value = computeCumulativeIndexValues(
        indexValues.value
    ).filter((indexValue) => indexValue.date >= periodStart.value)
})
</script>

<template>
    <div class="p-4">
        <div class="flex justify-between items-end mb-4">
            <div class="flex flex-col gap-0.5">
                <span class="font-medium text-olive-700 text-sm">
                    Select one index:
                </span>
                <nav class="flex gap-2">
                    <RouterLink
                        v-for="index in ECONOMIC_INDICES"
                        :key="index.id"
                        :to="`/indices/${index.id}`"
                        class="rounded-md px-2 py-1 bg-olive-200 text-olive-700 hover:text-olive-50 hover:bg-olive-400"
                        exact-active-class="text-olive-50! bg-olive-500"
                    >
                        {{ index.label }}
                    </RouterLink>
                </nav>
            </div>
            <div class="flex gap-1">
                <DateInput v-model="periodStart" label="From" />
                <DateInput v-model="periodEnd" label="To" />
            </div>
        </div>
        <div v-if="latest" class="flex gap-4 mb-4">
            <IndexStat
                label="Current MoM"
                :value="latest.value"
                :period-start="latest.date"
                :period-end="latest.date"
            />
            <IndexStat
                label="Current YoY"
                :value="latest.cumulativeLast12Months"
                :period-start="yoyPeriodStart"
                :period-end="latest.date"
            />
            <IndexStat
                label="Current YTD"
                :value="currentYtd"
                :period-start="ytdPeriodStart"
                :period-end="latest.date"
            />
            <IndexStat
                label="Total"
                :value="currentTotal"
                :period-start="oldest.date"
                :period-end="latest.date"
            />
        </div>
        <div class="relative grid md:grid-cols-3 grid-cols-1">
            <div
                v-if="loading"
                class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-xs text-olive-400"
            >
                <PhSpinnerGap class="h-8 w-8 animate-spin" />
                Loading...
            </div>
            <div class="col-span-2">
                <div class="m-4 flex gap-2">
                    <button
                        v-for="option in SERIES_OPTIONS"
                        :key="option.value"
                        type="button"
                        class="rounded-full px-3 py-1 text-sm"
                        :class="
                            chartSeries === option.value
                                ? 'bg-olive-500 text-olive-50'
                                : 'bg-olive-200 text-olive-700 hover:text-olive-50 hover:bg-olive-400'
                        "
                        @click="chartSeries = option.value"
                    >
                        {{ option.label }}
                    </button>
                </div>
                <IndexLineChart
                    :index-values="
                        chartSeries === 'total'
                            ? cumulativeTotalSeries
                            : monthlyIndexValues
                    "
                    :period-start="periodStart"
                    :period-end="periodEnd"
                    :series="chartSeries"
                />
            </div>
            <IndexTable
                :monthly-index-values="monthlyIndexValues"
                class="col-span-1"
            />
        </div>
    </div>
</template>
