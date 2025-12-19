<template>
  <div class="min-h-screen bg-gray-50">
    <TheHeader
      v-if="
        route.name !== 'Login' &&
        route.name !== 'Register' &&
        route.name !== 'CreatePost'
      "
    />
    <router-view />
    <TheFooter
      v-if="
        route.name !== 'Login' &&
        route.name !== 'Register' &&
        route.name !== 'CreatePost'
      "
    />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import TheHeader from "@/components/layout/TheHeader.vue";
import TheFooter from "@/components/layout/TheFooter.vue";
const route = useRoute();
</script>

<style scoped>
/* Đảm bảo trang không bị scroll ngang trên mobile */
* {
  box-sizing: border-box;
  background-color: #f3fff3;
}
</style>
