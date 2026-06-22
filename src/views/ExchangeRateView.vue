<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { PhSpinnerGap } from "@phosphor-icons/vue"
import ExchangeRateLineChart from "@/components/ExchangeRateLineChart.vue"
import ToggleSwitch from "@/components/ToggleSwitch.vue"
import { ExchangeRateType, ExchangeRateValue } from "@/models/finance"
import { ptaxUsdBrlRequest } from "@/utils/bacen"
import { formatCurrency } from "@/utils/formatting"

const { t, locale } = useI18n()

const exchangeRates = ref<ExchangeRateValue[]>([])
const loading = ref(true)
const error = ref(false)
const exchangeRateType = ref<ExchangeRateType>("sell")
const exchangeRateTypeOptions = computed(() => {
    const exchangeRateTypes: ExchangeRateType[] = ["sell", "buy"]
    return exchangeRateTypes.map((type) => ({
        value: type,
        label: t(`exchange.rateTypes.${type}`),
    }))
})

const periodEnd = ref(new Date())
const periodStart = ref(new Date(periodEnd.value))
periodStart.value.setDate(periodStart.value.getDate() - 90)

// BACEN PTAX values are sorted newest-first in bacen.ts, so the latest record
// is always the first item in the loaded range.
const latestRate = computed(() => exchangeRates.value[0])
const latestRateValue = computed(
    () => latestRate.value?.[exchangeRateType.value]
)
const previousRate = computed(() => exchangeRates.value[1])

// PTAX quotes are only published on business days. For a "30 days" comparison,
// use the first available quote on or before the target calendar date, falling
// back to the oldest loaded quote if the exact window is unavailable.
const thirtyDaysAgoRate = computed(() => {
    if (!latestRate.value) return undefined

    const targetDate = new Date(latestRate.value.date)
    targetDate.setDate(targetDate.getDate() - 30)

    return (
        exchangeRates.value.find((rate) => rate.date <= targetDate) ??
        exchangeRates.value[exchangeRates.value.length - 1]
    )
})
const ninetyDaysAgoRate = computed(
    () => exchangeRates.value[exchangeRates.value.length - 1]
)

const dateFormatter = computed(
    () =>
        new Intl.DateTimeFormat(locale.value, {
            dateStyle: "medium",
        })
)

const formatDate = (date: Date) => dateFormatter.value.format(date)
const percentFormatter = computed(
    () =>
        new Intl.NumberFormat(locale.value, {
            style: "percent",
            signDisplay: "always",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
)
const rateChange = (baseRate?: ExchangeRateValue) => {
    if (!latestRate.value || !baseRate) return undefined

    // Compute variation against whichever PTAX side the user selected.
    const baseValue = baseRate[exchangeRateType.value]
    if (baseValue === 0) return undefined

    return latestRate.value[exchangeRateType.value] / baseValue - 1
}
const previousDayChange = computed(() => rateChange(previousRate.value))
const thirtyDayChange = computed(() => rateChange(thirtyDaysAgoRate.value))
const ninetyDayChange = computed(() => rateChange(ninetyDaysAgoRate.value))
const formatPercent = (value?: number) =>
    value === undefined ? "--" : percentFormatter.value.format(value)
const variationClass = (value?: number) => {
    if (value === undefined || value === 0) return "text-olive-700"
    return value > 0 ? "text-emerald-700" : "text-red-700"
}

onMounted(async () => {
    try {
        exchangeRates.value = await ptaxUsdBrlRequest(
            periodStart.value,
            periodEnd.value
        )
    } catch {
        error.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="p-4">
        <h2>{{ t("exchange.pageTitle") }}</h2>
        <p class="mt-2 max-w-2xl text-olive-700">
            {{ t("exchange.description") }}
        </p>

        <div v-if="loading" class="mt-8 flex items-center gap-2 text-olive-500">
            <PhSpinnerGap class="h-5 w-5 animate-spin" />
            {{ t("exchange.loading") }}
        </div>

        <p v-else-if="error || !latestRate" class="mt-8 text-olive-600">
            {{ t("exchange.unavailable") }}
        </p>

        <div v-else class="mt-8 max-w-3xl">
            <ToggleSwitch
                v-model="exchangeRateType"
                :options="exchangeRateTypeOptions"
                class="mb-4"
            />

            <div class="rounded-lg bg-white p-5 shadow-sm">
                <div class="text-sm font-medium text-olive-600">
                    {{
                        t("exchange.latestAvailable", {
                            type: t(`exchange.rateTypes.${exchangeRateType}`),
                        })
                    }}
                </div>
                <div class="mt-1 slashed-zero font-mono text-4xl font-semibold">
                    {{ formatCurrency(latestRateValue, locale) }}
                </div>
                <div class="mt-1 text-sm text-olive-500">
                    {{ formatDate(latestRate.date) }}
                </div>
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-3">
                <div class="rounded-lg bg-white p-4 shadow-sm">
                    <div class="text-sm font-medium text-olive-600">
                        {{ t("exchange.previousDayChange") }}
                    </div>
                    <div
                        class="slashed-zero font-mono text-2xl font-semibold"
                        :class="variationClass(previousDayChange)"
                    >
                        {{ formatPercent(previousDayChange) }}
                    </div>
                    <div v-if="previousRate" class="text-xs text-olive-400">
                        {{ formatDate(previousRate.date) }}
                    </div>
                </div>

                <div class="rounded-lg bg-white p-4 shadow-sm">
                    <div class="text-sm font-medium text-olive-600">
                        {{ t("exchange.thirtyDayChange") }}
                    </div>
                    <div
                        class="slashed-zero font-mono text-2xl font-semibold"
                        :class="variationClass(thirtyDayChange)"
                    >
                        {{ formatPercent(thirtyDayChange) }}
                    </div>
                    <div
                        v-if="thirtyDaysAgoRate"
                        class="text-xs text-olive-400"
                    >
                        {{ formatDate(thirtyDaysAgoRate.date) }}
                    </div>
                </div>

                <div class="rounded-lg bg-white p-4 shadow-sm">
                    <div class="text-sm font-medium text-olive-600">
                        {{ t("exchange.ninetyDayChange") }}
                    </div>
                    <div
                        class="slashed-zero font-mono text-2xl font-semibold"
                        :class="variationClass(ninetyDayChange)"
                    >
                        {{ formatPercent(ninetyDayChange) }}
                    </div>
                    <div
                        v-if="ninetyDaysAgoRate"
                        class="text-xs text-olive-400"
                    >
                        {{ formatDate(ninetyDaysAgoRate.date) }}
                    </div>
                </div>
            </div>

            <div class="mt-8 border-t border-olive-200 pt-4">
                <h3>{{ t("exchange.dailyChart") }}</h3>
                <div class="mt-4 rounded-lg bg-white shadow-sm">
                    <ExchangeRateLineChart
                        :exchange-rates="exchangeRates"
                        :exchange-rate-type="exchangeRateType"
                        :period-start="periodStart"
                        :period-end="periodEnd"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
