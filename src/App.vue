<script setup lang="ts">
import NavBar from "./components/NavBar.vue"
</script>

<template>
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto]">
        <NavBar />

        <main class="px-4 py-2 md:px-8">
            <router-view />
        </main>

        <footer
            class="flex justify-end bg-olive-100 px-4 py-1 text-xs font-medium text-olive-500"
        >
            <span>
                © 2026
                <a
                    href="https://giuppep.dev"
                    class="font-semibold hover:text-olive-800"
                    >giuppep.dev</a
                >
            </span>
        </footer>
    </div>
</template>
