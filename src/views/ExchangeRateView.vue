<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { PhSpinnerGap } from "@phosphor-icons/vue"
import { ExchangeRateValue } from "@/models/finance"
import { latestPtaxUsdBrlRequest } from "@/utils/bacen"

const { t, locale } = useI18n()

const latestRate = ref<ExchangeRateValue>()
const loading = ref(true)
const error = ref(false)

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

onMounted(async () => {
    try {
        latestRate.value = await latestPtaxUsdBrlRequest()
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

        <div
            v-if="loading"
            class="mt-8 flex items-center gap-2 text-olive-500"
        >
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
                        {{ t("exchange.buy") }}
                    </div>
                    <div class="slashed-zero font-mono text-2xl font-semibold">
                        {{ formatCurrency(latestRate.buy) }}
                    </div>
                </div>

                <div class="rounded-lg bg-white p-4 shadow-sm">
                    <div class="text-sm font-medium text-olive-600">
                        {{ t("exchange.sell") }}
                    </div>
                    <div class="slashed-zero font-mono text-2xl font-semibold">
                        {{ formatCurrency(latestRate.sell) }}
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
        </div>
    </div>
</template>
