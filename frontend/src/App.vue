<template>
  <div class="min-h-screen bg-gray-50">
    <TheHeader v-if="showLayout" :key="$route.fullPath" />

    <router-view />

    <TheFooter v-if="showLayout" />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import TheHeader from "@/components/layout/TheHeader.vue";
import TheFooter from "@/components/layout/TheFooter.vue";

const route = useRoute();

const showLayout = computed(() => {
  // Ẩn cho admin
  if (route.meta.requiresAdmin) return false;

  // Ẩn cho auth & create post
  const hiddenRoutes = ["Login", "Register", "CreatePost"];
  return !hiddenRoutes.includes(route.name);
});
</script>

<style scoped>
/* Đảm bảo trang không bị scroll ngang trên mobile */
* {
  box-sizing: border-box;
  background-color: #f3fff3;
}
</style>
