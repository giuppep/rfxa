<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { ECONOMIC_INDICES, IndexId } from "@/config/indices"

type IndexSelection = IndexId | "fixed"

const props = defineProps<{
    modelValue: IndexSelection
    showFixed?: boolean
}>()

const emit = defineEmits<{
    "update:modelValue": [value: IndexSelection]
}>()

const { t } = useI18n()
</script>

<template>
    <div class="flex flex-wrap gap-1.5">
        <button
            v-for="index in ECONOMIC_INDICES"
            :key="index.id"
            type="button"
            class="rounded-md px-2 py-0.5 text-sm"
            :class="
                props.modelValue === index.id
                    ? 'bg-olive-500 text-olive-50'
                    : 'bg-olive-200 text-olive-700 hover:bg-olive-400 hover:text-olive-50'
            "
            @click="emit('update:modelValue', index.id)"
        >
            {{ index.label }}
        </button>
        <button
            v-if="showFixed"
            type="button"
            class="rounded-md px-2 py-0.5 text-sm"
            :class="
                props.modelValue === 'fixed'
                    ? 'bg-olive-500 text-olive-50'
                    : 'bg-olive-200 text-olive-700 hover:bg-olive-400 hover:text-olive-50'
            "
            @click="emit('update:modelValue', 'fixed')"
        >
            {{ t("calculator.fixedRate") }}
        </button>
    </div>
</template>
