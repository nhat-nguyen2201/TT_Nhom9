<template>
  <div
    class="min-vh-100 d-flex align-items-center justify-content-center bg-gradient"
  >
    <div class="card shadow-lg border-0" style="max-width: 420px; width: 100%">
      <div class="card-body p-5">
        <h2 class="text-center mb-4 fw-bold text-dark">
          Chào mừng bạn trở lại
        </h2>

        <form @submit.prevent="handleLogin">
          <!-- Email hoặc SĐT -->
          <div class="mb-3">
            <input
              type="text"
              class="form-control form-control-lg rounded-pill"
              placeholder="Email hoặc Số điện thoại"
              v-model.trim="form.phone_email"
              required
              :disabled="isLoading"
              autocomplete="username"
            />
          </div>

          <!-- Mật khẩu -->
          <div class="mb-3 position-relative">
            <input
              :type="showPass ? 'text' : 'password'"
              class="form-control form-control-lg rounded-pill pe-5"
              placeholder="Mật khẩu"
              v-model="form.password"
              required
              minlength="6"
              :disabled="isLoading"
              autocomplete="current-password"
            />
            <i
              class="bi position-absolute end-0 top-50 translate-middle-y me-4 fs-5 text-muted"
              :class="showPass ? 'bi-eye-slash' : 'bi-eye'"
              @click="showPass = !showPass"
              style="cursor: pointer; z-index: 10"
            ></i>
          </div>

          <!-- Quên mật khẩu / Đăng ký -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <router-link
              to="/forgot-password"
              class="text-decoration-none text-danger small"
            >
              Quên mật khẩu?
            </router-link>
            <router-link
              to="/register"
              class="text-decoration-none text-primary fw-bold"
            >
              Đăng ký
            </router-link>
          </div>

          <!-- Nút đăng nhập + loading -->
          <button
            type="submit"
            class="btn btn-danger btn-lg w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
            ></span>
            {{ isLoading ? "Đang đăng nhập..." : "Đăng nhập" }}
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- Toast container -->
  <div id="toast-container"></div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    return { router };
  },

  data() {
    return {
      form: {
        phone_email: "",
        password: "",
      },
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

    async handleLogin() {
      if (!this.form.phone_email || !this.form.password) {
        this.showToast("Vui lòng điền đầy đủ thông tin!", "danger");
        return;
      }

      this.isLoading = true;

      try {
        const res = await axios.post("http://localhost:5000/api/login", {
          phone_email: this.form.phone_email.trim(),
          password: this.form.password,
        });

        if (res.data.status === "success" && res.data.token) {
          const { token, user } = res.data;

          // ÉP role về chữ thường
          const normalizedUser = {
            ...user,
            role: (user.role || "tenant").toString().trim().toLowerCase(),
          };
       
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(normalizedUser));       

          this.showToast("Đăng nhập thành công!", "success");
          
          setTimeout(() => {
            if (normalizedUser.role === "admin") {
              this.router.replace("/admin/dashboard");
            } else {
              this.router.replace("/");
            }
          }, 600);
        }
      } catch (error) {
        const msg = error.response?.data?.message || "Sai thông tin đăng nhập!";
        this.showToast(msg, "danger");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

#toast-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  padding: 20px;
}
</style>
