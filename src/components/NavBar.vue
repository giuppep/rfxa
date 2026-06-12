<script setup lang="ts">
const navItems = [{ label: "indices", to: "/indices" }]
</script>

<template>
    <nav
        class="flex flex-wrap items-center justify-start bg-olive-200 gap-4 px-4 sm:px-6 py-2 m-1 rounded-lg"
    >
        <RouterLink to="/" class="text-lg font-bold">rfxa</RouterLink>
        <ul class="flex gap-4">
            <li v-for="item in navItems" :key="item.label">
                <RouterLink
                    :to="item.to"
                    class="text-olive-600 hover:text-olive-900"
                    active-class="text-olive-500"
                >
                    {{ item.label }}
                </RouterLink>
            </li>
        </ul>
    </nav>
</template>
