<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { IndexValue, CumulativeIndexValue } from "@/models/finance"
import { bacenRequest } from "@/utils/bacen"
import IndexLineChart from "@/components/IndexLineChart.vue"
import IndexTable from "@/components/IndexTable.vue"
import { computeCumulativeIndexValues } from "@/utils/finance"
import { ECONOMIC_INDICES, IndexId } from "@/config/indices"

const props = defineProps<{ type: IndexId }>()

const indexValues = ref<IndexValue[]>([])
const monthlyIndexValues = ref<CumulativeIndexValue[]>([])
const periodStart = ref(new Date())
const periodEnd = ref(new Date())

watchEffect(async () => {
    const index = ECONOMIC_INDICES.find((index) => index.id === props.type)
    if (!index) return

    periodEnd.value = new Date()
    periodStart.value = new Date(periodEnd.value)
    periodStart.value.setMonth(periodStart.value.getMonth() - 12)
    periodStart.value.setDate(1)

    console.log("Request", index, periodStart.value, periodEnd.value)
    indexValues.value = await bacenRequest(
        index.url,
        periodStart.value,
        periodEnd.value
    )
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
        <IndexTable :monthly-index-values="monthlyIndexValues" />
        <IndexLineChart
            :index-values="monthlyIndexValues"
            :period-start="periodStart"
            :period-end="periodEnd"
            show-yoy
            show-ytd
        />
    </div>
</template>
