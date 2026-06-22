<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { PhSpinnerGap } from "@phosphor-icons/vue"
import ExchangeRateLineChart from "@/components/ExchangeRateLineChart.vue"
import { ExchangeRateValue } from "@/models/finance"
import { ptaxUsdBrlRequest } from "@/utils/bacen"

const { t, locale } = useI18n()

const exchangeRates = ref<ExchangeRateValue[]>([])
const loading = ref(true)
const error = ref(false)

const periodEnd = ref(new Date())
const periodStart = ref(new Date(periodEnd.value))
periodStart.value.setDate(periodStart.value.getDate() - 90)

const latestRate = computed(() => exchangeRates.value[0])
const previousRate = computed(() => exchangeRates.value[1])
const thirtyDaysAgoRate = computed(() => {
    if (!latestRate.value) return undefined

    const targetDate = new Date(latestRate.value.date)
    targetDate.setDate(targetDate.getDate() - 30)

    return (
        exchangeRates.value.find((rate) => rate.date <= targetDate) ??
        exchangeRates.value[exchangeRates.value.length - 1]
    )
})

const currencyFormatter = computed(
    () =>
        new Intl.NumberFormat(locale.value, {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
        })
)

const dateTimeFormatter = computed(
    () =>
        new Intl.DateTimeFormat(locale.value, {
            dateStyle: "medium",
            timeStyle: "short",
        })
)

const dateFormatter = computed(
    () =>
        new Intl.DateTimeFormat(locale.value, {
            dateStyle: "medium",
        })
)

const formatCurrency = (value: number) => currencyFormatter.value.format(value)
const formatDate = (date: Date) => dateFormatter.value.format(date)
const formatDateTime = (date: Date) => dateTimeFormatter.value.format(date)
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
    if (!latestRate.value || !baseRate || baseRate.sell === 0) return undefined
    return latestRate.value.sell / baseRate.sell - 1
}
const previousDayChange = computed(() => rateChange(previousRate.value))
const thirtyDayChange = computed(() => rateChange(thirtyDaysAgoRate.value))
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
    <div class="py-8">
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
            <div class="rounded-lg bg-white p-5 shadow-sm">
                <div class="text-sm font-medium text-olive-600">
                    {{ t("exchange.latestAvailable") }}
                </div>
                <div class="mt-1 slashed-zero font-mono text-4xl font-semibold">
                    {{ formatCurrency(latestRate.sell) }}
                </div>
                <div class="mt-1 text-sm text-olive-500">
                    {{ formatDate(latestRate.date) }}
                </div>
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
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
            </div>

            <p class="mt-4 text-sm text-olive-600">
                {{
                    t("exchange.timestamp", {
                        timestamp: formatDateTime(latestRate.timestamp),
                    })
                }}
            </p>

            <div class="mt-8 border-t border-olive-200 pt-4">
                <h3>{{ t("exchange.dailyChart") }}</h3>
                <div class="mt-4 rounded-lg bg-white shadow-sm">
                    <ExchangeRateLineChart
                        :exchange-rates="exchangeRates"
                        :period-start="periodStart"
                        :period-end="periodEnd"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
