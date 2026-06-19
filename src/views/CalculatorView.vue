<script setup lang="ts">
import { ref, computed, watchEffect, watch } from "vue"
import { useI18n } from "vue-i18n"
import { PhSpinnerGap } from "@phosphor-icons/vue"
import { IndexValue } from "@/models/finance"
import { bacenRequest } from "@/utils/bacen"
import { ipeaRequest } from "@/utils/ipea"
import { cachedIndexRequest } from "@/utils/cache"
import { computeCumulativeInterest } from "@/utils/finance"
import { ECONOMIC_INDICES, IndexId } from "@/config/indices"
import DateInput from "@/components/DateInput.vue"
import IndexLineChart from "@/components/IndexLineChart.vue"
import IndexSelector from "@/components/IndexSelector.vue"

const { t, locale } = useI18n()

type ModifierType = "percentage" | "spread" | "fixed"
type IndexSelection = IndexId | "fixed"

const amount = ref(10000)
const indexSelection = ref<IndexSelection>("cdi")
const modifierType = ref<ModifierType>("percentage")
const modifierValue = ref(100)

const periodEnd = ref(new Date())
const periodStart = ref(new Date())
periodStart.value.setMonth(periodStart.value.getMonth() - 12)
periodStart.value.setDate(1)

const isIndexBased = computed(() => indexSelection.value !== "fixed")

const selectedIndex = computed(() =>
    ECONOMIC_INDICES.find((i) => i.id === indexSelection.value)
)

watch(indexSelection, (newVal) => {
    if (newVal === "fixed") {
        modifierType.value = "fixed"
        modifierValue.value = 12
    } else if (modifierType.value === "fixed") {
        modifierType.value = "percentage"
        modifierValue.value = 100
    }
})

watch(modifierType, (newType, oldType) => {
    if (oldType === "percentage" && newType === "spread")
        modifierValue.value = 7
    else if (oldType === "spread" && newType === "percentage")
        modifierValue.value = 100
})

const rawIndexValues = ref<IndexValue[]>([])
const loading = ref(false)

watchEffect(async () => {
    if (!isIndexBased.value) {
        rawIndexValues.value = []
        loading.value = false
        return
    }
    const index = ECONOMIC_INDICES.find((i) => i.id === indexSelection.value)
    if (!index) return
    const request = index.provider === "ipea" ? ipeaRequest : bacenRequest
    loading.value = true
    rawIndexValues.value = await cachedIndexRequest(
        request,
        index,
        periodStart.value,
        periodEnd.value
    )
    loading.value = false
})

// For fixed-rate mode there is no index to fetch, so we generate a synthetic
// monthly series where every entry carries the same rate. The annual rate the
// user entered is converted to its monthly equivalent via:
//   monthly = (1 + annual)^(1/12) − 1
// so that compounding it 12 times produces exactly the stated annual return.
function syntheticMonthSeries(
    start: Date,
    end: Date,
    monthlyRate: number
): IndexValue[] {
    const result: IndexValue[] = []
    const cursor = new Date(end.getFullYear(), end.getMonth(), 1)
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1)
    while (cursor >= startMonth) {
        result.push({ date: new Date(cursor), value: monthlyRate })
        cursor.setMonth(cursor.getMonth() - 1)
    }
    return result
}

// The effective monthly rates after applying the selected modifier, sorted
// descending (newest first) to match the rest of the app's convention.
//
// Three modifier modes:
//   "percentage"  — scales each monthly rate by a factor, e.g. 110% CDI:
//                   effective = cdi_monthly × 1.10
//   "spread"      — adds a fixed annual spread on top of the index via
//                   multiplicative compounding (Brazilian market convention):
//                   effective = (1 + index_monthly) × (1 + spread_monthly) − 1
//                   where spread_monthly = (1 + spread_annual)^(1/12) − 1
//   "fixed"       — no index; uses syntheticMonthSeries with the monthly
//                   equivalent of the stated annual rate
const adjustedValues = computed((): IndexValue[] => {
    if (!isIndexBased.value) {
        return syntheticMonthSeries(
            periodStart.value,
            periodEnd.value,
            Math.pow(1 + modifierValue.value / 100, 1 / 12) - 1
        )
    }
    const values = rawIndexValues.value.filter(
        (iv) => iv.date >= periodStart.value && iv.date <= periodEnd.value
    )
    if (modifierType.value === "percentage") {
        const pct = modifierValue.value / 100
        return values.map((iv) => ({ ...iv, value: iv.value * pct }))
    }
    const monthlySpread = Math.pow(1 + modifierValue.value / 100, 1 / 12) - 1
    return values.map((iv) => ({
        ...iv,
        value: (1 + iv.value) * (1 + monthlySpread) - 1,
    }))
})

// Running product of (1 + monthly_rate) starting from the oldest month,
// minus 1 — i.e. the fraction by which the investment has grown up to each
// date. Reversed to ascending for the accumulation pass, then reversed back
// to descending so IndexLineChart can consume it in the usual order.
const growthSeries = computed<IndexValue[]>(() => {
    let cumulative = 1
    return [...adjustedValues.value]
        .reverse()
        .map((iv) => {
            cumulative *= 1 + iv.value
            return { date: iv.date, value: cumulative - 1 }
        })
        .reverse()
})

