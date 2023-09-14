<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from "vue"
import { IndexValue } from "@/models/finance"
import { cumulativeLast12Months } from "@/utils/finance"
import { parseBacenJson } from "@/utils/bacen"
import * as d3 from "d3"
// import { parseIpeaJson } from "@/utils/ipea"

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

const width = 640
const height = 400
const marginTop = 20
const marginRight = 20
const marginBottom = 30
const marginLeft = 40

// Declare the x (horizontal position) scale.
const x = d3
    .scaleUtc()
    .domain([new Date("2023-01-01"), new Date("2024-01-01")])
    .range([marginLeft, width - marginRight])

// Declare the y (vertical position) scale.
const y = d3
    .scaleLinear()
    .domain([0, 5])
    .range([height - marginBottom, marginTop])

const line = d3
    .line<IndexValue>()
    .x((d) => x(d.date))
    .y((d) => y(d.value * 100))

const gy = ref(null)
const gx = ref(null)

watchEffect(() => {
    if (gx.value) d3.select(gx.value).call(d3.axisBottom(x))
    if (gy.value) d3.select(gy.value).call(d3.axisLeft(y))
})
</script>

<template>
    <div class="flex">
        <table>
            <thead>
                <th>Date</th>
                <th>Value</th>
                <th>Last 12 mths</th>
            </thead>
            <tbody>
                <tr v-for="(entry, idx) in thisYearCDI">
                    <td class="capitalize">
                        {{
                            Intl.DateTimeFormat("en-GB", {
                                month: "long",
                            }).format(entry.date)
                        }}
                    </td>
                    <td class="slashed-zero">
                        {{ (100 * entry.value).toFixed(2) }}%
                    </td>
                    <td class="slashed-zero">
                        {{ (100 * cumulative[idx]).toFixed(2) }}%
                    </td>
                </tr>
            </tbody>
        </table>

        <svg
            :width="width"
            :height="height"
            v-if="thisYearCDI.length > 0"
            class="m-4"
        >
            <path
                fill="none"
                stroke="black"
                stroke-width="1.5"
                :d="line(thisYearCDI)"
            />
            <g fill="white" stroke="currentColor" stroke-width="1.5">
                <g ref="gy" :transform="`translate(${marginLeft},0)`" />
                <g
                    ref="gx"
                    :transform="`translate(0,${height - marginBottom})`"
                />
                <circle
                    :key="i"
                    :cx="x(d.date)"
                    :cy="y(d.value * 100)"
                    r="2.5"
                    v-for="(d, i) in thisYearCDI"
                >
                    <title>{{ (100 * d.value).toFixed(2) }}%</title>
                </circle>
            </g>
        </svg>
    </div>
</template>

<style scoped></style>
