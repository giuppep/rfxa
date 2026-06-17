<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { i18n } from "@/i18n"

const { t, locale } = useI18n()

const availableLocales = i18n.global.availableLocales

const setLocale = (code: string) => {
    locale.value = code
    localStorage.setItem("locale", code)
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
        <div
            class="ml-auto flex items-center rounded-full bg-olive-300 p-0.5 text-xs font-medium"
        >
            <button
                v-for="code in availableLocales"
                :key="code"
                class="rounded-full px-2 py-0.5 transition-colors cursor-pointer"
                :class="
                    locale === code
                        ? 'bg-olive-500 text-olive-50'
                        : 'text-olive-600'
                "
                @click="setLocale(code)"
            >
                {{ code.split("-")[0].toUpperCase() }}
            </button>
        </div>
    </nav>
</template>
