import { createRouter, createWebHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import IndicesView from "@/views/IndicesView.vue"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: "/", name: "home", component: HomeView },
        {
            path: "/indices",
            redirect: "/indices/cdi",
            children: [
                {
                    path: "/indices/:type",
                    name: "indices",
                    component: IndicesView,
                    props: true,
                },
            ],
        },
    ],
})

export default router
