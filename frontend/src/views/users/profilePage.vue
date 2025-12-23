<template>
  <div class="container py-5">
    <div class="card shadow-sm border-0 mb-5 overflow-hidden">
      <div class="bg-primary bg-opacity-10" style="height: 100px"></div>

      <div class="card-body px-4 pb-4">
        <div class="row align-items-end" style="margin-top: -60px">
          <div class="col-md-3 col-lg-2 text-center text-md-start">
            <div class="position-relative d-inline-block">
              <img
                :src="user.avatar || defaultAvatar"
                class="rounded-circle border border-4 border-white shadow-sm bg-white"
                width="140"
                height="140"
                style="object-fit: cover"
              />
              <span
                class="position-absolute bottom-0 start-50 translate-middle-x badge rounded-pill border border-2 border-white"
                :class="user.role === 'landlord' ? 'bg-success' : 'bg-info'"
              >
                {{ user.role === "landlord" ? "Chủ nhà" : "Người thuê" }}
              </span>
            </div>
          </div>

          <div class="col-md-9 col-lg-10 mt-3 mt-md-0">
            <div
              class="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end"
            >
              <div class="text-center text-md-start mb-3 mb-md-0">
                <h3 class="fw-bold mb-1">{{ user.full_name }}</h3>
                <p class="text-muted mb-0 small">
                  <i class="far fa-calendar-alt me-1"></i>
                  Tham gia ngày {{ formatDate(user.created_at) }}
                </p>
              </div>
            </div>

            <div class="row mt-4 g-3">
              <div class="col-sm-6 col-md-4">
                <div class="p-3 border rounded bg-light h-100">
                  <small
                    class="text-uppercase text-muted fw-bold"
                    style="font-size: 0.7rem"
                    >Email</small
                  >
                  <div class="fw-medium text-truncate" :title="user.email">
                    {{ user.email }}
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-md-4">
                <div class="p-3 border rounded bg-light h-100">
                  <small
                    class="text-uppercase text-muted fw-bold"
                    style="font-size: 0.7rem"
                    >Số điện thoại</small
                  >
                  <div class="fw-medium">
                    {{ user.phone || "Chưa cập nhật" }}
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-md-4">
                <div class="p-3 border rounded bg-light h-100">
                  <small
                    class="text-uppercase text-muted fw-bold"
                    style="font-size: 0.7rem"
                    >Loại tài khoản</small
                  >
                  <div class="fw-medium text-primary">
                    {{ user.role === "landlord" ? "Chủ trọ" : "Người tìm trọ" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
        <h5 class="fw-bold text-dark border-start border-4 border-primary ps-3">
          Gói dịch vụ
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3 justify-content-center">
          <div
            class="col-md-6 col-lg-4"
            v-for="pkg in packages"
            :key="pkg.package_id"
          >
            <div
              class="card h-100 pricing-card border-0 shadow-sm"
              :class="Number(pkg.price) > 0 ? 'vip-package' : 'basic-package'"
            >
              <div
                v-if="Number(pkg.price) > 0"
                class="position-absolute top-0 end-0 m-2"
              >
                <span
                  class="badge bg-warning text-dark shadow-sm"
                  style="font-size: 0.7rem"
                >
                  <i class="fas fa-crown me-1"></i> VIP
                </span>
              </div>

              <div class="card-body d-flex flex-column text-center p-3">
                <h6 class="text-uppercase fw-bold text-muted mb-2">
                  {{ pkg.package_name }}
                </h6>

                <div class="price-tag mb-2">
                  <span
                    class="h3 fw-bold"
                    :class="
                      Number(pkg.price) > 0 ? 'text-primary' : 'text-dark'
                    "
                  >
                    {{ formatPriceSimple(pkg.price) }}
                  </span>
                  <span class="text-muted small"
                    >/ {{ pkg.duration_days }} ngày</span
                  >
                </div>

                <hr class="w-25 mx-auto text-muted mb-3" />

                <ul
                  class="list-unstyled mb-3 flex-grow-1 text-start px-2 small"
                >
                  <li class="mb-2 d-flex align-items-center">
                    <span
                      class="me-2"
                      :class="
                        Number(pkg.price) > 0
                          ? 'text-success'
                          : 'text-secondary'
                      "
                      >✔</span
                    >
                    <span>{{ pkg.description || "Đăng tin tiêu chuẩn" }}</span>
                  </li>
                  <li class="mb-2 d-flex align-items-center">
                    <span
                      class="me-2"
                      :class="
                        Number(pkg.price) > 0
                          ? 'text-success'
                          : 'text-secondary'
                      "
                      >✔</span
                    >
                    <span>Hiển thị {{ pkg.duration_days }} ngày</span>
                  </li>
                  <li
                    v-if="Number(pkg.price) > 0"
                    class="mb-2 d-flex align-items-center"
                  >
                    <span class="me-2 text-success">✔</span>
                    <strong>Lên Top đầu trang</strong>
                  </li>
                </ul>

                <button
                  class="btn w-100 py-2 fw-bold rounded-pill transition-btn btn-sm"
                  :class="
                    Number(pkg.price) > 0
                      ? 'btn-primary shadow-primary'
                      : 'btn-outline-secondary'
                  "
                  @click="Number(pkg.price) > 0 ? handleBuyPackage(pkg) : null"
                >
                  {{ Number(pkg.price) > 0 ? "Nâng cấp ngay" : "Gói miễn phí" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="vietqrModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold">
            <i class="fas fa-qrcode me-2"></i>Quét mã để thanh toán
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
          ></button>
        </div>

        <div class="modal-body text-center p-4">
          <div class="mb-3 text-muted">
            Sử dụng App ngân hàng hoặc MoMo/ZaloPay để quét
          </div>

          <div
            class="position-relative d-inline-block border rounded p-2 mb-3 bg-white shadow-sm"
          >
            <img
              v-if="qrUrl"
              :src="qrUrl"
              alt="QR Code"
              class="img-fluid"
              style="max-width: 300px; min-height: 300px"
            />
            <div
              v-else
              class="d-flex align-items-center justify-content-center"
              style="width: 300px; height: 300px"
            >
              <div class="spinner-border text-primary" role="status"></div>
            </div>
          </div>

          <div class="alert alert-light border text-start small mt-2">
            <p class="mb-1"><strong>Ngân hàng:</strong> {{ myBank.bankId }}</p>
            <p class="mb-1">
              <strong>Số tài khoản:</strong> {{ myBank.accountNo }}
            </p>
            <p class="mb-1">
              <strong>Chủ tài khoản:</strong> {{ myBank.accountName }}
            </p>
            <p class="mb-0 text-danger">
              <strong>Nội dung CK:</strong> {{ transactionRef }}
            </p>
          </div>

          <p class="text-danger fst-italic small">
            * Vui lòng giữ nguyên "Nội dung CK" để hệ thống tự động nhận diện.
          </p>
        </div>

        <div class="modal-footer justify-content-center border-0 pb-4">
          <button
            type="button"
            class="btn btn-outline-secondary px-4"
            data-bs-dismiss="modal"
          >
            Để sau
          </button>
          <button
            type="button"
            class="btn btn-success px-4 fw-bold"
            @click="finishPayment"
          >
            <i class="fas fa-check-circle me-2"></i> Tôi đã chuyển khoản
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Modal } from "bootstrap";
export default {
  data() {
    return {
      user: {},
      packages: [],
      defaultAvatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",

      qrUrl: "", 
      transactionRef: "", 
      paymentModal: null, 

      
      myBank: {
        bankId: "MB", 
        accountNo: "1170302326",
        accountName: "PHAM VAN NHAT NGUYEN",
      },
    };
  },
  async mounted() {
    await this.fetchProfile();
    await this.fetchPackages();
    const modalElement = document.getElementById("vietqrModal");
    if (modalElement) {
      this.paymentModal = new Modal(modalElement);
    }
  },
  methods: {
    async fetchProfile() {
      try {
        const userStr = localStorage.getItem("user");
        const userData = JSON.parse(userStr);
        const userId = userData.user_id;
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/profile/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.user = res.data.data;
      } catch (error) {
        console.error("Lỗi lấy profile:", error);
      }
    },
    async fetchPackages() {
      try {
        const res = await axios.get("/profile/packages");
        this.packages = res.data.data; 
      } catch (error) {
        console.error("Lỗi lấy packages:", error);
      }
    },
    async handleBuyPackage(pkg) {
  
      const userStr = localStorage.getItem("user");
      if (!userStr) return alert("Vui lòng đăng nhập!");
      const userData = JSON.parse(userStr);
      const userId = userData.user_id || userData.id;

      try {

        const res = await axios.post(
          "http://localhost:5000/api/payment/create",
          {
            userId: userId,
            packageId: pkg.package_id,
            amount: pkg.price,
          }
        );

        if (res.data.success) {

          this.transactionRef = res.data.transactionRef;

        
          const amount = pkg.price;
          const content = this.transactionRef;

          this.qrUrl = `https://img.vietqr.io/image/${this.myBank.bankId}-${this.myBank.accountNo}-compact2.png?amount=${amount}&addInfo=${content}&accountName=${this.myBank.accountName}`;

          this.paymentModal.show();
        }
      } catch (error) {
        console.error("Lỗi tạo thanh toán:", error);
        alert("Không thể tạo đơn hàng lúc này.");
      }
    },
    finishPayment() {
      alert(
        "Cảm ơn bạn! Hệ thống đang xử lý giao dịch. Vui lòng chờ Admin duyệt."
      );
      this.paymentModal.hide();

    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN");
    },
    formatPrice(price) {
      return price === 0 ? "Miễn phí" : price.toLocaleString("vi-VN") + " đ";
    },
    formatPriceSimple(price) {
      const num = Number(price);
      return num === 0 ? "0" : num.toLocaleString("vi-VN");
    },
  },
};
</script>
