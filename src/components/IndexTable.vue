<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { CumulativeIndexValue } from "@/models/finance"

defineProps<{ monthlyIndexValues: CumulativeIndexValue[] }>()

const { t, locale } = useI18n()
</script>

<template>
    <div class="max-h-96 overflow-y-auto">
        <table>
            <thead class="sticky top-0 bg-olive-50">
                <tr>
                    <th class="text-left">{{ t("indices.table.date") }}</th>
                    <th class="text-right">{{ t("indices.table.mom") }}</th>
                    <th class="text-right">{{ t("indices.table.yoy") }}</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="entry in monthlyIndexValues"
                    :key="entry.date.toISOString()"
                >
                    <td class="capitalize">
                        {{
                            Intl.DateTimeFormat(locale, {
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
    </div>
</template>
