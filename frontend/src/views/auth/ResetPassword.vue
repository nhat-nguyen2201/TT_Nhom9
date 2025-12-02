<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-gradient">
    <div class="card shadow-lg border-0" style="max-width: 420px; width: 100%">
      <div class="card-body p-5">
        <h2 class="text-center mb-4 fw-bold text-danger">Đặt lại mật khẩu</h2>

        <form @submit.prevent="submit" v-if="!success">
          <div class="mb-3">
            <input
              type="password"
              class="form-control form-control-lg rounded-pill"
              placeholder="Mật khẩu mới"
              v-model="password"
              required
              minlength="6"
            />
          </div>
          <div class="mb-4">
            <input
              type="password"
              class="form-control form-control-lg rounded-pill"
              placeholder="Nhập lại mật khẩu"
              v-model="confirm"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-danger btn-lg w-100 rounded-pill fw-bold"
            :disabled="isLoading || password !== confirm"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            Xác nhận đặt lại
          </button>
        </form>

        <div v-if="success" class="text-center">
          <div class="alert alert-success">Đặt lại mật khẩu thành công!</div>
          <router-link to="/login" class="btn btn-outline-danger rounded-pill">
            ← Về trang đăng nhập
          </router-link>
        </div>

        <div v-if="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    return { route, router };
  },
  data() {
    return {
      token: this.$route.query.token || "",
      password: "",
      confirm: "",
      isLoading: false,
      success: false,
      error: ""
    };
  },
  mounted() {
    if (!this.token) {
      this.error = "Link không hợp lệ!";
    }
  },
  methods: {
    async submit() {
      if (this.password !== this.confirm) {
        this.error = "Mật khẩu không khớp!";
        return;
      }

      this.isLoading = true;
      this.error = "";

      try {
        const res = await axios.post("http://localhost:5000/api/reset-password", {
          token: this.token,
          password: this.password
        });

        if (res.data.status === "success") {
          this.success = true;
          setTimeout(() => this.router.push("/login"), 3000);
        }
      } catch (err) {
        this.error = err.response?.data?.message || "Link đã hết hạn hoặc không hợp lệ!";
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>