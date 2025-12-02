<template>
  <footer class="bg-secondary-subtle py-5 mt-auto">
    <div class="container">
      <div class="row g-5">
        <!-- Cột 1: Logo + Mô tả -->
        <div class="col-lg-4 col-md-6">
          <h2 class="h3 fw-bold text-dark mb-3">
            <span class="border-3 border-bottom border-info pb-1 text-info">ThueTro</span>
          </h2>
          <p class="text-muted small lh-lg">
            ThueTro là nền tảng tìm kiếm và đăng tin thuê trọ nhanh nhất Việt
            Nam.<br />
            Hơn 500 tin mới mỗi ngày, 30.000 lượt truy cập, giúp bạn tìm được
            phòng ưng ý chỉ trong vài phút.
          </p>

          <!-- Icon mạng xã hội -->
          <div class="d-flex gap-3 mt-4">
            <a href="#" class="text-dark fs-4"
              ><i class="bi bi-facebook"></i
            ></a>
            <a href="#" class="text-dark fs-4"
              ><i class="bi bi-instagram"></i
            ></a>
            <a href="#" class="text-dark fs-4"><i class="bi bi-tiktok"></i></a>
            <a href="#" class="text-dark fs-4"><i class="bi bi-youtube"></i></a>
          </div>
        </div>

        <!-- Cột 2: Danh mục -->
        <div class="col-lg-2 col-md-6 col-6">
          <h5 class="fw-bold mb-4">Danh mục</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <a
                href="#"
                class="text-muted text-decoration-none hover-text-dark"
                >Phòng trọ</a
              >
            </li>
            <li class="mb-2">
              <a
                href="#"
                class="text-muted text-decoration-none hover-text-dark"
                >Chung cư mini</a
              >
            </li>
            <li class="mb-2">
              <a
                href="#"
                class="text-muted text-decoration-none hover-text-dark"
                >Nhà nguyên căn</a
              >
            </li>
            <li class="mb-2">
              <a
                href="#"
                class="text-muted text-decoration-none hover-text-dark"
                >Ở ghép</a
              >
            </li>
          </ul>
        </div>

        <!-- Cột 3: Hỗ trợ -->
        <div class="col-lg-3 col-md-6 col-6">
          <h5 class="fw-bold mb-4">Hỗ trợ</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <a
                href="#"
                class="text-muted text-decoration-none hover-text-dark"
                >Giới thiệu</a
              >
            </li>
            <li class="mb-2">
              <a
                href="#"
                class="text-muted text-decoration-none hover-text-dark"
                >Hướng dẫn đăng tin</a
              >
            </li>
            <li class="mb-2">
              <a
                href="#"
                class="text-muted text-decoration-none hover-text-dark"
                >Bảng giá dịch vụ</a
              >
            </li>
            <li class="mb-2">
              <a
                href="#"
                class="text-muted text-decoration-none hover-text-dark"
                >Quy định đăng tin</a
              >
            </li>
            <li class="mb-2">
              <a
                href="#"
                class="text-muted text-decoration-none hover-text-dark"
                >Liên hệ</a
              >
            </li>
          </ul>
        </div>

        <!-- Cột 4: Liên hệ -->
        <div class="col-lg-3 col-md-6">
          <h5 class="fw-bold mb-4">Liên hệ với chúng tôi</h5>
          <p class="text-muted small mb-2">
            <i class="bi bi-geo-alt-fill text-primary me-2"></i>
            123 Đường Láng, Đống Đa, Hà Nội
          </p>
          <p class="text-muted small mb-2">
            <i class="bi bi-telephone-fill text-primary me-2"></i>
            1900 1234
          </p>
          <p class="text-muted small mb-2">
            <i class="bi bi-envelope-fill text-primary me-2"></i>
            hotro@thuetronhanh.vn
          </p>
        </div>
      </div>

      <!-- Copyright -->
      <hr class="my-5" />
      <div class="text-center text-muted small">
        © 2025 ThueTro.vn | Tất cả các quyền được bảo lưu
      </div>
    </div>
  </footer>
</template>

<script setup>
// Không cần gì cả
</script>

<style scoped>
.hover-text-dark:hover {
  color: #212529 !important;
  transition: color 0.3s;
}

.border-primary {
  border-color: #0d6efd !important;
}
</style>
