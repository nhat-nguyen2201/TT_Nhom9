<template>
  <div class="container py-5">
    <h2 class="mb-4 text-center fw-bold text-info">
      Kết quả tìm kiếm
      <span v-if="searchParams.keyword" class="text-dark">
        cho "{{ searchParams.keyword }}"
      </span>
      <span v-else-if="searchParams.city" class="text-dark">
        tại {{ searchParams.city }}
      </span>
    </h2>

    <!-- Bộ lọc -->
    <div class="card shadow-sm p-4 mb-5">
      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="form-label fw-medium">Thành phố</label>
          <select
            class="form-select"
            v-model="searchParams.city"
            @change="handleSearch"
          >
            <option value="">Tất cả thành phố</option>
            <option v-for="city in cities" :key="city.full" :value="city.full">
              {{ city.full }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label fw-medium">Quận/Huyện</label>
          <input
            type="text"
            class="form-control"
            placeholder="Ví dụ: Quận 7"
            v-model="searchParams.district"
            @keyup.enter="handleSearch"
          />
        </div>

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

        <div class="col-md-3">
          <label class="form-label fw-medium">Khoảng giá (triệu)</label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              placeholder="Từ"
              v-model.number="searchParams.min_price"
            />
            <span class="input-group-text">-</span>
            <input
              type="number"
              class="form-control"
              placeholder="Đến"
              v-model.number="searchParams.max_price"
            />
          </div>
        </div>

        <div class="col-12 text-end mt-3">
          <button class="btn btn-info btn-lg px-5" @click="handleSearch">
            Lọc ngay
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-info" role="status"></div>
      <p class="mt-3">Đang tải dữ liệu...</p>
    </div>

    <!-- Không có kết quả -->
    <div v-else-if="posts.length === 0" class="text-center py-5">
      <h4>Không tìm thấy kết quả phù hợp</h4>
      <p>Thử thay đổi bộ lọc hoặc từ khóa khác</p>
    </div>

    <!-- Danh sách tin -->
    <div v-else class="row g-4">
      <div class="col-md-6 col-lg-4" v-for="post in posts" :key="post.post_id">
        <div class="card h-100 shadow-sm">
          <img
            v-if="post.images?.length"
            :src="post.images[0]"
            class="card-img-top"
            style="height: 220px; object-fit: cover"
          />

          <div class="card-body d-flex flex-column">
            <h5 class="fw-bold text-truncate-2">{{ post.title }}</h5>
            <p class="text-danger fw-bold">
              {{ formatPrice(post.price) }} đ/tháng
            </p>
            <p class="text-muted small">
              {{ post.area }} m² • {{ post.room_type }}
            </p>
            <p class="text-muted small">
              {{ post.ward }}, {{ post.district }}, {{ post.city }}
            </p>

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
          >
            «
          </button>
        </li>

        <li
          class="page-item"
          v-for="n in pagination.total_pages"
          :key="n"
          :class="{ active: n === pagination.current_page }"
        >
          <button class="page-link" @click="changePage(n)">{{ n }}</button>
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
          >
            »
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import axios from "axios";

const route = useRoute();
const router = useRouter();

const searchParams = ref({
  keyword: "",
  city: "",
  district: "",
  room_type: "",
  min_price: 0,
  max_price: 999999999,
  page: 1,
  limit: 12,
  sort_by: "created_at",
  sort_order: "DESC",
});

const posts = ref([]);
const pagination = ref({
  current_page: 1,
  total_pages: 1,
});
const loading = ref(false);

const cities = ref([
  { full: "Thành phố Hồ Chí Minh" },
  { full: "Thành phố Hà Nội" },
  { full: "Thành phố Đà Nẵng" },
  { full: "Thành phố Cần Thơ" },
]);
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // Bỏ qua lần đầu (oldQuery undefined)
    if (!oldQuery) return;

    Object.assign(searchParams.value, {
      keyword: newQuery.keyword || "",
      city: newQuery.city || "",
      // ... các field khác
      page: Number(newQuery.page) || 1,
    });
    doSearch();
  },
  { deep: true }
);

onMounted(async () => {
  try {
    const { data } = await axios.get("/search/filter-options");
    if (data.success) {
      cities.value = data.data.cities.map((city) => ({ full: city }));
      // roomTypes nếu cần
    }
  } catch (error) {
    console.error("Lỗi tải bộ lọc:", error);
    // fallback hard-code nếu cần
    cities.value = [
      { full: "Thành phố Hồ Chí Minh" },
      { full: "Thành phố Hà Nội" },
      // ...
    ];
  }

  // Sau đó mới đọc query và search
  Object.assign(searchParams.value, route.query);
});

const handleSearch = () => {
  searchParams.value.page = 1;

  // Cập nhật URL để đồng bộ filter
  router.push({
    query: {
      keyword: searchParams.value.keyword || undefined,
      city: searchParams.value.city || undefined,
      district: searchParams.value.district?.trim() || undefined,
      room_type: searchParams.value.room_type || undefined,
      min_price:
        searchParams.value.min_price > 0
          ? searchParams.value.min_price
          : undefined,
      max_price:
        searchParams.value.max_price < 999999999
          ? searchParams.value.max_price
          : undefined,
    },
  });
  updateURL({ ...searchParams.value, page: 1 });
};

const doSearch = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get("/search/advanced", {
      params: searchParams.value,
    });
    posts.value = data.data.posts;
    pagination.value = data.data.pagination;
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.total_pages) return;
  searchParams.value.page = page;
  doSearch();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);
</script>

<style scoped>
.hover-lift {
  transition: transform 0.3s, box-shadow 0.3s;
}
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15) !important;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
