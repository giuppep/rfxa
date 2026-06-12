<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
    label: string
    value: number
    periodStart: Date
    periodEnd: Date
}>()

const formatMonth = (date: Date) =>
    Intl.DateTimeFormat("en-GB", {
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
        <div class="text-sm font-medium text-olive-600">{{ label }}</div>
        <div class="slashed-zero font-mono text-2xl font-semibold">
            {{ (100 * value).toFixed(2) }}%
        </div>
        <div class="text-xs capitalize text-olive-400">{{ period }}</div>
    </div>
</template>
