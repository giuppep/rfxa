import { createRouter, createWebHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import IndicesView from "@/views/IndicesView.vue"
import NotFoundView from "@/views/NotFoundView.vue"
import { ECONOMIC_INDICES } from "@/config/indices"
import ExchangeRateView from "@/views/ExchangeRateView.vue"
import { DEFAULT_DESCRIPTION, setRouteSeo } from "@/utils/seo"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: "/", name: "home", component: HomeView },
        {
            path: "/indices",
            name: "indices-root",
            redirect: "/indices/cdi",
            children: [
                {
                    path: `/indices/:type(${ECONOMIC_INDICES.map((index) => index.id).join("|")})`,
                    name: "indices",
                    component: IndicesView,
                    props: true,
                    // meta.seo is consumed by setRouteSeo (router.afterEach
                    // below) to set the page title/description; see the
                    // RouteMeta augmentation in @/utils/seo.
                    meta: {
                        seo: (to) => {
                            const index = ECONOMIC_INDICES.find(
                                (index) => index.id === to.params.type
                            )

                            return (
                                index && {
                                    title: index.seoTitle,
                                    description: index.seoDescription,
                                }
                            )
                        },
                    },
                },
            ],
        },
        {
            path: "/exchange/usd-brl",
            name: "exchange-usd-brl",
            component: ExchangeRateView,
            meta: {
                seo: () => ({
                    title: "Cotação USD/BRL PTAX - rfxa",
                    description:
                        "Consulte a cotação oficial USD/BRL PTAX de compra e venda publicada pelo Banco Central do Brasil.",
                }),
            },
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: NotFoundView,
            meta: {
                seo: () => ({
                    title: "Página não encontrada - rfxa",
                    description: DEFAULT_DESCRIPTION,
                    noindex: true,
                }),
            },
        },
    ],
})

router.afterEach(setRouteSeo)

export default router
