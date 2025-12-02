<template>
  <div
    class="min-vh-100 d-flex align-items-center justify-content-center bg-gradient"
  >
    <div class="card shadow-lg border-0" style="max-width: 420px; width: 100%">
      <div class="card-body p-5">
        <h2 class="text-center mb-4 fw-bold text-dark">
          Đăng Ký Tài Khoản Mới
        </h2>

        <form @submit.prevent="handleRegister">
          <!-- Họ và tên -->
          <div class="mb-3">
            <input
              type="text"
              class="form-control form-control-lg rounded-pill"
              placeholder="Họ và Tên"
              v-model.trim="form.fullname"
              required
              :disabled="isLoading"
            />
          </div>

          <!-- Email hoặc SĐT -->
          <div class="mb-3">
            <input
              type="text"
              class="form-control form-control-lg rounded-pill"
              placeholder="Email hoặc Số điện thoại"
              v-model.trim="form.phone_email"
              maxlength="100"
              required
              :disabled="isLoading"
            />
            <small
              v-if="form.phone_email && !validatePhoneEmail(form.phone_email)"
              class="text-danger d-block mt-2"
            >
              ⚠️ Email hoặc SĐT không hợp lệ
            </small>
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
            />
            <i
              class="bi position-absolute end-0 top-50 translate-middle-y me-4 fs-5 text-muted"
              :class="showPass ? 'bi-eye-slash' : 'bi-eye'"
              @click="showPass = !showPass"
              style="cursor: pointer; z-index: 10"
            ></i>
          </div>

          <!-- Xác nhận mật khẩu -->
          <div class="mb-4 position-relative">
            <input
              :type="showConfirm ? 'text' : 'password'"
              class="form-control form-control-lg rounded-pill pe-5"
              placeholder="Xác nhận mật khẩu"
              v-model="form.confirmPassword"
              required
              minlength="6"
              :disabled="isLoading"
            />
            <i
              class="bi position-absolute end-0 top-50 translate-middle-y me-4 fs-5 text-muted"
              :class="showConfirm ? 'bi-eye-slash' : 'bi-eye'"
              @click="showConfirm = !showConfirm"
              style="cursor: pointer; z-index: 10"
            ></i>
          </div>

          <!-- Nút Đăng ký + Loading -->
          <button
            type="submit"
            class="btn btn-primary btn-lg w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
            ></span>
            {{ isLoading ? "Đang xử lý..." : "Đăng ký" }}
          </button>
        </form>

        <!-- Link đăng nhập -->
        <p class="text-center mt-4 mb-0 text-muted">
          Đã có tài khoản?
          <router-link
            to="/login"
            class="text-decoration-none fw-bold text-primary"
          >
            Đăng nhập ngay
          </router-link>
        </p>
      </div>
    </div>
  </div>

  <!-- Toast container  -->
  <div id="toast-container"></div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      form: {
        fullname: "",
        phone_email: "",
        password: "",
        confirmPassword: "",
      },
      showPass: false,
      showConfirm: false,
      isLoading: false,
    };
  },
  methods: {
    validatePhoneEmail(input) {
      const cleaned = input.trim().replace(/\s/g, "");
      const isEmail = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        cleaned
      );
      const isPhone = /^(03|05|07|08|09)\d{8}$/.test(cleaned);
      return isEmail || isPhone;
    },
    showToast(message, type = "danger") {
      const toast = document.createElement("div");
      toast.className = `alert alert-${
        type === "success" ? "success" : "danger"
      } alert-dismissible fade show position-fixed`;
      toast.style.cssText = `
        top: 20px; right: 20px; z-index: 9999; 
        min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 12px;
      `;
      toast.innerHTML = `
        <strong>${
          type === "success" ? "Thành công!" : "Lỗi!"
        }</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.getElementById("toast-container").appendChild(toast);
      setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("fade");
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    },

    async handleRegister() {
      if (this.form.password !== this.form.confirmPassword) {
        this.showToast("Mật khẩu xác nhận không khớp!", "danger");
        return;
      }
      if (this.form.password.length < 6) {
        this.showToast("Mật khẩu phải ít nhất 6 ký tự!", "danger");
        return;
      }
      if (!this.form.fullname || !this.form.phone_email) {
        this.showToast("Vui lòng điền đầy đủ thông tin!", "danger");
        return;
      }

      this.isLoading = true;

      try {
        const response = await axios.post(
          "http://localhost:5000/api/register",
          {
            full_name: this.form.fullname,
            email: this.form.phone_email.includes("@")
              ? this.form.phone_email
              : null,
            phone: this.form.phone_email.includes("@")
              ? null
              : this.form.phone_email,
            password: this.form.password,
            confirm_password: this.form.password,
          }
        );

        if (response.data.status === "success") {
          // ĐĂNG NHẬP TỰ ĐỘNG
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          this.showToast(
            "Đăng ký thành công! Chào mừng bạn đến với ThueTro!",
            "success"
          );

          setTimeout(() => {
            this.$router.push("/");
          }, 1500);
        }
      } catch (error) {
        const msg = error.response?.data?.message || "Đăng ký thất bại!";
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

/* Đảm bảo toast hiển thị tốt */
#toast-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  padding: 20px;
}
</style>
