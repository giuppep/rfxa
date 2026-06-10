<script setup lang="ts">
import { ref, watchEffect, computed } from "vue"
import { IndexValue, CumulativeIndexValue } from "@/models/finance"
import { parseBacenJson } from "@/utils/bacen"
import IndexLineChart from "@/components/IndexLineChart.vue"
import IndexTable from "@/components/IndexTable.vue"
import { computeCumulativeIndexValues } from "@/utils/finance"
import { ECONOMIC_INDICES, IndexId } from "@/config/indices"

const props = defineProps<{ type: IndexId }>()

const indexValues = ref<IndexValue[]>([])
const monthlyIndexValues = ref<CumulativeIndexValue[]>([])
const thisYearIndexValues = computed(() => {
    const thisYear = 2023
    return monthlyIndexValues.value.filter(
        (indexValue) => indexValue.date.getFullYear() === thisYear
    )
})

watchEffect(async () => {
    const index = ECONOMIC_INDICES.find((index) => index.id === props.type)
    if (!index) return

    const response = await fetch(index.url)
    indexValues.value = parseBacenJson(await response.json())
    monthlyIndexValues.value = computeCumulativeIndexValues(indexValues.value)
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
        <IndexTable :monthly-index-values="thisYearIndexValues" />
        <IndexLineChart :index-values="thisYearIndexValues" />
    </div>
</template>
