<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { ECONOMIC_INDICES } from "@/config/indices"

const { t } = useI18n()
</script>

<template>
    <div class="py-8">
        <h1>rfxa</h1>
        <p class="mt-2 max-w-2xl text-olive-700">
            {{ t("home.tagline") }}
        </p>
        <div class="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <RouterLink
                v-for="index in ECONOMIC_INDICES"
                :key="index.id"
                :to="{ name: 'indices', params: { type: index.id } }"
                class="rounded-lg bg-olive-100 p-4 shadow-xs hover:bg-olive-200"
            >
                <div class="text-lg font-semibold text-olive-800">
                    {{ index.label }}
                </div>
                <div class="mt-1 text-sm text-olive-600">
                    {{ t(`index.${index.id}.description`) }}
                </div>
            </RouterLink>
        </div>
    </div>
</template>
