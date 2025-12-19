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
