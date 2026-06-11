<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { IndexValue, CumulativeIndexValue } from "@/models/finance"
import { bacenRequest } from "@/utils/bacen"
import { ipeaRequest } from "@/utils/ipea"
import IndexLineChart from "@/components/IndexLineChart.vue"
import IndexTable from "@/components/IndexTable.vue"
import { computeCumulativeIndexValues } from "@/utils/finance"
import { ECONOMIC_INDICES, IndexId } from "@/config/indices"

const props = defineProps<{ type: IndexId }>()

const indexValues = ref<IndexValue[]>([])
const monthlyIndexValues = ref<CumulativeIndexValue[]>([])
const periodStart = ref(new Date())
const periodEnd = ref(new Date())
const chartSeries = ref<"value" | "ytd" | "yoy">("value")

watchEffect(async () => {
    const index = ECONOMIC_INDICES.find((index) => index.id === props.type)
    if (!index) return

    // The displayed range is the trailing 12 months, from the 1st of the
    // month 12 months ago up to today.
    periodEnd.value = new Date()
    periodStart.value = new Date(periodEnd.value)
    periodStart.value.setMonth(periodStart.value.getMonth() - 12)
    periodStart.value.setDate(1)

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
    <nav class="flex gap-4 px-4 py-2">
        <RouterLink
            v-for="index in ECONOMIC_INDICES"
            :key="index.id"
            :to="`/indices/${index.id}`"
        >
            {{ index.label }}
        </RouterLink>
    </nav>
    <div class="flex">
        <IndexTable :monthly-index-values="monthlyIndexValues" />
        <div>
            <select v-model="chartSeries" class="m-4 border px-2 py-1">
                <option value="value">Value</option>
                <option value="ytd">YTD</option>
                <option value="yoy">YoY</option>
            </select>
            <IndexLineChart
                :index-values="monthlyIndexValues"
                :period-start="periodStart"
                :period-end="periodEnd"
                :series="chartSeries"
            />
        </div>
    </div>
</template>
