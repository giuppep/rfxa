<script setup lang="ts">
import { CumulativeIndexValue } from "@/models/finance"

defineProps<{ monthlyIndexValues: CumulativeIndexValue[] }>()
</script>

<template>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Value</th>
                <th>YoY</th>
                <th>YTD</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="entry in monthlyIndexValues">
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
                    {{ (100 * entry.cumulativeLast12Monhts).toFixed(2) }}%
                </td>
                <td class="slashed-zero">
                    {{ (100 * entry.cumulativeSinceYearStart).toFixed(2) }}%
                </td>
            </tr>
        </tbody>
    </table>
</template>
