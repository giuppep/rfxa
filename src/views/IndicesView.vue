<script setup lang="ts">
import { computed, ref, watchEffect } from "vue"
import { useI18n } from "vue-i18n"
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
import { ECONOMIC_INDICES, IndexConfig, IndexId } from "@/config/indices"

const { t } = useI18n()

const props = defineProps<{ type: IndexId }>()

const indexValues = ref<IndexValue[]>([])
const monthlyIndexValues = ref<CumulativeIndexValue[]>([])
const loading = ref(false)
const chartSeries = ref<"mom" | "yoy" | "total">("mom")
const SERIES_OPTIONS: { value: typeof chartSeries.value }[] = [
    { value: "mom" },
    { value: "yoy" },
    { value: "total" },
]

// Fetched independently of the selected period (always the latest ~24
// months up to today), so the "Current" stats below stay up to date
// regardless of the date picker.
const currentIndexValues = ref<IndexValue[]>([])
const currentMonthlyValues = computed(() =>
    computeCumulativeIndexValues(currentIndexValues.value)
)

// currentMonthlyValues is sorted descending by date, so the first entry is
// the most recent month for which data is available.
const latestAvailable = computed(() => currentMonthlyValues.value[0])

// currentIndexValues reaches back 24 months from today, so it always covers
// January of latestAvailable's year.
const currentYtd = computed(() => {
    if (!latestAvailable.value) return 0

    const year = latestAvailable.value.date.getFullYear()
    return computeCumulativeInterest(
        currentIndexValues.value.filter((iv) => iv.date.getFullYear() === year)
    )
})

// cumulativeLast12Months covers latestAvailable's month plus the 11
// preceding ones.
const yoyPeriodStart = computed(() => {
    const date = new Date(latestAvailable.value?.date ?? 0)
    date.setMonth(date.getMonth() - 11)
    return date
})

const ytdPeriodStart = computed(
    () => new Date(latestAvailable.value?.date.getFullYear() ?? 0, 0, 1)
)

// monthlyIndexValues is sorted descending by date, so the first/last entries
// are the latest/oldest months in the selected period - used for the "Total"
// stat's period range.
const latest = computed(() => monthlyIndexValues.value[0])
const oldest = computed(
    () => monthlyIndexValues.value[monthlyIndexValues.value.length - 1]
)

// The months with the highest/lowest MoM value in the selected period.
const bestMonth = computed(() =>
    monthlyIndexValues.value.reduce<CumulativeIndexValue | undefined>(
        (best, current) =>
            !best || current.value > best.value ? current : best,
        undefined
    )
)
const worstMonth = computed(() =>
    monthlyIndexValues.value.reduce<CumulativeIndexValue | undefined>(
        (worst, current) =>
            !worst || current.value < worst.value ? current : worst,
        undefined
    )
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

// Converts the selected period's cumulative return to an annualized rate, so
// periods of different lengths can be compared on equal footing.
const annualizedTotal = computed(() => {
    const months = monthlyIndexValues.value.length
    if (months === 0) return 0
    return Math.pow(1 + currentTotal.value, 12 / months) - 1
})

// Default to the trailing 12 months, from the 1st of the month 12 months
// ago up to today. The user can adjust this range via the date inputs.
const periodEnd = ref(new Date())
const periodStart = ref(new Date(periodEnd.value))
periodStart.value.setMonth(periodStart.value.getMonth() - 12)
periodStart.value.setDate(1)

const fetchIndexValues = (
    index: IndexConfig,
    periodStart: Date,
    periodEnd: Date
) => {
    const request = index.provider === "ipea" ? ipeaRequest : bacenRequest
    return cachedIndexRequest(request, index, periodStart, periodEnd)
}

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
    indexValues.value = await fetchIndexValues(
        index,
        fetchPeriodStart,
        periodEnd.value
    )
    loading.value = false

    monthlyIndexValues.value = computeCumulativeIndexValues(
        indexValues.value
    ).filter((indexValue) => indexValue.date >= periodStart.value)
})

