<template>
  <header class="shadow-sm py-3">
    <div class="container py-3">
      <div class="row align-items-center g-3">
        <!-- Cột 1: Logo -->

        <div class="col-lg-3 col-12 text-center text-lg-start">
          <div
            class="d-flex align-items-center justify-content-center justify-content-lg-start"
          >
            <router-link
              to="/"
              class="d-flex align-items-center gap-2 text-decoration-none logo-brand"
            >
              <div
                class="logo-icon bg-info rounded-3 d-flex align-items-center justify-content-center"
                style="width: 40px; height: 40px"
              >
                <i class="bi bi-house-heart-fill text-white fs-4"></i>
              </div>
              <h1 class="mb-0 fs-3 fw-bold text-info">ThueTro</h1>
            </router-link>
          </div>
        </div>

        <!-- Cột 2: Khung tìm kiếm + GỢI Ý MỚI -->
        <div class="col-lg-6 col-12 px-4">
          <div class="position-relative">
            <!-- Ô input tìm kiếm -->
            <input
              type="text"
              class="form-control form-control-lg rounded-pill bg-dark text-white shadow-sm px-5"
              placeholder="Tìm theo tên trọ, địa chỉ..."
              style="background-color: #000 !important; border: none"
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
              @input="fetchSuggestions"
              @focus="showSuggestions = true"
              ref="searchInput"
            />

            <!-- Icon kính lúp -->
            <i
              class="bi bi-search position-absolute top-50 start-0 translate-middle-y text-white fs-4 ps-3"
              style="cursor: pointer"
              @click="handleSearch"
            ></i>

            <!-- Danh sách gợi ý autocomplete -->
            <div
              v-if="showSuggestions && suggestions.length > 0"
              class="position-absolute w-100 mt-1 bg-white shadow-lg rounded-3 overflow-hidden border"
              style="
                top: 100%;
                z-index: 1000;
                max-height: 400px;
                overflow-y: auto;
              "
              @click.stop
            >
              <div
                v-for="(item, index) in suggestions"
                :key="index"
                class="px-4 py-3 border-bottom suggestion-item cursor-pointer"
                :class="{ 'bg-light': hoveredIndex === index }"
                @click="selectSuggestion(item)"
                @mouseenter="hoveredIndex = index"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div class="flex-grow-1">
                    <strong class="text-dark d-block">{{ item.title }}</strong>
                    <small class="text-muted d-block">
                      <i class="bi bi-geo-alt me-1"></i>
                      {{ item.ward ? item.ward + ", " : ""
                      }}{{ item.district }}, {{ item.city }}
                    </small>
                    <small class="text-primary fw-bold">
                      {{ formatPrice(item.price) }} đ/tháng
                    </small>
                  </div>
                  <i class="bi bi-arrow-right text-muted ms-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột 3: Nút đăng nhập / đăng tin (giữ nguyên) -->
        <div class="col-lg-3 col-12 text-center text-lg-end">
          <!-- ... giữ nguyên phần đăng nhập/đăng xuất như cũ ... -->
          <div
            class="d-flex justify-content-center justify-content-lg-end gap-3 align-items-center"
          >
            <template v-if="!isLoggedIn">
              <button
                class="btn btn-primary btn-lg rounded-pill fw-semibold shadow px-2 w-100"
                @click="$router.push('/login')"
              >
                Đăng Nhập
              </button>
              <button
                class="btn btn-primary btn-lg rounded-pill fw-semibold shadow px-2 w-100"
                @click="$router.push('/register')"
              >
                Đăng Ký
              </button>
            </template>

            <template v-else>
              <router-link
                to="/create-post"
                class="btn btn-info btn-lg rounded-pill fw-bold shadow px-3 d-flex align-items-center gap-2"
              >
                <i class="bi bi-plus-circle-fill"></i>
                <span class="d-none d-md-inline">Đăng tin</span>
              </router-link>

              <div class="dropdown">
                <a
                  class="btn btn-light rounded-circle d-flex align-items-center justify-content-center text-dark shadow"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  style="width: 50px; height: 50px"
                >
                  <i class="bi bi-person-fill fs-4"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <div class="dropdown-item-text px-3">
                      <strong>Xin chào!</strong><br /><small
                        class="text-muted"
                        >{{ user?.full_name || "User" }}</small
                      >
                    </div>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <router-link to="/profile" class="dropdown-item"
                      >Hồ sơ cá nhân</router-link
                    >
                  </li>
                  <li>
                    <router-link to="/my-posts" class="dropdown-item"
                      >Tin đã đăng</router-link
                    >
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a
                      href="#"
                      class="dropdown-item text-danger"
                      @click.prevent="logout"
                      ><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</a
                    >
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios"; // Đảm bảo đã cài axios: npm install axios

