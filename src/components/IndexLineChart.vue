<script setup lang="ts">
import { IndexValue, CumulativeIndexValue } from "@/models/finance"
import * as d3 from "d3"
import { ref, watchEffect } from "vue"

defineProps<{ indexValues: IndexValue[] | CumulativeIndexValue[] }>()

const width = 680
const height = 400
const marginTop = 20
const marginRight = 20
const marginBottom = 30
const marginLeft = 40

// Declare the x (horizontal position) scale.
const x = d3
    .scaleUtc()
    // TODO: this should be dynamic
    .domain([new Date("2023-01-01"), new Date("2024-01-01")])
    .range([marginLeft, width - marginRight])

// Declare the y (vertical position) scale.
const y = d3
    .scaleLinear()
    // .domain([0, 1])
    .domain([0, 0.02])
    .range([height - marginBottom, marginTop])

const line = d3
    .line<IndexValue>()
    .x((d) => x(d.date))
    .y((d) => y(d.value))

const gy = ref<SVGGElement | null>(null)
const gx = ref<SVGGElement | null>(null)

watchEffect(() => {
    if (gx.value) d3.select(gx.value).call(d3.axisBottom(x))
    if (gy.value)
        d3.select(gy.value).call(d3.axisLeft(y).tickFormat(d3.format(".1%")))
})
</script>

<template>
    <svg
        :width="width"
        :height="height"
        v-if="indexValues.length > 0"
        class="m-4 border-gray-400 border-2"
    >
        <path
            fill="none"
            stroke="black"
            stroke-width="1.5"
            :d="line(indexValues) || ''"
        />
        <g fill="white" stroke="currentColor" stroke-width="1.5">
            <g ref="gy" :transform="`translate(${marginLeft},0)`" />
            <g ref="gx" :transform="`translate(0,${height - marginBottom})`" />
            <g v-for="(d, i) in indexValues">
                <circle
                    :key="i"
                    :cx="x(d.date)"
                    :cy="y(d.value)"
                    r="4"
                    class="peer hover:fill-slate-500 cursor-pointer"
                />
                <foreignObject
                    :x="x(d.date)"
                    :y="y(d.value) - 30"
                    width="100%"
                    height="100%"
                    class="hidden peer-hover:block"
                >
                    <div>
                        <span
                            class="text-xs font-medium p-1 bg-slate-100 rounded-md border-[1px] shadow-sm"
                        >
                            {{ (100 * d.value).toFixed(2) }}%
                        </span>
                    </div>
                </foreignObject>
            </g>
        </g>
    </svg>
</template>
