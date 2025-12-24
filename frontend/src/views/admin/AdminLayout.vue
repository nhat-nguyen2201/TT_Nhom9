<!-- src/components/layout/AdminLayout.vue -->
<template>
  <div class="d-flex min-vh-100 bg-gray-100">
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
              to="/admin/packages"
              class="nav-link text-white rounded px-3 py-2 d-flex align-items-center"
              active-class="active bg-white text-danger"
              exact-active-class="active bg-white text-danger"
            >
              <i class="bi bi-box-seam me-2"></i> Quản lý gói dịch vụ
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
    </div>

    <div class="flex-grow-1 d-flex flex-column">
      <div class="bg-white shadow-sm p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="mb-0 fw-bold">{{ pageTitle }}</h2>

          <div class="d-flex gap-2">
            <button
              @click="openCreateUserModal"
              class="btn btn-success btn-lg shadow-sm d-flex align-items-center"
            >
              <i class="bi bi-person-plus-fill me-2"></i> Tạo tài khoản
            </button>

            <button
              @click="openCreatePackageModal"
              class="btn btn-warning text-white btn-lg shadow-sm d-flex align-items-center"
            >
              <i class="bi bi-plus-circle-fill me-2"></i> Thêm gói dịch vụ
            </button>
          </div>
        </div>
      </div>

      <div class="container-fluid px-4 pb-5 flex-grow-1">
        <router-view />
      </div>
    </div>

    <div
      class="modal fade"
      id="createPackageModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-warning text-white">
            <h5 class="modal-title">
              <i class="bi bi-box-seam me-2"></i> Thêm gói dịch vụ mới
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitCreatePackage">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold"
                    >Tên gói <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="newPackage.package_name"
                    type="text"
                    class="form-control"
                    required
                    placeholder="VD: Gói VIP 1"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold"
                    >Giá (VNĐ) <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="newPackage.price"
                    type="number"
                    step="1000"
                    class="form-control"
                    required
                    placeholder="VD: 50000"
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-bold">Thời hạn (Ngày)</label>
                  <input
                    v-model="newPackage.duration_days"
                    type="number"
                    class="form-control"
                    placeholder="VD: 30"
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-bold">Số tin tối đa</label>
                  <input
                    v-model="newPackage.max_posts"
                    type="number"
                    class="form-control"
                    value="1"
                  />
                </div>

                <div class="col-md-4 d-flex align-items-end">
                  <div class="form-check mb-2">
                    <input
                      v-model="newPackage.is_highlight"
                      class="form-check-input"
                      type="checkbox"
                      id="isHighlightCheck"
                    />
                    <label
                      class="form-check-label fw-bold"
                      for="isHighlightCheck"
                    >
                      Là gói nổi bật?
                    </label>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label fw-bold">Mô tả gói</label>
                  <textarea
                    v-model="newPackage.description"
                    class="form-control"
                    rows="3"
                    placeholder="Nhập mô tả chi tiết về quyền lợi..."
                  ></textarea>
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
              @click="submitCreatePackage"
              class="btn btn-warning text-white"
              :disabled="creatingPackage"
            >
              <span
                v-if="creatingPackage"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              Lưu gói dịch vụ
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
// Import Bootstrap để xử lý modal JS nếu cần (thường Vue dùng global bootstrap object)
// declare var bootstrap: any;

export default {
  setup() {
    const router = useRouter();

    // --- Logic User cũ (Giữ nguyên) ---
    const newUser = ref({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      role: "renter",
    });
    const creating = ref(false);
    const openCreateUserModal = () => {
      const modal = new bootstrap.Modal(
        document.getElementById("createUserModal")
      );
      modal.show();
    };
    const submitCreateUser = async () => {
      /* ...code cũ... */
    };

    // --- [MỚI] Logic Package ---
    const newPackage = ref({
      package_name: "",
      price: 0,
      duration_days: 30,
      max_posts: 1,
      is_highlight: false, // Map với tinyint(1)
      description: "",
    });
    const creatingPackage = ref(false);

    const openCreatePackageModal = () => {
      // Reset form
      newPackage.value = {
        package_name: "",
        price: 0,
        duration_days: 30,
        max_posts: 1,
        is_highlight: false,
        description: "",
      };
      // Mở modal
      const modal = new bootstrap.Modal(
        document.getElementById("createPackageModal")
      );
      modal.show();
    };

    const submitCreatePackage = async () => {
      creatingPackage.value = true;
      try {
        // Chuẩn bị dữ liệu (convert boolean sang 0/1 nếu backend cần số)
        const payload = {
          ...newPackage.value,
          is_highlight: newPackage.value.is_highlight ? 1 : 0,
        };

        // GỌI API (Bạn cần có route này ở backend)
        await axios.post("/admin/packages", payload);

        alert("Thêm gói dịch vụ thành công!");

        // Đóng modal
        const modalElement = document.getElementById("createPackageModal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        // Nếu đang ở trang danh sách gói, có thể cần reload lại list
        // window.location.reload(); hoặc emit event update
      } catch (err) {
        alert(
          err.response?.data?.message ||
            "Lỗi thêm gói dịch vụ. Vui lòng thử lại!"
        );
      } finally {
        creatingPackage.value = false;
      }
    };

    return {
      router,
      pageTitle: "Admin Panel",
      // User
      openCreateUserModal,
      newUser,
      creating,
      submitCreateUser,
      // Package [MỚI]
      openCreatePackageModal,
      newPackage,
      creatingPackage,
      submitCreatePackage,
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
