<!-- src/views/admin/UserManagement.vue -->
<template>
  <div class="p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0">Quản lý người dùng</h3>
      <div>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm theo tên, email, sđt..."
          class="form-control form-control-sm d-inline-block w-auto me-2"
        />
        <button @click="fetchUsers" class="btn btn-primary btn-sm">
          <i class="bi bi-arrow-clockwise"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- Bảng người dùng -->
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div
                    class="avatar me-3 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 40px; height: 40px"
                  >
                    {{ user.full_name?.charAt(0).toUpperCase() || "U" }}
                  </div>
                  <strong>{{ user.full_name || "Chưa đặt tên" }}</strong>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || "Chưa có" }}</td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-success': user.role === 'admin',
                    'bg-info': user.role === 'landlord',
                    'bg-secondary': user.role === 'renter',
                  }"
                >
                  {{ user.role.toUpperCase() }}
                </span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="user.is_blocked ? 'bg-danger' : 'bg-success'"
                >
                  {{ user.is_blocked ? "Bị khóa" : "Hoạt động" }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td class="text-center">
                <button
                  @click="toggleBlockUser(user)"
                  class="btn btn-sm"
                  :class="user.is_blocked ? 'btn-success' : 'btn-warning'"
                  :disabled="loadingId === user.id"
                >
                  <i
                    :class="user.is_blocked ? 'bi bi-unlock' : 'bi bi-lock'"
                  ></i>
                  {{ user.is_blocked ? "Mở khóa" : "Khóa" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Loading & Empty state -->
      <div class="p-5 text-center" v-if="loading">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3">Đang tải danh sách người dùng...</p>
      </div>
      <div class="p-5 text-center text-muted" v-else-if="users.length === 0">
        <i class="bi bi-people fs-1"></i>
        <p>Chưa có người dùng nào</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const users = ref([]);
const loading = ref(true);
const loadingId = ref(null);
const searchQuery = ref("");

const toast = (msg, type = "success") => {
  alert(msg); 
};

// Lấy danh sách người dùng
const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await axios.get("/admin/users");
    users.value = res.data || [];
  } catch (err) {
    console.error("API error:", err.response?.data || err);
    toast("Lỗi tải danh sách người dùng!", "danger");
  } finally {
    loading.value = false;
  }
};

// Khóa / Mở khóa – giữ nguyên vì đã đúng
const toggleBlockUser = async (user) => {
  if (user.role === "admin") {
    toast("Không thể khóa tài khoản Admin!", "danger");
    return;
  }

  loadingId.value = user.id;
  try {
    await axios.patch(`/admin/users/${user.id}/block`, {
      is_blocked: !user.is_blocked,
    });

    user.is_blocked = !user.is_blocked;
    toast(
      user.is_blocked
        ? `Đã khóa tài khoản ${user.full_name}`
        : `Đã mở khóa tài khoản ${user.full_name}`,
      "success"
    );
  } catch (err) {
    console.error("Block error:", err.response?.data);
    toast("Thao tác thất bại!", "danger");
  } finally {
    loadingId.value = null;
  }
};

// Tìm kiếm
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
  );
});

// Format ngày
const formatDate = (date) => {
  return new Date(date).toLocaleString("vi-VN");
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.avatar {
  font-weight: bold;
  font-size: 1.1rem;
}
.badge {
  font-size: 0.85rem;
}
</style>
