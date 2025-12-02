<template>
  <!-- Hero Section -->
  <section>
    <div class="container">
      <div class="row align-items-center g-5">
        <!-- Cột trái: Text + 3 ô chọn -->
        <div class="col-lg-6 col-12">
          <h1 class="display-4 fw-bold text-dark lh-base mb-4">
            Tìm nhanh, kiếm dễ trọ mới toàn quốc<br />
          </h1>

          <p class="text-secondary fs-5 mb-5">
            Trang thông tin và cho thuê phòng trọ nhanh chóng, hiệu quả<br />
            với hơn <strong>500 tin đăng mới</strong> và
            <strong>30.000 lượt xem mỗi ngày</strong>
          </p>

          <!-- 3 ô chọn dạng thẻ trắng bo góc -->
          <div
            class="bg-white rounded-4 shadow-sm p-4 d-flex flex-column flex-md-row gap-3 align-items-center"
          >
            <!-- Vị trí -->
            <div class="flex-fill">
              <label class="form-label text-muted mb-1">Vị trí</label>
              <select
                class="form-select form-select-lg rounded-pill border-0 shadow-sm"
              >
                <option>TP Hồ Chí Minh</option>
                <option>Hà Nội</option>
                <option>Đà Nẵng</option>
                <option>Cần Thơ</option>
              </select>
            </div>

            <!-- Lo1½ Loại -->
            <div class="flex-fill ">
              <label class="form-label text-muted mb-1">Loại</label>
              <select
                class="form-select form-select-lg rounded-pill border-0 shadow-sm "
              >
                <option>Phòng trọ</option>
                <option>Chung cư mini</option>
                <option>Nhà nguyên căn</option>
              </select>
            </div>

            <!-- Mức giá -->
            <div class="flex-fill">
              <label class="form-label text-muted mb-1">Mức giá</label>
              <select
                class="form-select form-select-lg rounded-pill border-0 shadow-sm"
              >
                <option>1 - 2 triệu</option>
                <option>2 - 3 triệu</option>
                <option>3 - 5 triệu</option>
                <option>Trên 5 triệu</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Cột phải: Ảnh nhà -->
        <div class="col-lg-6 col-12">
          <img
            src="/images/herohouse.png"
            alt="Ảnh nhà đẹp"
            class="w-100 h-100 object-fit-cover me-lg-0 mb-lg-0"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>
<style scoped>
.bg-hero {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  /* Nếu bạn muốn đúng màu hình thì dùng: */
  /* background-color: #f0f8f0; */
}

/* Làm cho thẻ trắng có góc bo mềm và đổ bóng nhẹ giống hình */
.rounded-4 {
  border-radius: 1.5rem !important;
}

/* Tinh chỉnh khoảng cách trên mobile */
@media (max-width: 768px) {
  .display-4 {
    font-size: 2.5rem;
  }
  img {
    margin-top: 2rem;
  }
}
</style>
