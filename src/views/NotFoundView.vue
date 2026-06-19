<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()
</script>

<template>
    <div class="py-16 text-center">
        <h1 class="text-5xl font-bold text-olive-800">404</h1>
        <p class="mt-2 text-olive-700">
            {{ t("notFound.message") }}
        </p>
        <RouterLink
            to="/"
            class="mt-6 inline-block rounded-lg bg-olive-200 px-4 py-2 font-medium text-olive-800 hover:bg-olive-300"
        >
            {{ t("notFound.backHome") }}
        </RouterLink>
    </div>
</template>
