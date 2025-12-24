<template>
  <div class="container py-5">
    <!-- Tiêu đề tìm kiếm -->
    <h2 class="mb-4 text-center fw-bold text-info">
      Kết quả tìm kiếm
      <span v-if="searchParams.keyword" class="text-dark">
        cho "{{ searchParams.keyword }}"
      </span>
      <span v-else-if="searchParams.district" class="text-dark">
        tại {{ searchParams.district }}
      </span>
      <span v-else-if="searchParams.city" class="text-dark">
        tại {{ searchParams.city }}
      </span>
    </h2>

    <!-- Bộ lọc nâng cao -->
    <div class="card shadow-sm p-4 mb-5">
      <div class="row g-3 align-items-end">
        <!-- Từ khóa -->
        <div class="col-md-4">
          <label class="form-label fw-medium">Từ khóa</label>
          <input
            type="text"
            class="form-control"
            placeholder="Tên trọ, địa chỉ..."
            v-model="searchParams.keyword"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- Thành phố -->
        <div class="col-md-4">
          <label class="form-label fw-medium">Thành phố</label>
          <select
            class="form-select"
            v-model="searchParams.city"
            @change="onCityChange"
          >
            <option value="">Tất cả thành phố</option>
            <option v-for="city in cities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>

        <!-- Quận/Huyện -->
        <div class="col-md-4">
          <label class="form-label fw-medium">Quận/Huyện</label>
          <input
            type="text"
            class="form-control"
            placeholder="Ví dụ: Quận 7, Huyện Bình Chánh"
            v-model="searchParams.district"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- Phường/Xã -->
        <div class="col-md-3">
          <label class="form-label fw-medium">Phường/Xã</label>
          <input
            type="text"
            class="form-control"
            placeholder="Ví dụ: Phường 1"
            v-model="searchParams.ward"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- Loại phòng -->
        <div class="col-md-3">
          <label class="form-label fw-medium">Loại phòng</label>
          <select
            class="form-select"
            v-model="searchParams.room_type"
            @change="handleSearch"
          >
            <option value="">Tất cả loại</option>
            <option value="phong_tro">Phòng trọ</option>
            <option value="can_ho_mini">Căn hộ mini</option>
            <option value="nha_nguyen_can">Nhà nguyên căn</option>
            <option value="mat_bang">Mặt bằng</option>
          </select>
        </div>

        <!-- Khoảng giá -->
        <div class="col-md-3">
          <label class="form-label fw-medium">Giá tối thiểu (triệu)</label>
          <input
            type="number"
            class="form-control"
            placeholder="0"
            v-model.number="searchParams.min_price"
            min="0"
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-medium">Giá tối đa (triệu)</label>
          <input
            type="number"
            class="form-control"
            placeholder="Không giới hạn"
            v-model.number="searchParams.max_price"
            min="0"
          />
        </div>

        <!-- Nút lọc -->
        <div class="col-12 text-end mt-3">
          <button 
            class="btn btn-outline-secondary me-2 px-4" 
            @click="resetFilters"
          >
            <i class="bi bi-arrow-counterclockwise me-2"></i>
            Đặt lại
          </button>
          <button 
            class="btn btn-info px-5" 
            @click="handleSearch"
            :disabled="loading"
          >
            <i class="bi bi-search me-2"></i>
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>

    <!-- Thông tin kết quả -->
    <div v-if="!loading && posts.length > 0" class="mb-3">
      <p class="text-muted">
        Tìm thấy <strong>{{ pagination.total }}</strong> kết quả
        <span v-if="searchParams.keyword"> 
          cho "<strong>{{ searchParams.keyword }}</strong>"
        </span>
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-info" role="status"></div>
      <p class="mt-3">Đang tải dữ liệu...</p>
    </div>

    <!-- Không có kết quả -->
    <div v-else-if="posts.length === 0" class="text-center py-5">
      <i class="bi bi-search fs-1 text-muted mb-3"></i>
      <h4>Không tìm thấy kết quả phù hợp</h4>
      <p class="text-muted">Thử thay đổi bộ lọc hoặc từ khóa khác</p>
      <button class="btn btn-info mt-3" @click="resetFilters">
        Xóa bộ lọc
      </button>
    </div>

    <!-- Danh sách tin -->
    <div v-else class="row g-4">
      <div 
        class="col-md-6 col-lg-4" 
        v-for="post in posts" 
        :key="post.post_id"
      >
        <div class="card h-100 shadow-sm hover-card">
          <!-- Badge VIP -->
          <div v-if="post.is_vip" class="position-absolute top-0 end-0 m-2">
            <span class="badge bg-warning text-dark">
              <i class="bi bi-star-fill me-1"></i>VIP
            </span>
          </div>

          <!-- Hình ảnh -->
          <img
            v-if="post.images?.length"
            :src="post.images[0]"
            class="card-img-top"
            style="height: 220px; object-fit: cover"
            :alt="post.title"
          />
          <div 
            v-else 
            class="card-img-top bg-light d-flex align-items-center justify-content-center"
            style="height: 220px"
          >
            <i class="bi bi-image fs-1 text-muted"></i>
          </div>

          <!-- Nội dung -->
          <div class="card-body d-flex flex-column">
            <h5 class="fw-bold mb-2" style="
              display: -webkit-box;
              
              -webkit-box-orient: vertical;
              overflow: hidden;
            ">
              {{ post.title }}
            </h5>
            
            <p class="text-danger fw-bold fs-5 mb-2">
              {{ formatPrice(post.price) }} đ/tháng
            </p>
            
            <div class="text-muted small mb-2">
              <i class="bi bi-rulers me-1"></i>
              {{ post.area }} m²
              <span class="mx-2">•</span>
              <i class="bi bi-door-closed me-1"></i>
              {{ formatRoomType(post.room_type) }}
            </div>
            
            <p class="text-muted small mb-3">
              <i class="bi bi-geo-alt me-1"></i>
              {{ formatAddress(post) }}
            </p>

            <div class="mt-auto">
              <router-link
                :to="`/room/${post.slug || post.post_id}`"
                class="btn btn-dark w-100 rounded-pill fw-semibold"
              >
                Xem Chi Tiết
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phân trang -->
    <nav
      v-if="pagination.total_pages > 1"
      class="d-flex justify-content-center mt-5"
    >
      <ul class="pagination">
        <li
          class="page-item"
          :class="{ disabled: pagination.current_page === 1 }"
        >
          <button
            class="page-link"
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
          >
            « Trước
          </button>
        </li>

        <!-- First page -->
        <li
          v-if="pagination.current_page > 3"
          class="page-item"
        >
          <button class="page-link" @click="changePage(1)">1</button>
        </li>
        <li v-if="pagination.current_page > 4" class="page-item disabled">
          <span class="page-link">...</span>
        </li>

        <!-- Pages around current -->
        <li
          class="page-item"
          v-for="n in visiblePages"
          :key="n"
          :class="{ active: n === pagination.current_page }"
        >
          <button class="page-link" @click="changePage(n)">{{ n }}</button>
        </li>

        <!-- Last page -->
        <li 
          v-if="pagination.current_page < pagination.total_pages - 3" 
          class="page-item disabled"
        >
          <span class="page-link">...</span>
        </li>
        <li
          v-if="pagination.current_page < pagination.total_pages - 2"
          class="page-item"
        >
          <button 
            class="page-link" 
            @click="changePage(pagination.total_pages)"
          >
            {{ pagination.total_pages }}
          </button>
        </li>

        <li
          class="page-item"
          :class="{
            disabled: pagination.current_page === pagination.total_pages,
          }"
        >
          <button
            class="page-link"
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.total_pages"
          >
            Sau »
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const searchParams = ref({
  keyword: "",
  city: "",
  district: "",
  ward: "",
  room_type: "",
  min_price: 0,
  max_price: null,
  page: 1,
  limit: 12,
  sort_by: "created_at",
  sort_order: "DESC",
});

