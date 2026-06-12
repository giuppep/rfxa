<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{ modelValue: Date; label: string }>()
const emit = defineEmits<{ "update:modelValue": [value: Date] }>()

/** Formats a Date as a YYYY-MM-DD string for use with <input type="date">. */
const formatDateInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

/** Parses a YYYY-MM-DD string from <input type="date"> back into a Date. */
const parseDateInput = (value: string) => new Date(`${value}T00:00:00-03:00`)

const value = computed({
    get: () => formatDateInput(props.modelValue),
    set: (value: string) => emit("update:modelValue", parseDateInput(value)),
})
</script>

<template>
    <label class="flex flex-col items-start gap-0.5">
        <span class="text-sm font-medium text-olive-700"> {{ label }}: </span>
        <input
            v-model="value"
            type="date"
            class="border rounded-md px-2 py-0.5"
        />
    </label>
</template>
