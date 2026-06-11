<script setup lang="ts">
import { CumulativeIndexValue } from "@/models/finance"

defineProps<{ monthlyIndexValues: CumulativeIndexValue[] }>()
</script>

<template>
    <table>
        <thead>
            <tr>
                <th class="text-left">Date</th>
                <th class="text-right">Value</th>
                <th class="text-right">YoY</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="entry in monthlyIndexValues">
                <td class="capitalize">
                    {{
                        Intl.DateTimeFormat("en-GB", {
                            month: "short",
                            year: "numeric",
                        }).format(entry.date)
                    }}
                </td>
                <td class="slashed-zero font-mono text-right">
                    {{ (100 * entry.value).toFixed(2) }}%
                </td>
                <td class="slashed-zero font-mono text-right">
                    {{ (100 * entry.cumulativeLast12Months).toFixed(2) }}%
                </td>
            </tr>
        </tbody>
    </table>
</template>
