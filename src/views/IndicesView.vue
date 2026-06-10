<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { IndexValue, CumulativeIndexValue } from "@/models/finance"
import { parseBacenJson } from "@/utils/bacen"
import IndexLineChart from "@/components/IndexLineChart.vue"
import IndexTable from "@/components/IndexTable.vue"
import { computeCumulativeIndexValues } from "@/utils/finance"
// import { parseIpeaJson } from "@/utils/ipea"

const CDI = ref<IndexValue[]>([])
const CDIMonthly = ref<CumulativeIndexValue[]>([])
const thisYearCDI = computed(() => {
    const thisYear = 2023
    return CDIMonthly.value.filter(
        (indexValue) => indexValue.date.getFullYear() === thisYear
    )
})
onMounted(async () => {
    // Use local file for development
    // const url =
    //     "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados?formato=json"
    const url = "cdi.json"
    // const url =
    //     "http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='IGP12_IGPMG12')"
    // const url = "cdi-ipea.json"

    const response = await fetch(url)
    CDI.value = parseBacenJson(await response.json())
    CDIMonthly.value = computeCumulativeIndexValues(CDI.value)
    // CDI.value = parseIpeaJson((await response.json()).value)
})
</script>

<template>
    <div class="flex">
        <IndexTable :monthly-index-values="thisYearCDI" />
        <IndexLineChart :index-values="thisYearCDI" />
    </div>
</template>
