<template>
  <section class="py-5 px-5">
    <div class="container">
      <!-- Tiêu đề + Tab lọc -->
      <div
        class="d-flex flex-column flex-lg-row justify-content-between align-items-center mb-5"
      >
        <h2 class="fw-bold fs-3 mb-3 mb-lg-0">Gợi ý cho bạn</h2>

        <div class="btn-group rounded-pill shadow-sm gap-3" role="group">
          <button
            type="button"
            class="btn btn-outline-secondary rounded-pill px-4 active"
          >
            <i class="bi bi-bed"></i> Phòng trọ
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary rounded-pill px-4"
          >
            <i class="bi bi-building"></i> Chung cư
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary rounded-pill px-4"
          >
            <i class="bi bi-house-door"></i> Nhà nguyên căn
          </button>
        </div>
      </div>

      <!-- Danh sách card -->
      <div class="row g-4">
        <!-- Card 1 -->
        <div class="col-md-6 col-lg-4" v-for="room in rooms" :key="room.id">
          <div
            class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 hover-shadow"
          >
            <div class="position-relative">
              <img
                :src="room.image"
                class="card-img-top"
                alt="Phòng trọ"
                style="height: 220px; object-fit: cover"
              />

              <!-- Badge loại phòng -->
              <span
                class="position-absolute bottom-0 start-0 m-3 badge rounded-pill bg-primary text-white px-3 py-2"
              >
                <i class="bi bi-tag-fill"></i> {{ room.type }}
              </span>
            </div>

            <div class="card-body d-flex flex-column p-4">
              <h5 class="card-title fw-bold mb-1">{{ room.title }}</h5>
              <p class="text-muted small mb-2">
                <i class="bi bi-geo-alt-fill text-danger"></i>
                {{ room.address }}
              </p>

              <div class="d-flex align-items-center mb-3">
                <span class="text-warning fs-5 me-2">
                  <i class="bi bi-star-fill"></i> {{ room.rating }}
                </span>
                <span class="text-muted small"
                  >({{ room.reviews }} đánh giá)</span
                >
              </div>

              <div class="mt-auto">
                <p class="h4 fw-bold text-primary mb-3">
                  {{ room.price }}/tháng
                </p>

                <a
                  href="#"
                  class="btn btn-dark w-100 rounded-pill fw-semibold py-2 px-2"
                >
                  Xem Chi Tiết
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

// Dữ liệu mẫu (sau này sẽ lấy từ backend)
const rooms = ref([
  {
    id: 1,
    title: "Phòng trọ đầy đủ nội thất",
    address: "Quận 7, TP Hồ Chí Minh",
    rating: 4.8,
    reviews: 128,
    price: "3.5 triệu",
    type: "Basic Plan",
    image: "../images/room1.jpg",
  },
  {
    id: 2,
    title: "Chung cư mini cao cấp",
    address: "Bình Thạnh, TP Hồ Chí Minh",
    rating: 4.9,
    reviews: 89,
    price: "5.2 triệu",
    type: "Premium",
    image: "../images/room2.jpg",
  },
  {
    id: 3,
    title: "Nhà nguyên căn thoáng mát",
    address: "Gò Vấp, TP Hồ Chí Minh",
    rating: 5.0,
    reviews: 203,
    price: "12 triệu",
    type: "VIP",
    image: "../images/room3.jpg",
  },
  // Thêm bao nhiêu cũng được...
]);
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

/* Bo góc lớn hơn như hình */
.rounded-4 {
  border-radius: 1.5rem !important;
}
</style>
