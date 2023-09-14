<script setup lang="ts">
import { IndexValue } from "@/models/finance"

defineProps<{ indexValues: IndexValue[] }>()
</script>

<template>
    <table>
        <thead>
            <th>Date</th>
            <th>Value</th>
        </thead>
        <tbody>
            <tr v-for="entry in indexValues">
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
            </tr>
        </tbody>
    </table>
</template>
