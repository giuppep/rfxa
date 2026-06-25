import type { RouteLocationNormalizedLoaded } from "vue-router"
import type { IndexId } from "@/config/indices"

const SITE_URL = "https://rfxa.giuppep.dev"
const DEFAULT_TITLE = "rfxa - CDI, SELIC, IPCA, IGP-M e USD/BRL"
const DEFAULT_DESCRIPTION =
    "Acompanhe CDI, SELIC, IPCA, IGP-M e a cotação oficial USD/BRL com dados do Banco Central do Brasil."

// Route-specific copy for pages that share the same Vue view but should have
// distinct search snippets and browser titles.
const INDEX_SEO: Record<IndexId, { title: string; description: string }> = {
    cdi: {
        title: "CDI hoje e histórico - rfxa",
        description:
            "Consulte CDI mensal, acumulado em 12 meses e rendimento acumulado com dados do Banco Central do Brasil.",
    },
    selic: {
        title: "SELIC hoje e histórico - rfxa",
        description:
            "Acompanhe SELIC mensal, acumulada em 12 meses e rendimento acumulado com dados do Banco Central do Brasil.",
    },
    ipca: {
        title: "IPCA acumulado e histórico - rfxa",
        description:
            "Consulte IPCA mensal, acumulado em 12 meses e inflação acumulada com dados oficiais do Banco Central do Brasil.",
    },
    igpm: {
        title: "IGP-M acumulado e histórico - rfxa",
        description:
            "Acompanhe IGP-M mensal, acumulado em 12 meses e variação acumulada com dados do Banco Central do Brasil.",
    },
}

// Vue renders this app client-side, so route changes do not reload index.html.
// These helpers keep the document head in sync as the user navigates.
function upsertMeta(selector: string, attrs: Record<string, string>) {
    let element = document.head.querySelector<HTMLMetaElement>(selector)

    if (!element) {
        element = document.createElement("meta")
        document.head.appendChild(element)
    }

    for (const [key, value] of Object.entries(attrs)) {
        element.setAttribute(key, value)
    }
}

function upsertCanonical(href: string) {
    let element = document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]'
    )

    if (!element) {
        element = document.createElement("link")
        element.rel = "canonical"
        document.head.appendChild(element)
    }

    element.href = href
}

function setPageSeo({
    title,
    description,
    path,
    noindex = false,
}: {
    title: string
    description: string
    path: string
    noindex?: boolean
}) {
    const canonicalUrl = new URL(path, SITE_URL).toString()

    // Keep standard search metadata and social preview metadata aligned.
    document.title = title
    upsertMeta('meta[name="description"]', {
        name: "description",
        content: description,
    })
    upsertMeta('meta[property="og:title"]', {
        property: "og:title",
        content: title,
    })
    upsertMeta('meta[property="og:description"]', {
        property: "og:description",
        content: description,
    })
    upsertMeta('meta[property="og:url"]', {
        property: "og:url",
        content: canonicalUrl,
    })

    // The 404 route is useful to users, but should not be indexed as content.
    if (noindex) {
        upsertMeta('meta[name="robots"]', {
            name: "robots",
            content: "noindex",
        })
    } else {
        document.head.querySelector('meta[name="robots"]')?.remove()
    }

    upsertCanonical(canonicalUrl)
}

// Apply SEO metadata after each route is resolved. The static index.html
// metadata is the fallback for crawlers and link previews before JS runs.
export function setRouteSeo(to: RouteLocationNormalizedLoaded) {
    if (to.name === "indices") {
        const indexId = to.params.type

        if (typeof indexId === "string" && indexId in INDEX_SEO) {
            setPageSeo({
                ...INDEX_SEO[indexId as IndexId],
                path: to.path,
            })
        }

        return
    }

    if (to.name === "exchange-usd-brl") {
        setPageSeo({
            title: "Cotação USD/BRL PTAX - rfxa",
            description:
                "Consulte a cotação oficial USD/BRL PTAX de compra e venda publicada pelo Banco Central do Brasil.",
            path: to.path,
        })

        return
    }

    if (to.name === "not-found") {
        setPageSeo({
            title: "Página não encontrada - rfxa",
            description: DEFAULT_DESCRIPTION,
            path: to.path,
            noindex: true,
        })

        return
    }

    setPageSeo({
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        path: to.path,
    })
}
