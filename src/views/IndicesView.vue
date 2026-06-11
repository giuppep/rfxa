<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { IndexValue, CumulativeIndexValue } from "@/models/finance"
import { bacenRequest } from "@/utils/bacen"
import { ipeaRequest } from "@/utils/ipea"
import DateInput from "@/components/DateInput.vue"
import IndexLineChart from "@/components/IndexLineChart.vue"
import IndexTable from "@/components/IndexTable.vue"
import { computeCumulativeIndexValues } from "@/utils/finance"
import { ECONOMIC_INDICES, IndexId } from "@/config/indices"

const props = defineProps<{ type: IndexId }>()

const indexValues = ref<IndexValue[]>([])
const monthlyIndexValues = ref<CumulativeIndexValue[]>([])
const chartSeries = ref<"value" | "ytd" | "yoy">("value")
const SERIES_OPTIONS: { value: typeof chartSeries.value; label: string }[] = [
    { value: "value", label: "Value" },
    { value: "ytd", label: "YTD" },
    { value: "yoy", label: "YoY" },
]

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

    const request = index.provider === "ipea" ? ipeaRequest : bacenRequest
    indexValues.value = await request(
        index.url,
        fetchPeriodStart,
        periodEnd.value
    )

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
                <span class="font-medium text-slate-700 text-sm">
                    Select one index:
                </span>
                <nav class="flex gap-2">
                    <RouterLink
                        v-for="index in ECONOMIC_INDICES"
                        :key="index.id"
                        :to="`/indices/${index.id}`"
                        class="bg-slate-100 rounded-md px-2 py-1 text-slate-500 hover:text-slate-50 hover:bg-slate-400"
                        exact-active-class="!text-slate-50 bg-slate-500"
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
        <div class="flex">
            <IndexTable :monthly-index-values="monthlyIndexValues" />
            <div>
                <div class="m-4 flex gap-2">
                    <button
                        v-for="option in SERIES_OPTIONS"
                        :key="option.value"
                        type="button"
                        class="rounded-full px-3 py-1 text-sm"
                        :class="
                            chartSeries === option.value
                                ? 'bg-slate-500 text-slate-50'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-400 hover:text-slate-50'
                        "
                        @click="chartSeries = option.value"
                    >
                        {{ option.label }}
                    </button>
                </div>
                <IndexLineChart
                    :index-values="monthlyIndexValues"
                    :period-start="periodStart"
                    :period-end="periodEnd"
                    :series="chartSeries"
                />
            </div>
        </div>
    </div>
</template>
