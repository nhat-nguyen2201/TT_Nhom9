<template>
  <div class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<style scoped>
/* Đảm bảo trang không bị scroll ngang trên mobile */
* {
  box-sizing: border-box;
}
</style>
