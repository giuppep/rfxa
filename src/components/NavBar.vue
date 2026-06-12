<script setup lang="ts">
const navItems = [{ label: "indices", to: { name: "indices-root" } }]
</script>

<template>
    <nav
        class="flex flex-wrap items-center justify-start bg-olive-200 gap-4 px-4 sm:px-6 py-1 m-1 rounded-lg"
    >
        <RouterLink to="/" class="text-lg font-bold">rfxa</RouterLink>
        <ul class="flex gap-4">
            <li v-for="item in navItems" :key="item.label">
                <RouterLink
                    :to="item.to"
                    class="text-olive-700 hover:text-olive-100 hover:bg-olive-400 px-2 py-0.5 rounded-md"
                    active-class="bg-olive-500 text-olive-50!"
                >
                    {{ item.label }}
                </RouterLink>
            </li>
        </ul>
    </nav>
</template>
