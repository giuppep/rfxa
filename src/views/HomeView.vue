<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { ECONOMIC_INDICES } from "@/config/indices"
import { ExchangeRateValue } from "@/models/finance"
import { latestPtaxUsdBrlRequest } from "@/utils/bacen"

const { t, locale } = useI18n()

const latestUsdRate = ref<ExchangeRateValue>()
const exchangeRateLoading = ref(true)
const exchangeRateError = ref(false)

const currencyFormatter = computed(
    () =>
        new Intl.NumberFormat(locale.value, {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
        })
)

const formatCurrency = (value: number) => currencyFormatter.value.format(value)

onMounted(async () => {
    try {
        latestUsdRate.value = await latestPtaxUsdBrlRequest()
    } catch {
        exchangeRateError.value = true
    } finally {
        exchangeRateLoading.value = false
    }
})
</script>

<template>
    <div class="py-8">
        <h1>rfxa</h1>
        <p class="mt-2 max-w-2xl text-olive-700">
            {{ t("home.tagline") }}
        </p>
        <div class="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <RouterLink
                v-for="index in ECONOMIC_INDICES"
                :key="index.id"
                :to="{ name: 'indices', params: { type: index.id } }"
                class="rounded-lg bg-olive-100 p-4 shadow-xs hover:bg-olive-200"
            >
                <div class="text-lg font-semibold text-olive-800">
                    {{ index.label }}
                </div>
                <div class="mt-1 text-sm text-olive-600">
                    {{ t(`index.${index.id}.description`) }}
                </div>
            </RouterLink>
            <RouterLink
                :to="{ name: 'exchange-usd-brl' }"
                class="rounded-lg bg-olive-100 p-4 shadow-xs hover:bg-olive-200"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="text-lg font-semibold text-olive-800">
                        {{ t("home.usdBrl.title") }}
                    </div>
                    <div
                        v-if="latestUsdRate"
                        class="slashed-zero font-mono text-sm font-semibold text-olive-700"
                    >
                        {{ formatCurrency(latestUsdRate.sell) }}
                    </div>
                </div>
                <div class="mt-1 text-sm text-olive-600">
                    {{ t("home.usdBrl.description") }}
                </div>
                <div class="mt-3 text-xs font-medium text-olive-500">
                    <span v-if="exchangeRateLoading">
                        {{ t("home.usdBrl.loading") }}
                    </span>
                    <span v-else-if="exchangeRateError || !latestUsdRate">
                        {{ t("home.usdBrl.unavailable") }}
                    </span>
                    <span v-else>{{ t("home.usdBrl.latest") }}</span>
                </div>
            </RouterLink>
        </div>
    </div>
</template>
