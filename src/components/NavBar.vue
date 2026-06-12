<script setup lang="ts">
const navItems = [{ label: "Indices", to: "/indices" }]
</script>

<template>
    <nav class="flex flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
        <router-link to="/" class="text-lg font-bold">rfxa</router-link>
        <ul class="flex gap-4">
            <li v-for="item in navItems" :key="item.label">
                <router-link :to="item.to">{{ item.label }}</router-link>
            </li>
        </ul>
    </nav>
</template>