const posts = ref([]);
const pagination = ref({
  current_page: 1,
  total_pages: 1,
  total: 0,
});
const loading = ref(false);
const cities = ref([]);

// Computed: các trang hiển thị xung quanh trang hiện tại
const visiblePages = computed(() => {
  const current = pagination.value.current_page;
  const total = pagination.value.total_pages;
  const pages = [];
  
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Hàm tìm kiếm chính
const doSearch = async () => {
  loading.value = true;
  try {
    // Chuẩn bị params, loại bỏ các giá trị rỗng
    const params = {};
    Object.keys(searchParams.value).forEach(key => {
      const value = searchParams.value[key];
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = value;
      }
    });

    const { data } = await axios.get("/search/advanced", { params });
    
    if (data.success) {
      posts.value = data.data.posts;
      pagination.value = data.data.pagination;
    }
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    posts.value = [];
    pagination.value = { current_page: 1, total_pages: 1, total: 0 };
  } finally {
    loading.value = false;
  }
};

// Load filter options (cities, room_types)
const loadFilterOptions = async () => {
  try {
    const { data } = await axios.get("/search/filters");
    if (data.success) {
      cities.value = data.data.cities;
    }
  } catch (error) {
    console.error("Lỗi tải bộ lọc:", error);
    // Fallback cities
    cities.value = [
      "Thành phố Hồ Chí Minh",
      "Thành phố Hà Nội",
      "Thành phố Đà Nẵng",
      "Thành phố Cần Thơ"
    ];
  }
};

// Sync params từ URL
const syncFromURL = () => {
  searchParams.value = {
    keyword: route.query.keyword || "",
    city: route.query.city || "",
    district: route.query.district || "",
    ward: route.query.ward || "",
    room_type: route.query.room_type || "",
    min_price: Number(route.query.min_price) || 0,
    max_price: route.query.max_price ? Number(route.query.max_price) : null,
    page: Number(route.query.page) || 1,
    limit: 12,
    sort_by: "created_at",
    sort_order: "DESC",
  };
};

// Handle search button click
const handleSearch = () => {
  searchParams.value.page = 1;
  updateURL();
};

// Update URL với params hiện tại
const updateURL = () => {
  const query = {};
  
  Object.keys(searchParams.value).forEach(key => {
    const value = searchParams.value[key];
    // Chỉ thêm vào query nếu có giá trị
    if (value !== "" && value !== null && value !== undefined && 
        key !== "limit" && key !== "sort_by" && key !== "sort_order") {
      query[key] = value;
    }
  });

  router.push({ query });
};

// Reset filters
const resetFilters = () => {
  searchParams.value = {
    keyword: "",
    city: "",
    district: "",
    ward: "",
    room_type: "",
    min_price: 0,
    max_price: null,
    page: 1,
    limit: 12,
    sort_by: "created_at",
    sort_order: "DESC",
  };
  updateURL();
};

// Change page
const changePage = (page) => {
  if (page < 1 || page > pagination.value.total_pages) return;
  searchParams.value.page = page;
  updateURL();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Khi thay đổi city, có thể load districts (optional)
const onCityChange = () => {
  searchParams.value.district = "";
  handleSearch();
};

// Format functions
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

const formatRoomType = (type) => {
  const types = {
    phong_tro: "Phòng trọ",
    can_ho_mini: "Căn hộ mini",
    nha_nguyen_can: "Nhà nguyên căn",
    mat_bang: "Mặt bằng"
  };
  return types[type] || type;
};

const formatAddress = (post) => {
  const parts = [];
  if (post.ward) parts.push(post.ward);
  if (post.district) parts.push(post.district);
  if (post.city) parts.push(post.city);
  return parts.join(", ");
};

// Watch route query changes
watch(
  () => route.query,
  () => {
    syncFromURL();
    doSearch();
  },
  { deep: true }
);

// Mounted
onMounted(async () => {
  await loadFilterOptions();
  syncFromURL();
  doSearch();
});
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.page-link {
  cursor: pointer;
}

.page-item.disabled .page-link {
  cursor: not-allowed;
}
</style>