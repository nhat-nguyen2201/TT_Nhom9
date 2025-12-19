<template>
  <section class="py-5 px-5">
    <div class="container">
      <!-- Tiêu đề + Tab lọc -->
      <div
        class="d-flex flex-column flex-lg-row justify-content-between align-items-center mb-5"
      >
        <h2 class="fw-bold fs-3 mb-3 mb-lg-0">Gợi ý cho bạn</h2>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="filteredRooms.length === 0"
        class="text-center py-5 text-muted"
      >
        <p class="fs-4">Chưa có tin đăng nào phù hợp.</p>
        <p>Hãy thử loại phòng khác hoặc quay lại sau nhé!</p>
      </div>

      <!-- Danh sách card -->
      <div v-else class="row g-4">
        <div
          class="col-md-6 col-lg-4"
          v-for="room in filteredRooms"
          :key="room.id"
        >
          <div
            class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 hover-shadow transition"
          >
            <!-- Ảnh + Badge loại phòng -->
            <div class="position-relative">
              <!-- Ảnh với fallback an toàn -->
              <img
                :src="
                  room.image ||
                  'https://via.placeholder.com/400x300.png?text=Chưa+có+ảnh'
                "
                class="card-img-top"
                alt="Ảnh phòng"
                style="height: 220px; object-fit: cover"
                @error="
                  room.image =
                    'https://via.placeholder.com/400x300.png?text=Ảnh+lỗi'
                "
              />

              <!-- Badge loại phòng -->
              <span
                class="position-absolute bottom-0 start-0 m-3 badge rounded-pill text-white px-3 py-2 fw-bold"
                :class="{
                  'bg-primary': room.type === 'Basic Plan',
                  'bg-purple': room.type === 'Premium',
                  'bg-danger': room.type === 'VIP',
                }"
              >
                <i class="bi bi-tag-fill me-1"></i> {{ room.type }}
              </span>
            </div>

            <!-- Nội dung card -->
            <div class="card-body d-flex flex-column p-4">
              <h5 class="card-title fw-bold mb-2">{{ room.title }}</h5>

              <p class="text-muted small mb-3 flex-grow-1 line-clamp-3">
                {{ truncatedDescription(room.description) }}
              </p>

              <p class="text-muted small mb-2">
                <i class="bi bi-geo-alt-fill text-danger me-1"></i>
                {{ room.address }}
              </p>

              <p class="small mb-3" v-if="room.contact_phone_masked">
                <i class="bi bi-telephone-fill text-success me-1"></i>
                <strong>{{ room.contact_phone_masked }}</strong>
              </p>

              <div class="mt-auto">
                <p class="h4 fw-bold text-primary mb-3">
                  {{ room.price }}/tháng
                </p>

                <router-link
                  :to="{ name: 'RoomDetail', params: { id: room.id } }"
                  class="btn btn-dark w-100 rounded-pill fw-semibold py-2"
                >
                  Xem Chi Tiết
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const rooms = ref([]);
const filterType = ref("");
const loading = ref(true);
const error = ref(null);

const fetchRooms = async () => {
  try {
    loading.value = true;
    error.value = null;

    const url = filterType.value
      ? `http://localhost:5000/api/posts/suggested?type=${filterType.value}`
      : "http://localhost:5000/api/posts/suggested";

    const response = await fetch(url);
    if (!response.ok) {
      console.error("HTTP Error:", response.status, response.statusText);
      throw new Error(`Lỗi mạng: ${response.status}`);
    }

    const data = await response.json();
    rooms.value = data;
  } catch (err) {
    error.value = "Không tải được dữ liệu. Kiểm tra console và server.";
    console.error("Lỗi fetch rooms:", err);
  } finally {
    loading.value = false;
  }
};

// Khi thay đổi tab → fetch lại
watch(filterType, () => {
  fetchRooms();
});

// Load lần đầu
onMounted(() => {
  fetchRooms();
});

const filteredRooms = rooms;

// Rút gọn mô tả
const truncatedDescription = (desc) => {
  if (!desc) return "";
  const max = 120;
  return desc.length > max ? desc.substring(0, max).trim() + "..." : desc;
};

// Che số điện thoại (dự phòng, backend đã che sẵn)
const maskedPhone = (phone) => {
  if (!phone || phone.length < 4) return phone;
  return phone.slice(0, -3) + "***";
};
</script>

<style scoped>
.hover-shadow:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
  transition: all 0.3s ease;
}

.card {
  transition: all 0.3s ease;
}

.btn-group .btn.active {
  background-color: #0d6efd;
  color: white;
}
.container {
  background-color: #f3fff3;
}
/* Bo góc lớn hơn như hình */
.rounded-4 {
  border-radius: 1.5rem !important;
}
</style>
