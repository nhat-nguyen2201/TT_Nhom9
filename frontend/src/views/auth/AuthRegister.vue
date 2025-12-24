<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-gradient">
    <div class="card shadow-lg border-0" style="max-width: 420px; width: 100%">
      <div class="card-body p-5">
        <h2 class="text-center mb-4 fw-bold text-dark">
          Đăng Ký Tài Khoản Mới
        </h2>

        <form @submit.prevent="handleRegister">
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

          <div class="mb-3">
            <input
              type="text"
              class="form-control form-control-lg rounded-pill"
              placeholder="Nhập Email hoặc SĐT (10 số)"
              v-model.trim="form.phone_email"
              maxlength="100"
              required
              :disabled="isLoading"
              @input="checkInputType"
            />
            <small
              v-if="form.phone_email && !isValidPhoneEmail"
              class="text-danger d-block mt-2 ms-2"
            >
              ⚠️ Email hoặc Số điện thoại (10 số bắt đầu bằng 0) không hợp lệ
            </small>
          </div>

          <div class="mb-2 position-relative">
            <input
              :type="showPass ? 'text' : 'password'"
              class="form-control form-control-lg rounded-pill pe-5"
              placeholder="Mật khẩu"
              v-model="form.password"
              required
              :disabled="isLoading"
              @input="checkPasswordStrength"
            />
            <i
              class="bi position-absolute end-0 top-50 translate-middle-y me-4 fs-5 text-muted"
              :class="showPass ? 'bi-eye-slash' : 'bi-eye'"
              @click="showPass = !showPass"
              style="cursor: pointer; z-index: 10"
            ></i>
          </div>

          <div class="mb-3 ms-2" v-if="form.password">
            <small class="d-block" :class="passCriteria.length ? 'text-success' : 'text-muted'">
              <i class="bi" :class="passCriteria.length ? 'bi-check-circle-fill' : 'bi-circle'"></i> 
              Ít nhất 6 ký tự
            </small>
            <small class="d-block" :class="passCriteria.upper ? 'text-success' : 'text-muted'">
              <i class="bi" :class="passCriteria.upper ? 'bi-check-circle-fill' : 'bi-circle'"></i> 
              Có chữ in hoa (A-Z)
            </small>
            <small class="d-block" :class="passCriteria.special ? 'text-success' : 'text-muted'">
              <i class="bi" :class="passCriteria.special ? 'bi-check-circle-fill' : 'bi-circle'"></i> 
              Có ký tự đặc biệt (!@#...)
            </small>
          </div>

          <div class="mb-4 position-relative">
            <input
              :type="showConfirm ? 'text' : 'password'"
              class="form-control form-control-lg rounded-pill pe-5"
              placeholder="Xác nhận mật khẩu"
              v-model="form.confirmPassword"
              required
              :disabled="isLoading"
            />
            <i
              class="bi position-absolute end-0 top-50 translate-middle-y me-4 fs-5 text-muted"
              :class="showConfirm ? 'bi-eye-slash' : 'bi-eye'"
              @click="showConfirm = !showConfirm"
              style="cursor: pointer; z-index: 10"
            ></i>
            <small v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-danger d-block mt-1 ms-2">
               Mật khẩu không khớp
            </small>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold text-dark d-block mb-2 text-center">
              Bạn là:
            </label>
            <div class="d-flex gap-4 justify-content-center">
              <div class="form-check">
                <input class="form-check-input" type="radio" id="roleTenant" value="renter" v-model="form.role" :disabled="isLoading" />
                <label class="form-check-label" for="roleTenant">Người thuê</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" id="roleOwner" value="landlord" v-model="form.role" :disabled="isLoading" />
                <label class="form-check-label" for="roleOwner">Chủ nhà</label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
            :disabled="isLoading || !isValidForm"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
            {{ isLoading ? "Đang xử lý..." : "Đăng ký" }}
          </button>
        </form>

        <p class="text-center mt-4 mb-0 text-muted">
          Đã có tài khoản?
          <router-link to="/login" class="text-decoration-none fw-bold text-primary">
            Đăng nhập ngay
          </router-link>
        </p>
      </div>
    </div>
  </div>

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
        role: "renter", // Lưu ý: Backend dùng "renter" hoặc "landlord"
      },
      showPass: false,
      showConfirm: false,
      isLoading: false,
      
      // Trạng thái mật khẩu để hiển thị UI
      passCriteria: {
        length: false,
        upper: false,
        special: false
      }
    };
  },
  computed: {
    // Kiểm tra định dạng Phone/Email realtime
    isValidPhoneEmail() {
        if (!this.form.phone_email) return true; // Chưa nhập thì chưa báo lỗi
        const input = this.form.phone_email.trim();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
        // Regex Phone khớp với Backend: Bắt đầu số 0, tổng 10 số
        const isPhone = /^0\d{9}$/.test(input); 
        return isEmail || isPhone;
    },
    // Kiểm tra tổng thể form có hợp lệ không để enable nút Đăng ký
    isValidForm() {
        return (
            this.form.fullname.length >= 2 &&
            this.isValidPhoneEmail &&
            this.passCriteria.length &&
            this.passCriteria.upper &&
            this.passCriteria.special &&
            this.form.password === this.form.confirmPassword
        );
    }
  },
  methods: {
    // Hàm kiểm tra các tiêu chí mật khẩu
    checkPasswordStrength() {
        const pwd = this.form.password;
        this.passCriteria.length = pwd.length >= 6;
        this.passCriteria.upper = /[A-Z]/.test(pwd);
        this.passCriteria.special = /[\W_]/.test(pwd);
    },

    showToast(message, type = "danger") {
      const toast = document.createElement("div");
      toast.className = `alert alert-${type === "success" ? "success" : "danger"} alert-dismissible fade show position-fixed`;
      toast.style.cssText = `top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 12px;`;
      toast.innerHTML = `
        <strong>${type === "success" ? "Thành công!" : "Lỗi!"}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.getElementById("toast-container").appendChild(toast);
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    },

    async handleRegister() {
      // 1. Kiểm tra lại lần cuối trước khi gửi (Double check)
      if (!this.isValidForm) {
         this.showToast("Vui lòng kiểm tra lại thông tin nhập!", "danger");
         return;
      }

      this.isLoading = true;

      try {
        // Tách email và phone dựa trên ký tự '@'
        const isEmail = this.form.phone_email.includes("@");

        const payload = {
            full_name: this.form.fullname,
            email: isEmail ? this.form.phone_email : null,
            phone: isEmail ? null : this.form.phone_email,
            password: this.form.password,
            confirm_password: this.form.confirmPassword, // Backend cần field này
            role: this.form.role,
        };

        const response = await axios.post("http://localhost:5000/api/register", payload);

        if (response.data.status === "success") {
          this.showToast("Đăng ký thành công! Đang chuyển hướng...", "success");
          
          // Lưu token (nếu backend trả về luôn)
          if(response.data.token) {
              localStorage.setItem("token", response.data.token);
              localStorage.setItem("user", JSON.stringify(response.data.user));
          }

          setTimeout(() => {
            this.$router.push("/");
          }, 1500);
        }
      } catch (error) {
        const msg = error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!";
        this.showToast(msg, "danger");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Thêm style để checklist trông đẹp hơn */
.bi-check-circle-fill {
    margin-right: 5px;
}
.bi-circle {
    margin-right: 5px;
}
</style>