const router = useRouter();

// === TÌM KIẾM + GỢI Ý ===
const searchKeyword = ref("");
const suggestions = ref([]);
const showSuggestions = ref(false);
const hoveredIndex = ref(-1);

const fetchSuggestions = async () => {
  const q = searchKeyword.value.trim();
  if (q.length < 2) {
    suggestions.value = [];
    return;
  }

  try {
    const res = await axios.get("/search/suggestions", {
      params: { q, city: selectedCity.value },
    });
    suggestions.value = res.data.data || [];
  } catch (err) {
    console.error("Lỗi gợi ý:", err);
    suggestions.value = [];
  }
};

const selectSuggestion = (item) => {
  searchKeyword.value = item.title;
  showSuggestions.value = false;
  router.push({
    path: "/search",
    query: {
      keyword: item.title,
      city: selectedCity.value,
    },
  });
};

const handleSearch = () => {
  showSuggestions.value = false;
  const keyword = searchKeyword.value.trim();
  const city = selectedCity.value;

  if (!keyword && !city) return;

  router.push({
    path: "/search",
    query: { keyword, city },
  });
};

// Format giá tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

// Ẩn gợi ý khi click ra ngoài
const hideSuggestions = (e) => {
  if (!e.target.closest(".position-relative")) {
    showSuggestions.value = false;
  }
};

// === CITIES ===
const cities = ref([
  { id: 1, full: "Thành Phố Hồ Chí Minh", short: "TP HCM" },
  { id: 2, full: "Thành Phố Hà Nội", short: "Hà Nội" },
  { id: 3, full: "Thành Phố Đà Nẵng", short: "Đà Nẵng" },
  { id: 4, full: "Thành Phố Cần Thơ", short: "Cần Thơ" },
]);

const selectedCity = ref("TP Hồ Chí Minh");
const selectedCityShort = ref("TP HCM");

const selectCity = (city) => {
  selectedCity.value = city.full;
  selectedCityShort.value = city.short;
  handleSearch(); // Tự động tìm khi đổi thành phố
};

// === AUTH ===
const user = ref(null);
const isLoggedIn = ref(false);

const updateLoginStatus = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (token && userData) {
    try {
      user.value = JSON.parse(userData);
      isLoggedIn.value = true;
    } catch (e) {
      logout();
    }
  } else {
    user.value = null;
    isLoggedIn.value = false;
  }
};

let intervalId = null;

onMounted(() => {
  updateLoginStatus();
  window.addEventListener("storage", updateLoginStatus);
  document.addEventListener("click", hideSuggestions);

  intervalId = setInterval(() => {
    const currentToken = localStorage.getItem("token");
    const previousToken = user.value ? "exists" : null;
    if ((currentToken && !previousToken) || (!currentToken && previousToken)) {
      updateLoginStatus();
    }
  }, 800);
});

onUnmounted(() => {
  window.removeEventListener("storage", updateLoginStatus);
  document.removeEventListener("click", hideSuggestions);
  if (intervalId) clearInterval(intervalId);
});

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  updateLoginStatus();
  router.push("/");
};
</script>

<style scoped>
.btn-primary {
  background: linear-gradient(45deg, #06b6d4, #0891b2);
  border: none;
}
.btn-primary:hover {
  background: linear-gradient(45deg, #0891b2, #06b6d4);
}
.form-control::placeholder {
  text-align: center !important;
  color: rgba(255, 255, 255, 0.785) !important;
}

/* Style cho gợi ý */
.suggestion-item {
  cursor: pointer;
  transition: background 0.2s;
}
.suggestion-item:hover {
  background-color: #f8f9fa !important;
}
<style scoped > .logo-brand {
  transition: all 0.3s ease;
  cursor: pointer;
}

/* Hiệu ứng khi di chuột vào logo */
.logo-brand:hover {
  opacity: 0.8;
  transform: translateY(-1px); /* Nhích nhẹ lên trên */
}

/* Đảm bảo text-info luôn giữ màu dù là link */
.logo-brand h1 {
  letter-spacing: -0.5px;
}

.logo-icon {
  transition: transform 0.3s ease;
}

.logo-brand:hover .logo-icon {
  transform: rotate(-10deg); /* Xoay nhẹ icon tạo sự sinh động */
}
</style>
