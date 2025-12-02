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
          <!-- Thay toàn bộ 5 dòng này trong sidebar -->
          <li>
            <router-link
              to="/admin/dashboard"
              active-class="bg-white text-danger"
              class="nav-link text-white rounded px-3 py-2"
            >
              Dashboard
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/users"
              active-class="bg-white text-danger"
              class="nav-link text-white rounded px-3 py-2"
            >
              Quản lý người dùng
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/posts"
              active-class="bg-white text-danger"
              class="nav-link text-white rounded px-3 py-2"
            >
              Quản lý tin đăng
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/reports"
              active-class="bg-white text-danger"
              class="nav-link text-white rounded px-3 py-2"
            >
              Tin bị báo cáo
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/stats"
              active-class="bg-white text-danger"
              class="nav-link text-white rounded px-3 py-2"
            >
              Thống kê
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="p-3 border-top border-light">
        <button @click.prevent="logout" class="btn btn-outline-light w-100">
          Đăng xuất
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow-1">
      <div class="bg-white shadow-sm p-4 mb-4">
        <h2 class="mb-0">{{ pageTitle }}</h2>
      </div>
      <div class="container-fluid px-4">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router"; // THÊM DÒNG NÀY

export default {
  // THÊM setup() ĐỂ LẤY ROUTER
  setup() {
    const router = useRouter();
    return { router };
  },

  data() {
    return {
      form: { phone_email: "", password: "" },
      showPass: false,
      isLoading: false,
    };
  },

  methods: {
    showToast(message, type = "danger") {
      const toast = document.createElement("div");
      toast.className = `alert alert-${
        type === "success" ? "success" : "danger"
      } alert-dismissible fade show position-fixed`;
      toast.style.cssText = `top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 12px;`;
      toast.innerHTML = `
        <strong>${
          type === "success" ? "Thành công!" : "Lỗi!"
        }</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.getElementById("toast-container").appendChild(toast);
      setTimeout(() => toast.remove(), 4500);
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Tạo event để đồng bộ logout giữa các tab
      window.dispatchEvent(new Event("storage"));

      this.$router.push("/login");
    },
    async handleLogin() {
      this.isLoading = true;

      try {
        const res = await axios.post("http://localhost:5000/api/login", {
          phone_email: this.form.phone_email.trim(),
          password: this.form.password,
        });

        if (res.data.status === "success" && res.data.token) {
          const user = res.data.user;
          const normalizedUser = {
            ...user,
            role: (user.role || "tenant").toString().trim().toLowerCase(),
          };

          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(normalizedUser));

          this.showToast("Đăng nhập thành công!", "success");

          // DÙNG this.router (từ setup) THAY VÌ this.$router
          if (normalizedUser.role === "admin") {
            this.router.replace("/admin");
          } else {
            this.router.replace("/");
          }
        }
      } catch (error) {
        this.showToast(
          error.response?.data?.message || "Sai thông tin đăng nhập!",
          "danger"
        );
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style>
.bg-gradient-danger {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
}
</style>
