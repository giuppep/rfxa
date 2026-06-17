<script setup lang="ts">
import NavBar from "./components/NavBar.vue"
</script>

<template>
    <NavBar class="" />
    <div class="overflow-x-clip">
        <router-view class="px-4 md:px-8" />
    </div>
</template>