const totalReturn = computed(() =>
    computeCumulativeInterest(adjustedValues.value)
)
const months = computed(() => adjustedValues.value.length)
const finalValue = computed(() => amount.value * (1 + totalReturn.value))
// Geometric annualization: what constant annual rate would produce the same
// total return over the same number of months?
//   annualized = (1 + total)^(12 / n) − 1
const annualized = computed(() => {
    if (months.value === 0) return 0
    return Math.pow(1 + totalReturn.value, 12 / months.value) - 1
})

const hasResult = computed(() => adjustedValues.value.length > 0)

const formatCurrency = (value: number) =>
    Intl.NumberFormat(locale.value, {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    }).format(value)
</script>

<template>
    <div class="p-4">
        <h2>{{ t("calculator.pageTitle") }}</h2>

        <!-- Inputs -->
        <div
            class="mb-6 grid grid-cols-1 gap-6 rounded-lg bg-white p-4 shadow-sm md:grid-cols-3"
        >
            <!-- Amount -->
            <label class="flex flex-col gap-1">
                <span class="text-sm font-medium text-olive-700">
                    {{ t("calculator.investedAmount") }}
                </span>
                <div class="flex items-center gap-1">
                    <span class="text-sm text-olive-500">R$</span>
                    <input
                        v-model.number="amount"
                        type="number"
                        min="0"
                        step="1000"
                        class="w-full rounded-md border px-2 py-1"
                    />
                </div>
            </label>

            <!-- Index + modifier -->
            <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-olive-700">
                    {{ t("calculator.index") }}
                </span>
                <IndexSelector v-model="indexSelection" show-fixed />

                <div
                    v-if="isIndexBased"
                    class="flex gap-3 text-sm text-olive-700"
                >
                    <label class="flex cursor-pointer items-center gap-1">
                        <input
                            v-model="modifierType"
                            type="radio"
                            value="percentage"
                            class="accent-olive-500"
                        />
                        {{ t("calculator.modifierType.percentage") }}
                    </label>
                    <label class="flex cursor-pointer items-center gap-1">
                        <input
                            v-model="modifierType"
                            type="radio"
                            value="spread"
                            class="accent-olive-500"
                        />
                        {{ t("calculator.modifierType.spread") }}
                    </label>
                </div>

                <div class="flex items-center gap-1">
                    <span
                        v-if="modifierType === 'spread' && selectedIndex"
                        class="text-sm text-olive-500"
                    >
                        {{ selectedIndex.label }} +
                    </span>
                    <input
                        v-model.number="modifierValue"
                        type="number"
                        step="0.1"
                        class="w-20 rounded-md border px-2 py-0.5"
                    />
                    <span class="text-sm text-olive-500">
                        {{ modifierType === "percentage" ? "%" : "% p.a." }}
                    </span>
                </div>
            </div>

            <!-- Period -->
            <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-olive-700">
                    {{ t("calculator.period") }}
                </span>
                <div class="flex flex-wrap gap-2">
                    <DateInput
                        v-model="periodStart"
                        :label="t('calculator.from')"
                    />
                    <DateInput
                        v-model="periodEnd"
                        :label="t('calculator.to')"
                    />
                </div>
            </div>
        </div>

        <!-- Results -->
        <div class="relative">
            <div
                v-if="loading && !hasResult"
                class="flex items-center justify-center gap-2 py-16 text-olive-400"
            >
                <PhSpinnerGap class="h-6 w-6 animate-spin" />
                {{ t("indices.loading") }}
            </div>

            <template v-else-if="hasResult">
                <div
                    v-if="loading"
                    class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-xs text-olive-400"
                >
                    <PhSpinnerGap class="h-8 w-8 animate-spin" />
                </div>

                <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div class="rounded-lg bg-white p-4 shadow-sm">
                        <div class="text-sm font-medium text-olive-600">
                            {{ t("calculator.results.finalValue") }}
                        </div>
                        <div
                            class="slashed-zero font-mono text-2xl font-semibold"
                        >
                            {{ formatCurrency(finalValue) }}
                        </div>
                        <div class="text-xs text-olive-400">
                            {{
                                t("calculator.results.invested", {
                                    amount: formatCurrency(amount),
                                })
                            }}
                        </div>
                    </div>

                    <div class="rounded-lg bg-white p-4 shadow-sm">
                        <div class="text-sm font-medium text-olive-600">
                            {{ t("calculator.results.totalReturn") }}
                        </div>
                        <div
                            class="slashed-zero font-mono text-2xl font-semibold"
                        >
                            {{ (100 * totalReturn).toFixed(2) }}%
                        </div>
                        <div class="text-xs text-olive-400">
                            {{ t("calculator.results.months", { n: months }) }}
                        </div>
                    </div>

                    <div class="rounded-lg bg-white p-4 shadow-sm">
                        <div class="text-sm font-medium text-olive-600">
                            {{ t("calculator.results.annualized") }}
                        </div>
                        <div
                            class="slashed-zero font-mono text-2xl font-semibold"
                        >
                            {{ (100 * annualized).toFixed(2) }}%
                        </div>
                        <div class="text-xs text-olive-400">
                            {{ t("calculator.results.perAnnum") }}
                        </div>
                    </div>
                </div>

                <IndexLineChart
                    :index-values="growthSeries"
                    :period-start="periodStart"
                    :period-end="periodEnd"
                    series="total"
                />
            </template>
        </div>
    </div>
</template>
