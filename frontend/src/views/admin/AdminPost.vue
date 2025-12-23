<template>
  <div class="p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0 fw-bold">Quản lý tin đăng</h3>
      <button @click="fetchPosts" class="btn btn-primary btn-sm">
        <i class="bi bi-arrow-clockwise"></i> Làm mới
      </button>
    </div>

    <!-- Table -->
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Người đăng</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody v-if="!loading">
            <tr v-for="post in posts" :key="post.post_id">
              <td>{{ post.post_id }}</td>

              <td class="fw-semibold">
                {{ post.title }}
              </td>

              <td>
                {{
                  post.landlord_name ||
                  `Chủ trọ ID ${post.landlord_id}` ||
                  "N/A"
                }}
              </td>

              <td>
                {{ formatPrice(post.price) }}
              </td>

              <td>
                <span
                  class="badge"
                  :class="
                    post.status === 'active' ? 'bg-success' : 'bg-secondary'
                  "
                >
                  {{ post.status === "active" ? "Hiển thị" : "Đã ẩn" }}
                </span>
              </td>

              <td>{{ formatDate(post.created_at) }}</td>

              <td class="text-center">
                <div class="d-flex justify-content-center gap-2">
                  <button
                    class="btn btn-sm btn-icon"
                    :class="
                      post.status === 'active'
                        ? 'btn-outline-warning'
                        : 'btn-outline-success'
                    "
                    @click="toggleStatus(post)"
                    :disabled="loadingId === post.post_id"
                    :title="
                      post.status === 'active' ? 'Ẩn bài viết' : 'Hiện bài viết'
                    "
                  >
                    <i
                      class="bi"
                      :class="
                        post.status === 'active'
                          ? 'bi-eye-slash-fill'
                          : 'bi-eye-fill'
                      "
                    ></i>
                  </button>

                  <button
                    class="btn btn-sm btn-outline-danger btn-icon"
                    @click="deletePost(post.post_id)"
                    :disabled="loadingId === post.post_id"
                    title="Xóa bài viết"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="p-5 text-center">
        <div class="spinner-border text-primary"></div>
        <p class="mt-3 text-muted">Đang tải danh sách bài đăng...</p>
      </div>

      <!-- Empty -->
      <div
        v-if="!loading && posts.length === 0"
        class="p-5 text-center text-muted"
      >
        <i class="bi bi-file-earmark-text fs-1"></i>
        <p>Chưa có bài đăng nào</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
const pageTitle = ref("Quản Lý Bài Đăng - Admin");
const posts = ref([]);
const loading = ref(true);
const loadingId = ref(null);

// ================== FETCH POSTS ==================
const fetchPosts = async () => {
  loading.value = true;
  try {
    const res = await axios.get("/admin/posts");
    posts.value = res.data.posts || [];
  } catch (err) {
    console.error("Fetch posts error:", err.response || err);
    alert("Lỗi tải danh sách bài đăng");
    posts.value = [];
  } finally {
    loading.value = false;
  }
};

// ================== TOGGLE STATUS ==================
const toggleStatus = async (post) => {
  // 1. Kiểm tra an toàn: Chỉ cho phép Ẩn/Hiện với bài Active hoặc Hidden
  // Bài Pending (chờ duyệt) hoặc Rejected (từ chối) không được dùng nút này
  if (post.status !== "active" && post.status !== "hidden") {
    alert(
      "Chỉ có thể Ẩn/Hiện bài đăng đã được duyệt (Active) hoặc đang bị ẩn (Hidden)."
    );
    return;
  }

  // 2. Xác định trạng thái mới
  // Nếu đang Active thì chuyển thành Hidden, ngược lại chuyển thành Active
  const newStatus = post.status === "active" ? "hidden" : "active";

  loadingId.value = post.post_id;
  try {
    await axios.patch(`/admin/posts/${post.post_id}/status`, {
      status: newStatus,
    });

    // Cập nhật giao diện ngay lập tức
    post.status = newStatus;

    // Dùng toast hoặc console.log thay vì alert cho đỡ phiền
    console.log("Cập nhật trạng thái thành công");
  } catch (err) {
    console.error("Toggle status error:", err);
    alert("Cập nhật thất bại: " + (err.response?.data?.message || err.message));
  } finally {
    loadingId.value = null;
  }
};

// ================== DELETE POST ==================
const deletePost = async (post) => {
  if (confirm(`XÓA bài đăng #${post.post_id}? Không thể khôi phục!`)) {
    try {
      await axios.delete(`/admin/posts/${post.post_id}`);
      posts.value = posts.value.filter((p) => p.post_id !== post.post_id);
      alert("Xóa thành công!");
    } catch (err) {
      alert("Lỗi xóa");
    }
  }
};
const approvePost = async (post) => {
  if (confirm(`Duyệt bài đăng #${post.post_id}?`)) {
    try {
      await axios.patch(`/admin/posts/${post.post_id}/status`, {
        status: "active",
      });
      post.status = "active"; // Cập nhật ngay trên giao diện
      alert("Đã duyệt thành công!");
    } catch (err) {
      alert("Lỗi khi duyệt: " + err.message);
    }
  }
};

const rejectPost = async (post) => {
  if (confirm(`Từ chối bài đăng #${post.post_id}?`)) {
    try {
      await axios.patch(`/admin/posts/${post.post_id}/status`, {
        status: "rejected",
      });
      post.status = "rejected";
      alert("Đã từ chối!");
    } catch (err) {
      alert("Lỗi khi từ chối");
    }
  }
};
// ================== FORMAT ==================
const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + " ₫";

// ================== INIT ==================
onMounted(fetchPosts);
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}

button {
  min-width: 70px;
}
.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px; /* Bo góc mềm mại */
  transition: all 0.2s;
}
.btn-icon:hover {
  transform: translateY(-2px); /* Hiệu ứng nhấc nhẹ khi hover */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
