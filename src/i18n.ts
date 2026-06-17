import { createI18n } from "vue-i18n"
import enGB from "@/locales/en-GB"
import ptBR from "@/locales/pt-BR"

export type Locale = "en-GB" | "pt-BR"

const savedLocale = localStorage.getItem("locale") as Locale | null
const browserLocale: Locale = navigator.language.startsWith("pt")
    ? "pt-BR"
    : "en-GB"

export const i18n = createI18n({
    legacy: false,
    locale: savedLocale ?? browserLocale,
    fallbackLocale: "en-GB",
    messages: {
        "en-GB": enGB,
        "pt-BR": ptBR,
    },
})
