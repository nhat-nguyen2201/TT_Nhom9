<!-- SystemStats.vue -->
<template>
  <div class="container-fluid py-4">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">Đang tải dữ liệu thống kê từ hệ thống...</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="errorMsg"
      class="alert alert-danger alert-dismissible fade show"
    >
      {{ errorMsg }}
      <button type="button" class="btn-close" @click="errorMsg = null"></button>
    </div>

    <!-- Nội dung chính - Chỉ giữ các phần có dữ liệu thật -->
    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1 fw-bold">Thống kê hệ thống</h2>
          <p class="text-muted mb-0">
            Cập nhật lần cuối: {{ formatDate(lastUpdated) }}
          </p>
        </div>

        <div class="d-flex gap-3">
          <div class="dropdown">
            <button
              class="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              Thời gian: {{ timeRangeLabel }}
            </button>
            <ul class="dropdown-menu">
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click.prevent="changeTimeRange('24h')"
                  >24 giờ qua</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click.prevent="changeTimeRange('7d')"
                  >7 ngày</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click.prevent="changeTimeRange('30d')"
                  >30 ngày</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click.prevent="changeTimeRange('custom')"
                  >Tùy chỉnh...</a
                >
              </li>
            </ul>
          </div>

          <button class="btn btn-outline-primary" @click="refreshData">
            <i class="bi bi-arrow-repeat me-1"></i>Làm mới
          </button>
        </div>
      </div>

      <!-- Stats Cards (4 thẻ chính - đã có dữ liệu thật) -->
      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-lg-6">
          <StatCard
            title="Người dùng hoạt động"
            :value="stats.activeUsers.toLocaleString('vi-VN')"
            trend="up"
            trend-value="+12%"
            icon="bi bi-people-fill"
            color="primary"
          />
        </div>
        <div class="col-xl-3 col-lg-6">
          <StatCard
            title="Phiên đăng nhập hôm nay"
            :value="stats.sessionsToday.toLocaleString('vi-VN')"
            trend="up"
            trend-value="+18%"
            icon="bi bi-box-arrow-in-right"
            color="success"
          />
        </div>
        <div class="col-xl-3 col-lg-6">
          <StatCard
            title="Tổng đơn hàng"
            :value="stats.totalOrders"
            trend="down"
            trend-value="-3%"
            icon="bi bi-cart-check-fill"
            color="info"
          />
        </div>
        <div class="col-xl-3 col-lg-6">
          <StatCard
            title="Doanh thu hôm nay"
            :value="formatCurrency(stats.todayRevenue)"
            trend="up"
            trend-value="+24%"
            icon="bi bi-currency-dollar"
            color="warning"
          />
        </div>
      </div>

      <!-- Hoạt động gần đây (đã có dữ liệu thật) -->
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white border-0">
          <h5 class="card-title mb-0">Hoạt động gần đây</h5>
        </div>
        <div class="list-group list-group-flush">
          <ActivityItem
            v-for="item in recentActivities"
            :key="item.id"
            :activity="item"
          />
        </div>
        <div
          v-if="recentActivities.length === 0"
          class="card-body text-center text-muted"
        >
          Chưa có hoạt động nào trong khoảng thời gian này.
        </div>
        <div class="card-footer bg-white text-center border-0">
          <button class="btn btn-sm btn-link text-muted">
            Xem thêm hoạt động →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import StatCard from "@/components/admin/StatCard.vue";
import ActivityItem from "@/components/admin/ActivityItem.vue";
import SystemStatusItem from "@/components/admin/SystemStatus.vue"; // Đảm bảo tên file đúng

const stats = ref({
  activeUsers: 0,
  sessionsToday: 0,
  totalOrders: "0",
  todayRevenue: 0,
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0,
});

const recentActivities = ref([]);
const lastUpdated = ref(new Date());
const timeRangeLabel = ref("24 giờ qua");
const loading = ref(true);
const errorMsg = ref(null);

const fetchStats = async () => {
  loading.value = true;
  errorMsg.value = null;

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Vui lòng đăng nhập để xem thống kê");

    const response = await fetch("http://localhost:5000/api/admin/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errData = await response.text(); // Dùng text để đọc lỗi HTML nếu có
      throw new Error(
        errData || `Lỗi ${response.status}: Không thể tải dữ liệu`
      );
    }

    const data = await response.json();

    // Cập nhật dữ liệu từ backend (chỉ map các trường bạn cần)
    stats.value = {
      activeUsers: Number(data.activeUsers) || 0,
      sessionsToday: Number(data.sessionsToday) || 0,
      totalOrders: (Number(data.totalPosts) || 0).toLocaleString("vi-VN"),
      todayRevenue: Number(data.todayRevenue) || 0,
      cpuUsage: Number(data.cpuUsage) || 0,
      memoryUsage: Number(data.memoryUsage) || 0,
      diskUsage: Number(data.diskUsage) || 0,
    };

    recentActivities.value = Array.isArray(data.recentActivities)
      ? data.recentActivities
      : [];

    lastUpdated.value = new Date();
  } catch (err) {
    errorMsg.value = err.message;
    console.error("Lỗi fetch stats:", err);
  } finally {
    loading.value = false;
  }
};

// Tự động load khi vào trang
onMounted(fetchStats);

// Làm mới
const refreshData = () => fetchStats();

// Chọn thời gian (chưa kết nối API, chỉ label)
const changeTimeRange = (range) => {
  timeRangeLabel.value =
    {
      "24h": "24 giờ qua",
      "7d": "7 ngày",
      "30d": "30 ngày",
      custom: "Tùy chỉnh",
    }[range] || "24 giờ qua";
};

// Trạng thái CPU/Memory/Disk
const getStatus = (value) => {
  if (value > 85) return "danger";
  if (value > 70) return "warning";
  return "success";
};

// Format tiền tệ
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
};

// Format ngày giờ
const formatDate = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
</script>

<style scoped>
.chart-container {
  position: relative;
}
.placeholder-chart {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}
</style>
