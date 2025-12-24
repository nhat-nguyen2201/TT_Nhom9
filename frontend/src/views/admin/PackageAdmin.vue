<template>
  <div class="package-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold">Quản lý Gói Dịch Vụ</h2>
      <button class="btn btn-warning text-white" @click="openCreateModal">
        <i class="bi bi-plus-circle-fill me-2"></i> Thêm gói mới
      </button>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Tên gói</th>
                <th>Giá (VNĐ)</th>
                <th>Thời hạn</th>
                <th>Tin đăng</th>
                <th>Trạng thái</th>
                <th class="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="packages.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  Chưa có gói dịch vụ nào.
                </td>
              </tr>
              <tr v-for="pkg in packages" :key="pkg.package_id">
                <td class="ps-4 fw-bold text-primary">
                  {{ pkg.package_name }}
                </td>
                <td class="fw-bold text-danger">
                  {{ formatPrice(pkg.price) }} đ
                </td>
                <td>{{ pkg.duration_days }} ngày</td>
                <td>{{ pkg.max_posts }} tin</td>
                <td>
                  <span
                    class="badge rounded-pill"
                    :class="pkg.is_highlight ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ pkg.is_highlight ? "Nổi bật" : "Thường" }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="openEditModal(pkg)"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(pkg)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="packageModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div
            class="modal-header"
            :class="
              isEditMode ? 'bg-primary text-white' : 'bg-warning text-white'
            "
          >
            <h5 class="modal-title">
              {{ isEditMode ? "Cập nhật gói dịch vụ" : "Thêm gói dịch vụ mới" }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold"
                    >Tên gói <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="currentPackage.package_name"
                    type="text"
                    class="form-control"
                    required
                    placeholder="VD: Gói VIP 1"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold"
                    >Giá (VNĐ) <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="currentPackage.price"
                    type="number"
                    step="1000"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Thời hạn (Ngày)</label>
                  <input
                    v-model="currentPackage.duration_days"
                    type="number"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Số tin tối đa</label>
                  <input
                    v-model="currentPackage.max_posts"
                    type="number"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-12">
                  <div class="form-check form-switch">
                    <input
                      v-model="currentPackage.is_highlight"
                      class="form-check-input"
                      type="checkbox"
                      id="highlightCheck"
                    />
                    <label class="form-check-label fw-bold" for="highlightCheck"
                      >Đặt làm gói Nổi Bật</label
                    >
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold">Mô tả</label>
                  <textarea
                    v-model="currentPackage.description"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <button type="submit" class="d-none"></button>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Đóng
            </button>
            <button
              @click="handleSubmit"
              type="button"
              class="btn"
              :class="isEditMode ? 'btn-primary' : 'btn-warning text-white'"
              :disabled="loading"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ isEditMode ? "Lưu thay đổi" : "Tạo mới" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- ===== GIAO DỊCH CHỜ DUYỆT ===== -->
  <div class="card shadow-sm border-0 mt-5">
    <div class="card-header bg-white">
      <h5 class="fw-bold text-warning mb-0">
        <i class="bi bi-hourglass-split me-2"></i>
        Giao dịch chờ duyệt
      </h5>
    </div>

    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="ps-4">Mã GD</th>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Gói</th>
              <th>Số tiền</th>
              <th>Ngày tạo</th>
              <th class="text-end pe-4">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="pendingTransactions.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                Không có giao dịch chờ duyệt
              </td>
            </tr>

            <tr v-for="trx in pendingTransactions" :key="trx.transaction_id">
              <td class="ps-4 fw-bold text-primary">
                {{ trx.transaction_ref }}
              </td>
              <td>{{ trx.full_name }}</td>
              <td>{{ trx.email }}</td>
              <td>{{ trx.package_name }}</td>
              <td class="fw-bold text-danger">
                {{ formatPrice(trx.amount) }} đ
              </td>
              <td>
                {{ new Date(trx.created_at).toLocaleString("vi-VN") }}
              </td>

              <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-2">
                  <!-- Nút Duyệt -->
                  <button
                    class="btn btn-sm btn-outline-success border-0 rounded-pill shadow-sm action-btn"
                    @click="approve(trx.transaction_id)"
                    title="Duyệt giao dịch"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                    <i class="bi bi-check-circle-fill fs-5"></i>
                  </button>

                  <!-- Nút Từ chối -->
                  <button
                    class="btn btn-sm btn-outline-danger border-0 rounded-pill shadow-sm action-btn"
                    @click="reject(trx.transaction_id)"
                    title="Từ chối giao dịch"
                  >
                    <i class="bi bi-x-circle-fill fs-5"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// State
const packages = ref([]);
const loading = ref(false);
const isEditMode = ref(false);
const modalInstance = ref(null);
const pendingTransactions = ref([]);

// Dữ liệu form
const currentPackage = ref({
  package_id: null,
  package_name: "",
  price: "",
  duration_days: 30,
  max_posts: 1,
  is_highlight: false,
  description: "",
});

// Load dữ liệu khi vào trang
onMounted(async () => {
  await loadPackages();
  await loadPendingTransactions();
});

// === CÁC HÀM API ===

// 1. Lấy danh sách gói
async function loadPackages() {
  try {
    // Gọi API: GET /admin/packages
    // axios đã cấu hình baseURL trong main.js nên chỉ cần viết đoạn đuôi
    const res = await axios.get("/admin/packages");

    // Backend trả về: { success: true, data: [...] }
    if (res.data && res.data.data) {
      packages.value = res.data.data;
    } else {
      packages.value = [];
    }
  } catch (err) {
    console.error(err);
    alert("Không tải được danh sách gói!");
  }
}

// 2. Xử lý Lưu (Tạo mới hoặc Cập nhật)
async function handleSubmit() {
  loading.value = true;
  try {
    // Chuẩn bị dữ liệu (convert boolean sang số nếu backend cần, hoặc giữ nguyên nếu backend đã handle)
    const payload = {
      ...currentPackage.value,
      is_highlight: currentPackage.value.is_highlight ? 1 : 0,
    };

    if (isEditMode.value) {
      // --- CẬP NHẬT (PUT) ---
      // API: PUT /admin/packages/:id
      await axios.put(`/admin/packages/${payload.package_id}`, payload);
      alert("Cập nhật thành công!");
    } else {
      // --- TẠO MỚI (POST) ---
      // API: POST /admin/packages
      await axios.post("/admin/packages", payload);
      alert("Thêm gói mới thành công!");
    }

    // Tải lại danh sách & Đóng modal
    await loadPackages();
    hideModal();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Đã có lỗi xảy ra!");
  } finally {
    loading.value = false;
  }
}

// 3. Xóa gói
async function confirmDelete(pkg) {
  if (!confirm(`Bạn chắc chắn muốn xóa gói "${pkg.package_name}"?`)) return;

  try {
    // API: DELETE /admin/packages/:id
    await axios.delete(`/admin/packages/${pkg.package_id}`);
    alert("Xóa thành công!");
    await loadPackages();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Lỗi khi xóa!");
  }
}
async function loadPendingTransactions() {
  try {
    const res = await axios.get("/admin/transactions/pending");
    pendingTransactions.value = res.data.data || [];
  } catch (err) {
    console.error(err);
    alert("Không tải được giao dịch chờ duyệt!");
  }
}
async function approve(id) {
  if (!confirm("Xác nhận duyệt giao dịch này?")) return;

  try {
    await axios.patch(`/admin/transactions/${id}/approve`);
    alert("Duyệt thành công");
    loadPendingTransactions();
  } catch (err) {
    alert("Lỗi khi duyệt giao dịch");
  }
}

async function reject(id) {
  if (!confirm("Bạn chắc chắn muốn từ chối giao dịch này?")) return;

  try {
    await axios.patch(`/admin/transactions/${id}/reject`);
    alert("Đã từ chối giao dịch");
    loadPendingTransactions();
  } catch (err) {
    alert("Lỗi khi từ chối giao dịch");
  }
}

// === CÁC HÀM UI/UX (Modal) ===

function openCreateModal() {
  resetForm();
  isEditMode.value = false;
  showModal();
}

function openEditModal(pkg) {
  // Copy dữ liệu vào form
  currentPackage.value = {
    ...pkg,
    // Backend trả về 0/1, convert sang false/true cho checkbox
    is_highlight: pkg.is_highlight === 1 || pkg.is_highlight === true,
  };
  isEditMode.value = true;
  showModal();
}

function resetForm() {
  currentPackage.value = {
    package_id: null,
    package_name: "",
    price: "",
    duration_days: 30,
    max_posts: 1,
    is_highlight: false,
    description: "",
  };
}

// Hàm format tiền tệ
function formatPrice(value) {
  if (!value) return "0";
  return new Intl.NumberFormat("vi-VN").format(value);
}

// Xử lý đóng/mở Modal bằng JS thuần (hoặc dùng bootstrap object nếu import)
function showModal() {
  const modalEl = document.getElementById("packageModal");
  if (window.bootstrap) {
    modalInstance.value = new window.bootstrap.Modal(modalEl);
    modalInstance.value.show();
  } else {
    // Fallback nếu không có window.bootstrap (ít khi xảy ra nếu đã cài bootstrap)
    alert("Lỗi thư viện Bootstrap JS");
  }
}

function hideModal() {
  if (modalInstance.value) {
    modalInstance.value.hide();
  } else {
    // Cố gắng tìm và đóng nếu biến instance bị mất
    const modalEl = document.getElementById("packageModal");
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}
</script>

<style scoped>
/* CSS tùy chỉnh nhỏ */
.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  color: #6c757d;
}
.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  transform: translateY(0);
}
</style>
