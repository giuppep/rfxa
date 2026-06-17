<script setup lang="ts">
import { useI18n } from "vue-i18n"
import type { Locale } from "@/i18n"

const { t, locale } = useI18n()

const toggleLocale = () => {
    locale.value = locale.value === "en-GB" ? "pt-BR" : "en-GB"
    localStorage.setItem("locale", locale.value)
}
</script>

<template>
    <nav
        class="flex flex-wrap items-center justify-start bg-olive-200 gap-4 px-4 sm:px-6 py-1 m-1 rounded-lg top-1 ring-4 ring-olive-50 sticky z-10"
    >
        <RouterLink to="/" class="text-lg font-bold">rfxa</RouterLink>
        <ul class="flex gap-4">
            <li>
                <RouterLink
                    :to="{ name: 'indices-root' }"
                    class="text-olive-700 hover:text-olive-100 hover:bg-olive-400 px-2 py-0.5 rounded-md"
                    active-class="bg-olive-500 text-olive-50!"
                >
                    {{ t("nav.indices") }}
                </RouterLink>
            </li>
        </ul>
        <button
            class="ml-auto text-sm font-medium text-olive-600 hover:text-olive-900 px-2 py-0.5 rounded-md hover:bg-olive-300"
            @click="toggleLocale"
        >
            {{ (locale as Locale) === "en-GB" ? "PT" : "EN" }}
        </button>
    </nav>
</template>