// Independent of periodStart/periodEnd: always fetches the latest ~24
// months up to today, so the "Current" stats stay current regardless of the
// selected period.
watchEffect(async () => {
    const index = ECONOMIC_INDICES.find((index) => index.id === props.type)
    if (!index) return

    const now = new Date()
    const fetchStart = new Date(now)
    fetchStart.setMonth(fetchStart.getMonth() - 24)

    currentIndexValues.value = await fetchIndexValues(index, fetchStart, now)
})
</script>

<template>
    <div class="p-4">
        <h2>{{ t("indices.pageTitle") }}</h2>
        <div class="flex flex-col gap-0.5 mb-4">
            <span class="font-medium text-olive-700 text-sm">
                {{ t("indices.selectIndex") }}
            </span>
            <nav class="flex gap-2">
                <RouterLink
                    v-for="index in ECONOMIC_INDICES"
                    :key="index.id"
                    :to="{ name: 'indices', params: { type: index.id } }"
                    class="rounded-md px-2 py-1 bg-olive-200 text-olive-700 hover:text-olive-50 hover:bg-olive-400"
                    exact-active-class="text-olive-50! bg-olive-500"
                >
                    {{ index.label }}
                </RouterLink>
            </nav>
            <p class="text-sm text-olive-600 mt-1">
                {{ t(`index.${props.type}.description`) }}
            </p>
        </div>
        <div
            v-if="latestAvailable"
            class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4"
        >
            <h3 class="col-span-full">{{ t("indices.latestValues") }}</h3>
            <IndexStat
                :label="t('indices.stats.currentMom.label')"
                :description="t('indices.stats.currentMom.description')"
                :value="latestAvailable.value"
                :period-start="latestAvailable.date"
                :period-end="latestAvailable.date"
            />
            <IndexStat
                :label="t('indices.stats.currentYoy.label')"
                :description="t('indices.stats.currentYoy.description')"
                :value="latestAvailable.cumulativeLast12Months"
                :period-start="yoyPeriodStart"
                :period-end="latestAvailable.date"
            />
            <IndexStat
                :label="t('indices.stats.currentYtd.label')"
                :description="t('indices.stats.currentYtd.description')"
                :value="currentYtd"
                :period-start="ytdPeriodStart"
                :period-end="latestAvailable.date"
            />
        </div>
        <div
            class="flex items-end justify-between border-t border-olive-200 mt-2 pt-4 mb-4"
        >
            <h3>{{ t("indices.periodAnalysis") }}</h3>
            <div class="flex gap-2">
                <DateInput v-model="periodStart" :label="t('indices.from')" />
                <DateInput v-model="periodEnd" :label="t('indices.to')" />
            </div>
        </div>
        <div
            v-if="latest"
            class="grid grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 gap-4 mb-4"
        >
            <IndexStat
                :label="t('indices.stats.total.label')"
                :description="t('indices.stats.total.description')"
                :value="currentTotal"
                :period-start="oldest.date"
                :period-end="latest.date"
            />
            <IndexStat
                :label="t('indices.stats.annualized.label')"
                :description="t('indices.stats.annualized.description')"
                :value="annualizedTotal"
                :period-start="oldest.date"
                :period-end="latest.date"
            />
            <IndexStat
                v-if="bestMonth"
                :label="t('indices.stats.bestMonth.label')"
                :description="t('indices.stats.bestMonth.description')"
                :value="bestMonth.value"
                :period-start="bestMonth.date"
                :period-end="bestMonth.date"
            />
            <IndexStat
                v-if="worstMonth"
                :label="t('indices.stats.worstMonth.label')"
                :description="t('indices.stats.worstMonth.description')"
                :value="worstMonth.value"
                :period-start="worstMonth.date"
                :period-end="worstMonth.date"
            />
        </div>
        <div class="relative grid md:grid-cols-3 grid-cols-1">
            <div
                v-if="loading"
                class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-xs text-olive-400"
            >
                <PhSpinnerGap class="h-8 w-8 animate-spin" />
                {{ t("indices.loading") }}
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
                        {{ t(`indices.series.${option.value}`) }}
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
