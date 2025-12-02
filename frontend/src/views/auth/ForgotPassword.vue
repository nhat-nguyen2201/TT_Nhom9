<template>
  <div
    class="min-vh-100 d-flex align-items-center justify-content-center bg-gradient"
  >
    <div class="card shadow-lg border-0" style="max-width: 420px; width: 100%">
      <div class="card-body p-5">
        <h2 class="text-center mb-4 fw-bold text-danger">Quên mật khẩu?</h2>
        <p class="text-center text-muted mb-4">
          Nhập email để nhận link đặt lại mật khẩu!
        </p>

        <form @submit.prevent="submit">
          <div class="mb-4">
            <input
              type="email"
              class="form-control form-control-lg rounded-pill"
              placeholder="Nhập email của bạn"
              v-model="email"
              required
              :disabled="isLoading"
            />
          </div>

          <button
            type="submit"
            class="btn btn-danger btn-lg w-100 rounded-pill fw-bold"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            {{ isLoading ? "Đang gửi..." : "Gửi link đặt lại" }}
          </button>
        </form>

        <div class="text-center mt-4">
          <router-link to="/login" class="text-decoration-none">
            ← Quay lại đăng nhập
          </router-link>
        </div>

        <div v-if="message" class="alert alert-success mt-4 text-center">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "", // ← đổi từ phone_email thành email
      isLoading: false,
      message: "",
    };
  },
  methods: {
    async submit() {
      this.isLoading = true;
      this.message = "";

      try {
        const res = await axios.post(
          "http://localhost:5000/api/forgot-password",
          {
            email: this.email.trim(), 
          }
        );

        this.message = res.data.message;
      } catch (err) {
        this.message = "Có lỗi xảy ra, vui lòng thử lại!";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
