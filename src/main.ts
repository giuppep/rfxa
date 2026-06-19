import { createApp } from "vue"
import "./styles/main.css"
import App from "./App.vue"
import router from "./router"
import { i18n } from "./i18n"
import { tooltip } from "./directives/tooltip"

createApp(App).use(router).use(i18n).directive("tooltip", tooltip).mount("#app")
