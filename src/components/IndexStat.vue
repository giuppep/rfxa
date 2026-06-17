<script setup lang="ts">
import { computed } from "vue"
import { PhInfo } from "@phosphor-icons/vue"
import { useI18n } from "vue-i18n"

const props = defineProps<{
    label: string
    value: number
    periodStart: Date
    periodEnd: Date
    description?: string
}>()

const { locale } = useI18n()

const formatMonth = (date: Date) =>
    Intl.DateTimeFormat(locale.value, {
        month: "short",
        year: "numeric",
    }).format(date)

const period = computed(() => {
    const start = formatMonth(props.periodStart)
    const end = formatMonth(props.periodEnd)
    return start === end ? start : `${start} - ${end}`
})
</script>

<template>
    <div class="rounded-lg bg-white p-4 shadow-sm">
        <div class="flex items-center gap-1 text-sm font-medium text-olive-600">
            {{ label }}
            <span
                v-if="description"
                class="cursor-help text-olive-400"
                :data-tooltip="description"
            >
                <PhInfo class="h-4 w-4 shrink-0" />
            </span>
        </div>
        <div class="slashed-zero font-mono text-2xl font-semibold">
            {{ (100 * value).toFixed(2) }}%
        </div>
        <div class="text-xs capitalize text-olive-400">{{ period }}</div>
    </div>
</template>
