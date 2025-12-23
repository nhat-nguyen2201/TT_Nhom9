<template>
  <div class="container py-5 bg-light-subtle min-vh-100">
    <div
      class="d-flex flex-wrap justify-content-between align-items-center mb-4"
    >
      <div>
        <h3 class="fw-bold text-dark mb-1">Quản lý tin đăng</h3>
        <p class="text-muted mb-0">
          Bạn đang có {{ posts.length }} tin đăng trên hệ thống
        </p>
      </div>
      <router-link
        to="/create-post"
        class="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-bold mt-3 mt-md-0"
      >
        <i class="bi bi-plus-lg me-1"></i> Đăng tin mới
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div
        class="spinner-border text-primary"
        role="status"
        style="width: 3rem; height: 3rem"
      >
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-3 text-muted">Đang tải danh sách tin...</p>
    </div>

    <div
      v-else-if="posts.length === 0"
      class="text-center py-5 bg-white rounded-4 shadow-sm"
    >
      <div class="mb-3">
        <img
          src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
          width="80"
          class="opacity-50"
        />
      </div>
      <h4 class="fw-bold text-secondary">Bạn chưa có tin đăng nào</h4>
      <p class="text-muted">Đăng tin ngay để tiếp cận hàng ngàn người thuê!</p>
      <router-link
        to="/create-post"
        class="btn btn-outline-primary rounded-pill mt-2"
      >
        Đăng tin ngay
      </router-link>
    </div>

    <div v-else class="row g-4">
      <div class="col-md-6 col-lg-4" v-for="post in posts" :key="post.post_id">
        <div
          class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 hover-shadow transition bg-white"
        >
          <div class="position-relative">
            <img
              :src="
                post.image ||
                post.images?.[0] ||
                'https://via.placeholder.com/400x300.png?text=No+Image'
              "
              class="card-img-top"
              alt="Ảnh phòng"
              style="height: 220px; object-fit: cover"
              @error="handleImageError"
            />

            <span
              class="position-absolute bottom-0 start-0 m-3 badge rounded-pill px-3 py-2 fw-bold shadow-sm"
              :class="getRoomTypeClass(post.room_type)"
            >
              <i class="bi bi-tag-fill me-1"></i>
              {{ formatRoomType(post.room_type) }}
            </span>

            <span
              class="position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-2 shadow-sm"
              :class="statusBadgeClass(post.status)"
            >
              {{ statusText(post.status) }}
            </span>

            <span
              v-if="post.is_vip"
              class="position-absolute top-0 start-0 m-3 badge bg-warning text-dark shadow-sm"
            >
              <i class="bi bi-crown-fill me-1"></i> VIP
            </span>
          </div>

          <div class="card-body d-flex flex-column p-4">
            <h5
              class="card-title fw-bold mb-2 text-truncate-2"
              :title="post.title"
            >
              {{ post.title }}
            </h5>

            <p class="text-muted small mb-3 text-truncate">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i>
              {{ post.address }}
            </p>

            <div class="d-flex align-items-center small text-secondary mb-3">
              <span class="me-3"
                ><i class="bi bi-rulers me-1"></i>{{ post.area }} m²</span
              >
              <span
                ><i class="bi bi-eye-fill me-1"></i
                >{{ post.view_count || 0 }} xem</span
              >
            </div>

            <div class="mt-auto pt-3 border-top border-light">
              <div class="mb-3">
                <span class="text-muted small d-block">Giá niêm yết</span>
                <span class="h4 fw-bold text-primary">
                  {{ formatPrice(post.price) }}/tháng
                </span>
              </div>

              <div class="d-grid gap-2 d-md-flex">
                <router-link
                  :to="`/my-posts/edit/${post.post_id}`"
                  class="btn btn-outline-primary rounded-pill fw-semibold flex-grow-1"
                >
                  <i class="bi bi-pencil-square me-1"></i> Sửa
                </router-link>

                <button
                  class="btn btn-outline-danger rounded-pill fw-semibold px-3"
                  @click="deletePost(post.post_id)"
                  title="Xóa tin này"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>

              <div class="text-center mt-2">
                <small class="text-muted" style="font-size: 0.75rem">
                  <i class="bi bi-clock me-1"></i>Hết hạn:
                  {{ formatDate(post.expired_at) }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const posts = ref([]);
const loading = ref(false);
const router = useRouter();

// --- 1. CALL API LẤY TIN ---
onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập!");
    router.push("/login");
    return;
  }

  loading.value = true;
  try {
    const res = await axios.get("http://localhost:5000/api/my-posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Xử lý dữ liệu trả về (tuỳ backend trả về mảng hay object)
    posts.value = Array.isArray(res.data) ? res.data : res.data.data || [];
  } catch (err) {
    console.error("Lỗi load my-posts:", err);
  } finally {
    loading.value = false;
  }
});

// --- 2. XÓA TIN ---
const deletePost = async (id) => {
  if (!confirm("Bạn chắc chắn muốn xóa tin này? Hành động không thể phục hồi."))
    return;

  const token = localStorage.getItem("token");
  try {
    await axios.delete(`http://localhost:5000/api/my-posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Xóa thành công thì lọc bỏ khỏi danh sách
    posts.value = posts.value.filter((p) => p.post_id !== id);
    alert("Đã xóa tin thành công!");
  } catch (error) {
    console.error("Lỗi xóa tin:", error);
    alert("Xóa thất bại!");
  }
};

// --- 3. CÁC HÀM FORMAT DISPLAY ---

const handleImageError = (e) => {
  e.target.src = "https://via.placeholder.com/400x300.png?text=No+Image";
};

const formatPrice = (price) => {
  if (!price) return "0 đ";
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1).replace(".0", "") + " triệu";
  }
  return new Intl.NumberFormat("vi-VN").format(price) + " đ";
};

const formatDate = (dateString) => {
  if (!dateString) return "Vô thời hạn";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const formatRoomType = (type) => {
  const map = {
    phong_tro: "Phòng trọ",
    chung_cu_mini: "Chung cư mini",
    nha_nguyen_can: "Nhà nguyên căn",
    can_ho: "Căn hộ",
    mat_bang: "Mặt bằng",
  };
  return map[type] || "Khác";
};

// Màu badge loại phòng
const getRoomTypeClass = (type) => {
  if (type === "phong_tro") return "bg-primary text-white";
  if (type === "chung_cu_mini") return "bg-success text-white";
  if (type === "nha_nguyen_can") return "bg-danger text-white";
  return "bg-secondary text-white";
};

// Màu badge trạng thái
const statusBadgeClass = (status) => {
  switch (status) {
    case "active":
      return "bg-success";
    case "pending":
      return "bg-warning text-dark";
    case "rejected":
      return "bg-danger";
    case "expired":
      return "bg-secondary";
    case "hidden":
      return "bg-dark";
    default:
      return "bg-secondary";
  }
};

// Text trạng thái
const statusText = (status) => {
  switch (status) {
    case "active":
      return "Đang hiển thị";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Từ chối";
    case "expired":
      return "Hết hạn";
    case "hidden":
      return "Đã ẩn";
    default:
      return status;
  }
};
</script>

<style scoped>
.hover-shadow:hover {
  transform: translateY(-5px);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.15) !important;
}
.transition {
  transition: all 0.3s ease-in-out;
}
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
