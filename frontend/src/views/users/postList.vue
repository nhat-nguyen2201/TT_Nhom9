<template>
  <div class="container py-5 bg-light-subtle">
    <div class="bg-white rounded-4 shadow-sm p-4 mb-5">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label text-muted small fw-bold mb-1">Vị trí</label>
          <select
            class="form-select form-select-lg rounded-pill border-light bg-light shadow-sm fs-6"
            v-model="filters.city"
            @change="fetchPosts"
          >
            <option value="">Tất cả thành phố</option>
            <option
              v-for="city in filterOptions.cities"
              :key="city"
              :value="city"
            >
              {{ city }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label text-muted small fw-bold mb-1"
            >Loại phòng</label
          >
          <select
            class="form-select form-select-lg rounded-pill border-light bg-light shadow-sm fs-6"
            v-model="filters.room_type"
            @change="fetchPosts"
          >
            <option value="">Tất cả loại phòng</option>
            <option
              v-for="type in filterOptions.room_types"
              :key="type"
              :value="type"
            >
              {{ formatRoomType(type) }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label text-muted small fw-bold mb-1"
            >Mức giá</label
          >
          <select
            class="form-select form-select-lg rounded-pill border-light bg-light shadow-sm fs-6"
            v-model="selectedPriceRange"
            @change="applyPriceRange"
          >
            <option value="">Tất cả mức giá</option>
            <option value="0-2000000">Dưới 2 triệu</option>
            <option value="2000000-3000000">2 - 3 triệu</option>
            <option value="3000000-5000000">3 - 5 triệu</option>
            <option value="5000000-999999999">Trên 5 triệu</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div
        class="spinner-border text-primary"
        role="status"
        style="width: 3rem; height: 3rem"
      >
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-3 text-muted">Đang tìm kiếm phòng tốt nhất cho bạn...</p>
    </div>

    <div v-else-if="posts.length === 0" class="text-center py-5">
      <div class="mb-3">
        <i class="bi bi-search fs-1 text-muted opacity-50"></i>
      </div>
      <h4 class="fw-bold text-secondary">Chưa có tin nào phù hợp</h4>
      <p class="text-muted">Hãy thử thay đổi bộ lọc hoặc quay lại sau nhé!</p>
    </div>

    <div v-else class="row g-4">
      <div class="col-md-6 col-lg-4" v-for="post in posts" :key="post.post_id">
        <div
          class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 hover-shadow transition"
        >
          <div class="position-relative">
            <img
              :src="
                post.images?.[0] ||
                'https://via.placeholder.com/400x300.png?text=No+Image'
              "
              class="card-img-top"
              alt="Ảnh phòng"
              style="height: 220px; object-fit: cover"
              @error="handleImageError"
            />

            <span
              class="position-absolute bottom-0 start-0 m-3 badge rounded-pill px-3 py-2 fw-bold shadow-sm"
              :class="getBadgeClass(post.room_type)"
            >
              <i class="bi bi-tag-fill me-1"></i>
              {{ formatRoomType(post.room_type) }}
            </span>
          </div>

          <div class="card-body d-flex flex-column p-4">
            <h5
              class="card-title fw-bold mb-2 text-truncate-2"
              :title="post.title"
            >
              {{ post.title }}
            </h5>

            <p class="text-muted small mb-3">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i>
              {{ post.ward }}, {{ post.district }}, {{ post.city }}
            </p>

            <div class="d-flex align-items-center small text-secondary mb-3">
              <span class="me-3"
                ><i class="bi bi-rulers me-1"></i>{{ post.area }} m²</span
              >
              <span
                ><i class="bi bi-eye-fill me-1"></i>{{ post.view_count }} lượt
                xem</span
              >
            </div>

            <div class="mt-auto pt-3 border-top border-light">
              <div class="d-flex align-items-end justify-content-between mb-3">
                <span class="text-muted small">Giá thuê</span>
                <p class="h4 fw-bold text-primary mb-0">
                  {{ formatPrice(post.price) }}/tháng
                </p>
              </div>

              <router-link
                :to="`/room/${post.slug || post.post_id}`"
                class="btn btn-dark w-100 rounded-pill fw-semibold py-2 transition-btn"
              >
                Xem Chi Tiết
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// State
const filters = ref({
  city: "",
  room_type: "",
  min_price: 0,
  max_price: 999999999,
});
const selectedPriceRange = ref("");
const filterOptions = ref({
  cities: [],
  room_types: [],
});
const posts = ref([]);
const loading = ref(true);

// Helpers Formatter
const formatRoomType = (type) => {
  if (!type) return "Khác";
  return type
    .replace("phong_tro", "Phòng trọ")
    .replace("can_ho_mini", "Căn hộ mini")
    .replace("can_ho", "Căn hộ")
    .replace("nha_nguyen_can", "Nhà nguyên căn")
    .replace("mat_bang", "Mặt bằng")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatPrice = (price) => {
  if (!price) return "0 đ";
  
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1).replace(".0", "") + " triệu";
  }
  return new Intl.NumberFormat("vi-VN").format(price) + " đ";
};


const getBadgeClass = (type) => {
  if (type === "phong_tro") return "bg-primary text-white";
  if (type === "chung_cu_mini") return "bg-success text-white";
  if (type === "can_ho") return "bg-warning text-dark";
  if (type === "nha_nguyen_can") return "bg-danger text-white";
  return "bg-secondary text-white";
};

const handleImageError = (e) => {
  e.target.src = "https://via.placeholder.com/400x300.png?text=Ảnh+lỗi";
};

// Logic Filter
const applyPriceRange = () => {
  if (!selectedPriceRange.value) {
    filters.value.min_price = 0;
    filters.value.max_price = 100000000;
  } else {
    const [min, max] = selectedPriceRange.value.split("-").map(Number);
    filters.value.min_price = min;
    filters.value.max_price = max;
  }
  fetchPosts();
};

// API Calls
const fetchFilterOptions = async () => {
  try {
    const res = await axios.get("/search/filters");
    filterOptions.value = res.data.data;
  } catch (err) {
    console.error("Lỗi tải bộ lọc:", err);
  }
};
// Thêm hàm này vào trong <script setup>
const getImageUrl = (post) => {
  if (Array.isArray(post.images) && post.images.length > 0) {
    return post.images[0];
  }

  if (typeof post.images === "string" && post.images.startsWith("[")) {
    try {
      const parsed = JSON.parse(post.images);
      if (parsed.length > 0) return parsed[0];
    } catch (e) {
      console.error("Lỗi parse ảnh:", e);
    }
  }

  if (post.image) return post.image;

  return null;
};
const fetchPosts = async () => {
  loading.value = true;
  try {
    // Giả lập delay nhỏ để thấy hiệu ứng loading (tuỳ chọn)
    // await new Promise(r => setTimeout(r, 500));

    const res = await axios.get("/search/advanced", {
      params: {
        ...filters.value,
        limit: 12,
        sort_by: "created_at",
        sort_order: "DESC",
      },
    });
    posts.value = res.data.data.posts || [];
  } catch (err) {
    console.error("Lỗi tải tin:", err);
    posts.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchFilterOptions();
  fetchPosts();
});
</script>

<style scoped>
/* Container nền */
.bg-light-subtle {
  background-color: #f8f9fa;
}

/* Card Styling */
.card {
  transition: all 0.3s ease;
  border: none;
}

.hover-shadow:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
}

/* Rounded corners */
.rounded-4 {
  border-radius: 1.2rem !important;
}

/* Typography Limit */
.text-truncate-2 {
  display: -webkit-box;

  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3rem; /* Cố định chiều cao dòng tiêu đề */
}

/* Button hover effect */
.transition-btn {
  transition: transform 0.2s;
}
.transition-btn:hover {
  transform: scale(1.02);
  background-color: #000; /* Đậm hơn chút khi hover */
}

/* Badge màu riêng (nếu không dùng bootstrap classes) */
.bg-purple {
  background-color: #6f42c1;
  color: white;
}
</style>
