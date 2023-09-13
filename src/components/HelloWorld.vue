<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { IndexValue } from "@/models/finance"
import { cumulativeLast12Months } from "@/utils/finance"
import { parseBacenJson } from "@/utils/bacen"
// import { parseIpeaJson } from "@/utils/ipea"

defineProps<{ msg: string }>()

const CDI = ref<IndexValue[]>([])
const thisYearCDI = computed(() => {
    const thisYear = 2023
    return CDI.value.filter(
        (indexValue) => indexValue.date.getFullYear() >= thisYear
    )
})
let cumulative: number[] = []
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
    // CDI.value = parseIpeaJson((await response.json()).value)

    cumulative = cumulativeLast12Months(CDI.value)
})
</script>

<template>
    <h1>{{ msg }}</h1>

    <div>
        <table>
            <thead>
                <th>Date</th>
                <th>Value</th>
                <th>Last 12 mths</th>
            </thead>
            <tbody>
                <tr v-for="(entry, idx) in thisYearCDI">
                    <td>
                        {{ Intl.DateTimeFormat("en-GB").format(entry.date) }}
                    </td>
                    <td>{{ (100 * entry.value).toFixed(2) }}%</td>
                    <td>{{ (100 * cumulative[idx]).toFixed(2) }}%</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped></style>
