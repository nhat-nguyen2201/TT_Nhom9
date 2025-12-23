<!-- src/components/layout/AdminLayout.vue -->
<template>
  <div class="d-flex min-vh-100 bg-gray-100">
    <!-- Sidebar -->
    <div
      class="bg-gradient-danger text-white d-flex flex-column"
      style="width: 280px"
    >
      <div class="p-4 text-center border-bottom border-light">
        <h3 class="mb-0 fw-bold">ADMIN THUETRO.VN</h3>
      </div>
      <nav class="flex-grow-1 p-3">
        <ul class="nav flex-column gap-2">
          <li>
            <router-link
              to="/admin/dashboard"
              active-class="bg-white text-danger"
              class="nav-link text-white rounded px-3 py-2 d-flex align-items-center"
            >
              <i class="bi bi-speedometer2 me-2"></i> Dashboard
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/users"
              active-class="bg-white text-danger"
              class="nav-link text-white rounded px-3 py-2 d-flex align-items-center"
            >
              <i class="bi bi-people me-2"></i> Quản lý người dùng
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/posts"
              active-class="bg-white text-danger"
              class="nav-link text-white rounded px-3 py-2 d-flex align-items-center"
            >
              <i class="bi bi-house-door me-2"></i> Quản lý tin đăng
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/stats"
              active-class="bg-white text-danger"
              class="nav-link text-white rounded px-3 py-2 d-flex align-items-center"
            >
              <i class="bi bi-graph-up me-2"></i> Thống kê
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="p-3 border-top border-light">
        <button @click.prevent="logout" class="btn btn-outline-light w-100">
          <i class="bi bi-box-arrow-right me-2"></i> Đăng xuất
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow-1 d-flex flex-column">
      <!-- Header với tiêu đề + nút Tạo tài khoản -->
      <div class="bg-white shadow-sm p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="mb-0 fw-bold">{{ pageTitle }}</h2>

          <!-- NÚT TẠO TÀI KHOẢN MỚI - HIỆN TRÊN MỌI TRANG ADMIN -->
          <button
            @click="openCreateUserModal"
            class="btn btn-success btn-lg shadow-sm d-flex align-items-center"
          >
            <i class="bi bi-person-plus-fill me-2"></i>
            Tạo tài khoản mới
          </button>
        </div>
      </div>

      <!-- Nội dung trang con -->
      <div class="container-fluid px-4 pb-5 flex-grow-1">
        <router-view />
      </div>
    </div>

    <!-- Modal tạo tài khoản (dùng Bootstrap modal) -->
    <div
      class="modal fade"
      id="createUserModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="bi bi-person-plus me-2"></i> Tạo tài khoản mới
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitCreateUser">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold"
                    >Họ và tên <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="newUser.full_name"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold"
                    >Email <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="newUser.email"
                    type="email"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Số điện thoại</label>
                  <input
                    v-model="newUser.phone"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold"
                    >Mật khẩu <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="newUser.password"
                    type="password"
                    class="form-control"
                    required
                    minlength="6"
                  />
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold"
                    >Vai trò <span class="text-danger">*</span></label
                  >
                  <select v-model="newUser.role" class="form-select" required>
                    <option value="renter">Người thuê (Renter)</option>
                    <option value="landlord">Chủ trọ (Landlord)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Hủy
            </button>
            <button
              @click="submitCreateUser"
              class="btn btn-success"
              :disabled="creating"
            >
              <span
                v-if="creating"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              Tạo tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";
import { ref } from "vue";

export default {
  setup() {
    const router = useRouter();

    // Dữ liệu cho modal tạo user
    const createUserModal = ref(null);
    const newUser = ref({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      role: "renter",
    });
    const creating = ref(false);

    const openCreateUserModal = () => {
      // Reset form
      newUser.value = {
        full_name: "",
        email: "",
        phone: "",
        password: "",
        role: "renter",
      };
      // Mở modal Bootstrap
      const modal = new bootstrap.Modal(
        document.getElementById("createUserModal")
      );
      modal.show();
    };

    const submitCreateUser = async () => {
      creating.value = true;
      try {
        await axios.post("/admin/users", newUser.value);
        alert("Tạo tài khoản thành công!");
        // Đóng modal
        bootstrap.Modal.getInstance(
          document.getElementById("createUserModal")
        ).hide();
      } catch (err) {
        alert(
          err.response?.data?.message ||
            "Lỗi tạo tài khoản. Vui lòng kiểm tra lại!"
        );
      } finally {
        creating.value = false;
      }
    };

    return {
      router,
      pageTitle: "Admin Panel", // Có thể để child component override
      openCreateUserModal,
      newUser,
      creating,
      submitCreateUser,
    };
  },

  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
      this.router.push("/login");
    },
  },
};
</script>

<style scoped>
.bg-gradient-danger {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
}

.nav-link {
  transition: all 0.3s;
}

.nav-link:hover,
.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.bg-white.text-danger {
  color: #dc3545 !important;
  font-weight: 600;
}
</style>
