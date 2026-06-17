<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()
</script>

<template>
    <div class="p-4">
        <h2>{{ t("calculator.pageTitle") }}</h2>
    </div>
</template>
