<script setup lang="ts" generic="T extends string">
withDefaults(
    defineProps<{
        modelValue: T
        options: { value: T; label: string }[]
        size?: "sm" | "md"
    }>(),
    { size: "md" }
)

const emit = defineEmits<{
    "update:modelValue": [value: T]
}>()
</script>

<template>
    <div
        class="inline-flex rounded-full bg-olive-200 font-medium"
        :class="size === 'sm' ? 'p-0.5 text-xs' : 'p-1 text-sm'"
    >
        <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="rounded-full transition-colors cursor-pointer"
            :class="[
                size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1',
                modelValue === option.value
                    ? 'bg-olive-500 text-olive-50'
                    : 'text-olive-700 hover:bg-olive-300',
            ]"
            @click="emit('update:modelValue', option.value)"
        >
            {{ option.label }}
        </button>
    </div>
</template>
