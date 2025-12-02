<template>
  <header class="shadow-sm py-3">
    <div class="container py-3">
      <div class="row align-items-center g-3">
        <!-- Cột 1: Logo + Thành phố -->
        <div class="col-lg-3 col-12 text-center text-lg-start">
          <div
            class="d-flex align-items-center justify-content-center justify-content-lg-start gap-4"
          >
            <!-- Logo -->
            <div class="d-flex align-items-center gap-2">
              <h1 class="mb-0 fs-3 fw-bold text-info">ThueTro</h1>
            </div>

            <!-- Thành phố (dropdown) -->
            <div class="dropdown">
              <a
                class="btn btn-white border-0 d-flex align-items-center fw-medium text-dark gap-2 text-nowrap"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-geo-alt-fill text-danger"></i>
                <span class="d-none d-sm-inline">{{ selectedCity }}</span>
                <span class="d-inline d-sm-none">{{ selectedCityShort }}</span>
                <i class="bi bi-chevron-down ms-2"></i>
              </a>

              <ul class="dropdown-menu">
                <li v-for="city in cities" :key="city.id">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="selectCity(city)"
                    :class="{ active: city.full === selectedCity }"
                  >
                    {{ city.full }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Cột 2: Khung tìm kiếm -->
        <div class="col-lg-6 col-12 px-4">
          <div class="position-relative">
            <input
              type="text"
              class="form-control form-control-lg rounded-pill bg-dark text-white shadow-sm px-5"
              placeholder="Tìm Kiếm"
              style="background-color: #000 !important; border: none"
            />
            <i
              class="bi bi-search position-absolute top-50 start-0 translate-middle-y text-white fs-4 ps-3"
            ></i>
          </div>
        </div>

        <!-- Cột 3: Nút động theo trạng thái đăng nhập -->
        <div class="col-lg-3 col-12 text-center text-lg-end">
          <div
            class="d-flex justify-content-center justify-content-lg-end gap-3 align-items-center"
          >
            <!-- TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP -->
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

            <!-- TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP -->
            <template v-else>
              <!-- Nút Đăng tin -->
              <router-link
                to="/post-room"
                class="btn btn-info btn-lg rounded-pill fw-bold shadow px-3 d-flex align-items-center gap-2"
              >
                <i class="bi bi-plus-circle-fill"></i>
                <span class="d-none d-md-inline">Đăng tin</span>
              </router-link>

              <!-- Avatar + Dropdown Đăng xuất -->
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
                      <strong>Xin chào!</strong><br />
                      <small class="text-muted">{{
                        user?.full_name || "User"
                      }}</small>
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
                    >
                      <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                    </a>
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
import { ref, onMounted } from "vue";

// === THÀNH PHỐ ===
const cities = ref([
  { id: 1, full: "TP Hồ Chí Minh", short: "TP HCM" },
  { id: 2, full: "Hà Nội", short: "Hà Nội" },
  { id: 3, full: "Đà Nẵng", short: "Đà Nẵng" },
  { id: 4, full: "Cần Thơ", short: "Cần Thơ" },
]);
const selectedCity = ref("TP Hồ Chí Minh");
const selectedCityShort = ref("TP HCM");
const selectCity = (city) => {
  selectedCity.value = city.full;
  selectedCityShort.value = city.short;
};

// === XÁC THỰC NGƯỜI DÙNG ===
const user = ref(null);
const isLoggedIn = ref(false);

const checkLogin = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  if (token && userData) {
    user.value = JSON.parse(userData);
    isLoggedIn.value = true;
  } else {
    user.value = null;
    isLoggedIn.value = false;
  }
};

// Kiểm tra ngay khi load và khi có thay đổi storage (tab khác)
onMounted(() => {
  checkLogin();
  window.addEventListener("storage", checkLogin);
});

// Hàm đăng xuất
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  isLoggedIn.value = false;
  user.value = null;
  // Dispatch event để các tab khác biết
  window.dispatchEvent(new Event("storage"));
  $router.push("/login");
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
</style>
