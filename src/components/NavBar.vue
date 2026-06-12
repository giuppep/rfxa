<script setup lang="ts">
const navItems = [{ label: "Indices", to: "/indices" }]
</script>

<template>
    <nav
        class="flex flex-wrap items-center justify-start bg-slate-50 gap-4 px-4 sm:px-6 py-2"
    >
        <RouterLink to="/" class="text-lg font-bold">rfxa</RouterLink>
        <ul class="flex gap-4">
            <li v-for="item in navItems" :key="item.label">
                <RouterLink
                    :to="item.to"
                    class="text-slate-500 hover:text-slate-900"
                    active-class="text-orange-500"
                >
                    {{ item.label }}
                </RouterLink>
            </li>
        </ul>
    </nav>
</template>
