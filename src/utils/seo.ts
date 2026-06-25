import type { RouteLocationNormalizedLoaded } from "vue-router"

export const DEFAULT_TITLE = "rfxa - CDI, SELIC, IPCA, IGP-M e USD/BRL"
export const DEFAULT_DESCRIPTION =
    "Acompanhe CDI, SELIC, IPCA, IGP-M e a cotação oficial USD/BRL com dados do Banco Central do Brasil."

export interface RouteSeo {
    title: string
    description: string
    noindex?: boolean
}

// Augments vue-router's RouteMeta so routes can type-check a per-route
// `meta.seo` function (see src/router/index.ts), read by setRouteSeo below.
declare module "vue-router" {
    interface RouteMeta {
        seo?: (to: RouteLocationNormalizedLoaded) => RouteSeo | undefined
    }
}

const SITE_URL = "https://rfxa.giuppep.dev"

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
// Routes opt in to custom copy via their `meta.seo` function; routes without
// one (e.g. the home page) get the site-wide defaults.
export function setRouteSeo(to: RouteLocationNormalizedLoaded) {
    const seo = to.meta.seo?.(to)

    setPageSeo({
        title: seo?.title ?? DEFAULT_TITLE,
        description: seo?.description ?? DEFAULT_DESCRIPTION,
        path: to.path,
        noindex: seo?.noindex,
    })
}
