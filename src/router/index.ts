import { createRouter, createWebHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import IndicesView from "@/views/IndicesView.vue"
import NotFoundView from "@/views/NotFoundView.vue"
import { ECONOMIC_INDICES } from "@/config/indices"
import ExchangeRateView from "@/views/ExchangeRateView.vue"

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
                },
            ],
        },
        {
            path: "/exchange/usd-brl",
            name: "exchange-usd-brl",
            component: ExchangeRateView,
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: NotFoundView,
        },
    ],
})

export default router
