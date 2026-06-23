<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { i18n } from "@/i18n"
import { PhGithubLogo, PhList, PhX } from "@phosphor-icons/vue"
import ToggleSwitch from "@/components/ToggleSwitch.vue"

const { t, locale } = useI18n()
const menuOpen = ref(false)
const navLinks = [
    { to: { name: "indices-root" }, labelKey: "nav.indices" },
    { to: { name: "exchange-usd-brl" }, labelKey: "nav.exchange" },
    { to: { name: "calculator" }, labelKey: "nav.calculator" },
]

const availableLocales = i18n.global.availableLocales
const localeOptions = computed(() =>
    availableLocales.map((code) => ({
        value: code,
        label: code.split("-")[0].toUpperCase(),
    }))
)

const setLocale = (code: string) => {
    locale.value = code
    localStorage.setItem("locale", code)
}
</script>

<template>
    <nav
        class="flex flex-wrap items-center justify-start bg-olive-200 gap-3 sm:gap-4 px-4 sm:px-6 py-1 m-1 rounded-lg top-1 ring-4 ring-olive-50 sticky z-10"
    >
        <RouterLink to="/" class="text-lg font-bold">rfxa</RouterLink>
        <ul class="hidden gap-4 sm:flex">
            <li v-for="link in navLinks" :key="link.labelKey">
                <RouterLink
                    :to="link.to"
                    class="text-olive-700 hover:text-olive-100 hover:bg-olive-400 px-2 py-0.5 rounded-md"
                    active-class="bg-olive-500 text-olive-50!"
                >
                    {{ t(link.labelKey) }}
                </RouterLink>
            </li>
        </ul>

        <ToggleSwitch
            :model-value="locale"
            :options="localeOptions"
            size="sm"
            class="ml-auto bg-olive-300"
            @update:model-value="setLocale"
        />
        <a href="https://github.com/giuppep/rfxa" target="_blank">
            <PhGithubLogo
                weight="fill"
                size="18px"
                class="hover:text-olive-500 text-olive-600"
            />
        </a>
        <button
            type="button"
            class="rounded-md p-1 text-olive-700 hover:bg-olive-300 sm:hidden"
            :aria-label="t('nav.menu')"
            aria-controls="mobile-nav"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
        >
            <PhX v-if="menuOpen" size="20px" />
            <PhList v-else size="20px" />
        </button>

        <div
            v-if="menuOpen"
            id="mobile-nav"
            class="basis-full border-t border-olive-300 pt-2 sm:hidden"
        >
            <ul class="flex flex-col gap-1">
                <li v-for="link in navLinks" :key="link.labelKey">
                    <RouterLink
                        :to="link.to"
                        class="block rounded-md px-2 py-1 text-olive-700 hover:bg-olive-400 hover:text-olive-100"
                        active-class="bg-olive-500 text-olive-50!"
                        @click="menuOpen = false"
                    >
                        {{ t(link.labelKey) }}
                    </RouterLink>
                </li>
            </ul>
        </div>
    </nav>
</template>
