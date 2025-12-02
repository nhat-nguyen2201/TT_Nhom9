<!-- src/views/admin/Dashboard.vue -->
<template>
  <div class="row g-4">
    <div class="col-md-3">
      <div class="card bg-primary text-white">
        <div
          class="card-body d-flex justify-content-between align-items-center"
        >
          <div>
            <h4 class="mb-0">{{ stats.totalUsers }}</h4>
            <p class="mb-0">Tổng người dùng</p>
          </div>
          <i class="bi bi-people-fill fs-1 opacity-75"></i>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card bg-success text-white">
        <div
          class="card-body d-flex justify-content-between align-items-center"
        >
          <div>
            <h4 class="mb-0">{{ stats.totalPosts }}</h4>
            <p class="mb-0">Tổng tin đăng</p>
          </div>
          <i class="bi bi-card-list fs-1 opacity-75"></i>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card bg-warning text-white">
        <div
          class="card-body d-flex justify-content-between align-items-center"
        >
          <div>
            <h4 class="mb-0">{{ stats.pendingPosts }}</h4>
            <p class="mb-0">Tin chờ duyệt</p>
          </div>
          <i class="bi bi-clock-history fs-1 opacity-75"></i>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card bg-danger text-white">
        <div
          class="card-body d-flex justify-content-between align-items-center"
        >
          <div>
            <h4 class="mb-0">{{ stats.reportedPosts }}</h4>
            <p class="mb-0">Tin bị báo cáo</p>
          </div>
          <i class="bi bi-flag-fill fs-1 opacity-75"></i>
        </div>
      </div>
    </div>

    <div class="col-12 mt-5">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Hoạt động gần đây</h5>
        </div>
        <div class="card-body">
          <p class="text-center text-muted">
            Sắp có bảng hoạt động chi tiết...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const stats = ref({
  totalUsers: 0,
  totalPosts: 0,
  pendingPosts: 0,
  reportedPosts: 0,
});

onMounted(async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/admin/stats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    stats.value = res.data;
  } catch (err) {
    stats.value = {
      totalUsers: 3,
      totalPosts: 89,
      pendingPosts: 12,
      reportedPosts: 5,
    };
  }
});
</script>
