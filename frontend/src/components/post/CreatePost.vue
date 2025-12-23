<template>
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-lg-10 col-xl-8">
        <div class="card shadow-lg border-0">
          <div class="card-header bg-primary text-white text-center py-4">
            <h1 class="h3 mb-0 fw-bold">
              <i class="bi bi-house-door-fill me-2"></i>
              Đăng tin phòng trọ mới
            </h1>
            <p class="mb-0 opacity-75 mt-2">
              Tạo tin đăng hấp dẫn để thu hút người thuê nhanh chóng
            </p>
          </div>

          <div class="card-body p-4 p-lg-5">
            <form @submit.prevent="submitPost" enctype="multipart/form-data">
              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="progress" style="height: 8px">
                  <div
                    class="progress-bar bg-success"
                    role="progressbar"
                    :style="{ width: progress + '%' }"
                    :aria-valuenow="progress"
                  ></div>
                </div>
                <small class="text-muted">Bước {{ step }}/6</small>
              </div>

              <!-- 1. Tiêu đề & Mô tả -->
              <div class="row mb-4">
                <div class="col-md-8">
                  <label class="form-label fw-bold">
                    <i class="bi bi-tag-fill text-primary me-1"></i>
                    Tiêu đề <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.title"
                    required
                    class="form-control form-control-lg"
                    placeholder="VD: Phòng trọ giá rẻ Q.Bình Thạnh, full nội thất"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-star-fill text-warning me-1"></i>
                    Loại phòng
                  </label>
                  <select
                    v-model="form.room_type"
                    class="form-select form-select-lg"
                  >
                    <option value="phong_tro">Phòng trọ</option>
                    <option value="can_ho_mini">Chung cư mini</option>
                    <option value="nha_nguyen_can">Nhà nguyên căn</option>
                  </select>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="bi bi-card-text text-info me-1"></i>
                  Mô tả chi tiết
                </label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="form-control"
                  placeholder="Mô tả đầy đủ về phòng: nội thất, tiện ích, điều kiện sinh hoạt..."
                ></textarea>
              </div>
              <!-- 2. Giá cả & Diện tích -->
              <div class="mb-5">
                <label class="form-label fw-bold d-block mb-3">
                  <i class="bi bi-currency-exchange text-success me-2"></i>
                  Giá thuê, tiền cọc & diện tích
                  <span class="text-danger">*</span>
                </label>

                <div class="row g-3">
                  <!-- Giá thuê/tháng -->
                  <div class="col-md-4">
                    <label class="form-label">
                      <i class="bi bi-cash-stack text-success me-1"></i>
                      Giá thuê/tháng <span class="text-danger">*</span>
                    </label>
                    <div class="input-group input-group-lg">
                      <input
                        v-model.number="form.price"
                        type="number"
                        min="500000"
                        max="50000000"
                        step="10000"
                        class="form-control"
                        placeholder="VD: 3500000"
                        required
                      />
                      <span class="input-group-text">₫</span>
                    </div>
                    <small class="text-muted">Từ 500.000₫ → 50 triệu</small>
                  </div>

                  <!-- Tiền cọc (tùy chọn) -->
                  <div class="col-md-4">
                    <label class="form-label">
                      <i class="bi bi-piggy-bank text-warning me-1"></i>
                      Tiền cọc (tùy chọn)
                    </label>
                    <div class="input-group input-group-lg">
                      <input
                        v-model.number="form.deposit"
                        type="number"
                        min="0"
                        max="100000000"
                        step="10000"
                        class="form-control"
                        placeholder="VD: 2000000"
                      />
                      <span class="input-group-text">₫</span>
                    </div>
                    <small class="text-muted"
                      >Để trống nếu không yêu cầu cọc</small
                    >
                  </div>

                  <!-- Diện tích -->
                  <div class="col-md-4">
                    <label class="form-label">
                      <i class="bi bi-rulers text-info me-1"></i>
                      Diện tích <span class="text-danger">*</span>
                    </label>
                    <div class="input-group input-group-lg">
                      <input
                        v-model.number="form.area"
                        type="number"
                        min="5"
                        max="100"
                        step="1"
                        class="form-control"
                        placeholder="VD: 25"
                        required
                      />
                      <span class="input-group-text">m²</span>
                    </div>
                    <small class="text-muted">Từ 5m² → 100m²</small>
                  </div>
                </div>
              </div>
              <!-- 2. Giá & Diện tích -->
              <div class="mb-4">
                <label class="form-label fw-bold px-2 d-block">
                  <i class="bi bi-check2-square py-2 text-primary"></i>
                  Tiện ích có sẵn
                </label>

                <!-- Loading -->
                <div
                  v-if="amenities.length === 0"
                  class="text-center py-4 bg-light rounded-3"
                >
                  <div
                    class="spinner-border spinner-border-sm text-primary me-2"
                    role="status"
                  ></div>
                  <small>Đang tải tiện ích...</small>
                </div>

                <!-- Danh sách tiện ích -->
                <div v-else class="row g-3">
                  <div
                    v-for="amenity in amenities"
                    :key="amenity.amenity_id"
                    class="col-sm-6 col-lg-4 col-xl-3"
                  >
                    <div
                      class="border rounded-3 p-3 h-100 d-flex align-items-start"
                      :class="{
                        'border-primary bg-primary bg-opacity-10':
                          form.amenities.includes(amenity.amenity_id),
                      }"
                    >
                      <input
                        type="checkbox"
                        class="form-check-input me-2 mt-1"
                        :id="`amenity-${amenity.amenity_id}`"
                        :value="amenity.amenity_id"
                        v-model="form.amenities"
                      />

                      <label
                        :for="`amenity-${amenity.amenity_id}`"
                        class="form-check-label d-flex align-items-center"
                      >
                        <i
                          :class="`bi ${amenity.icon} me-2 text-primary fs-5 flex-shrink-0`"
                        ></i>
                        <span>{{ amenity.amenity_name }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <small class="text-muted mt-2 d-block">
                  {{ form.amenities.length }}/{{ amenities.length }} tiện ích
                  được chọn
                </small>
              </div>

              <!-- 3. Địa chỉ chi tiết -->
              <div class="mb-5">
                <label class="form-label fw-bold d-block mb-3">
                  <i class="bi bi-geo-alt-fill text-danger me-2"></i>
                  Địa chỉ phòng trọ <span class="text-danger">*</span>
                </label>

                <!-- Input số nhà / tên đường -->
                <div class="mb-3">
                  <label class="form-label">
                    <i class="bi bi-signpost-2-fill text-primary me-1"></i>
                    Số nhà, tên đường / Ấp / Khu phố
                    <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.street_address"
                    type="text"
                    class="form-control form-control-lg"
                    placeholder="VD: 180 Cao Lỗ"
                    required
                    @input="updateFullAddress"
                  />
                  <small class="text-muted">
                    Nhập chính xác số nhà và tên đường để người thuê dễ tìm
                  </small>
                </div>

                <div class="row g-3">
                  <!-- Tỉnh/Thành phố -->
                  <div class="col-md-4">
                    <select
                      v-model="selectedProvinceCode"
                      @change="onProvinceChange"
                      class="form-select form-select-lg"
                      required
                    >
                      <option value="">-- Chọn tỉnh/thành --</option>
                      <option
                        v-for="p in provinces"
                        :key="p.code"
                        :value="p.code"
                      >
                        {{ p.name_with_type }}
                      </option>
                    </select>
                  </div>

                  <!-- Quận/Huyện -->
                  <div class="col-md-4">
                    <select
                      v-model="selectedDistrictCode"
                      @change="onDistrictChange"
                      :disabled="!selectedProvinceCode || loadingDistricts"
                      class="form-select form-select-lg"
                      required
                    >
                      <option value="">-- Chọn quận/huyện --</option>
                      <option
                        v-for="d in districts"
                        :key="d.code"
                        :value="d.code"
                      >
                        {{ d.name_with_type }}
                      </option>
                    </select>
                    <div v-if="loadingDistricts" class="text-center mt-2">
                      <div
                        class="spinner-border spinner-border-sm text-primary"
                        role="status"
                      ></div>
                    </div>
                  </div>

                  <!-- Phường/Xã -->
                  <div class="col-md-4">
                    <select
                      v-model="selectedWardCode"
                      :disabled="!selectedDistrictCode || loadingWards"
                      class="form-select form-select-lg"
                      required
                    >
                      <option value="">-- Chọn phường/xã --</option>
                      <option v-for="w in wards" :key="w.code" :value="w.code">
                        {{ w.name_with_type }}
                      </option>
                    </select>
                    <div v-if="loadingWards" class="text-center mt-2">
                      <div
                        class="spinner-border spinner-border-sm text-primary"
                        role="status"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Preview địa chỉ đầy đủ -->
                <div
                  v-if="fullAddressPreview && selectedWardCode"
                  class="mt-4 p-4 bg-light border border-success rounded-3 shadow-sm"
                >
                  <p class="mb-2 fw-semibold text-success">
                    <i class="bi bi-check-circle-fill me-2"></i>Địa chỉ đầy đủ
                    sẽ được lưu:
                  </p>
                  <p class="mb-0 fs-5 text-dark fw-medium">
                    {{ fullAddressPreview }}
                  </p>
                  <small class="text-muted d-block mt-2">
                    Địa chỉ này sẽ dùng để tìm vị trí trên bản đồ và hiển thị
                    cho người thuê
                  </small>
                </div>

                <!-- Thông báo nếu chưa đủ -->
                <small v-else class="text-muted d-block mt-3">
                  <i class="bi bi-info-circle me-1"></i>
                  Vui lòng nhập số nhà/tên đường và chọn đầy đủ Tỉnh → Quận →
                  Phường.
                </small>
              </div>
              <!-- 4. Thông tin liên hệ -->
              <div class="row mb-4">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">
                    <i class="bi bi-telephone-fill text-success me-1"></i>
                    Số điện thoại <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.contact_phone"
                    required
                    class="form-control form-control-lg"
                    placeholder="0909 xxx xxx"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">
                    <i class="bi bi-chat-dots-fill text-success me-1"></i>
                    Zalo (tùy chọn)
                  </label>
                  <input
                    v-model="form.contact_zalo"
                    class="form-control form-control-lg"
                    placeholder="0909 xxx xxx"
                  />
                </div>
              </div>

              <!-- 6. Upload ảnh -->
              <div class="mb-5">
                <label class="form-label fw-bold mb-3 d-block">
                  <i class="bi bi-images me-2 text-warning"></i>
                  Ảnh phòng (tối đa 15 ảnh)
                </label>
                <div
                  class="dropzone p-4 border border-dashed border-primary rounded-3 text-center mb-4"
                  @dragover.prevent="onDragOver"
                  @dragleave.prevent="onDragLeave"
                  @drop.prevent="onDrop"
                  :class="{
                    'bg-primary bg-opacity-10 border-primary-subtle':
                      isDragOver,
                  }"
                >
                  <i
                    class="bi bi-cloud-arrow-up-fill fs-1 text-primary mb-3 d-block"
                  ></i>
                  <p class="mb-2 fw-semibold">Kéo thả ảnh vào đây hoặc</p>
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    @change="onFileChange"
                    class="d-none"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-primary px-4"
                    @click="$refs.fileInput.click()"
                  >
                    Chọn ảnh
                  </button>
                  <small class="text-muted d-block mt-2">
                    JPG, PNG, WEBP • Tối đa 10MB/ảnh • Ít nhất 3 ảnh
                  </small>
                </div>

                <!-- Preview ảnh -->
                <!-- Preview ảnh – ĐÃ SỬA NÚT X + THÊM NỀN TRONG SUỐT -->
                <div v-if="previewImages.length > 0" class="row g-3 mt-4">
                  <div
                    v-for="(img, index) in previewImages"
                    :key="index"
                    class="col-6 col-md-4 col-lg-3 col-xl-2 position-relative"
                  >
                    <!-- Ảnh -->
                    <div class="rounded-3 overflow-hidden shadow-sm border">
                      <img
                        :src="img"
                        class="w-100"
                        style="height: 160px; object-fit: cover"
                        alt="Preview"
                      />
                    </div>

                    <!-- Badge "Chính" cho ảnh đầu tiên -->
                    <div
                      v-if="index === 0"
                      class="position-absolute top-0 start-0 m-2 badge bg-primary text-white fw-bold px-3 py-2 rounded-pill shadow"
                      style="z-index: 10"
                    >
                      <i class="bi bi-star-fill me-1"></i> Ảnh chính
                    </div>

                    <!-- Nút XÓA – ĐÃ SỬA ĐẸP, KHÔNG BỊ CHE -->
                    <button
                      @click="removeImage(index)"
                      type="button"
                      class="position-absolute top-0 end-0 btn btn-danger btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                      style="
                        width: 36px;
                        height: 36px;
                        z-index: 20;
                        transform: translate(50%, -50%);
                      "
                      title="Xóa ảnh này"
                    >
                      <i class="bi bi-x-lg fw-bold"></i>
                    </button>
                  </div>
                </div>
                <small v-else class="text-muted">
                  <i class="bi bi-info-circle me-1"></i>
                  Ảnh đẹp, rõ nét sẽ giúp tin của bạn nổi bật hơn!
                </small>
              </div>

              <!-- Nút submit -->
              <div class="d-grid gap-2 d-md-flex justify-content-md-between">
                <button
                  type="button"
                  @click="$router.back()"
                  class="btn btn-outline-secondary btn-lg px-4"
                >
                  <i class="bi bi-arrow-left me-2"></i>Quay lại
                </button>
                <button
                  type="submit"
                  class="btn btn-primary btn-lg px-5 fw-bold"
                  :disabled="isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  <i v-else class="bi bi-send-fill me-2"></i>
                  {{ isSubmitting ? "Đang đăng tin..." : "Đăng tin ngay" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

// ==================== FORM ====================
const form = ref({
  title: "",
  description: "",
  price: null,
  deposit: null,
  area: null,
  room_type: "",
  contact_phone: "",
  contact_zalo: "",
  amenities: [],
  street_address: "", // Số nhà + tên đường
});

// ==================== ĐỊA CHỈ VIỆT NAM ====================
const provinces = ref([]);
const allDistricts = ref([]);
const allWards = ref([]);

const districts = ref([]);
const wards = ref([]);

const selectedProvinceCode = ref("");
const selectedDistrictCode = ref("");
const selectedWardCode = ref("");

const loadingDistricts = ref(false);
const loadingWards = ref(false);
const loadingInitial = ref(true);

// Computed lấy object hiện tại
const selectedProvince = computed(() =>
  provinces.value.find((p) => p.code === selectedProvinceCode.value)
);
const selectedDistrict = computed(() =>
  districts.value.find((d) => d.code === selectedDistrictCode.value)
);
const selectedWard = computed(() =>
  wards.value.find((w) => w.code === selectedWardCode.value)
);

// ==================== CHUẨN HÓA TÊN ĐỊA CHỈ ====================
const normalizeLocationName = (nameWithType, type) => {
  if (!nameWithType) return "";

  // Loại bỏ prefix như "Phường", "Quận", "Thành phố"
  const prefixes = [
    "Phường",
    "Xã",
    "Thị trấn",
    "Quận",
    "Huyện",
    "Thị xã",
    "Thành phố",
    "Tỉnh",
  ];

  let normalized = nameWithType.trim();

  for (const prefix of prefixes) {
    const regex = new RegExp(`^${prefix}\\s+`, "i");
    normalized = normalized.replace(regex, "");
  }

  return normalized.trim();
};

const fullAddressPreview = computed(() => {
  const parts = [];

  // 1. Số nhà + tên đường (giữ nguyên)
  if (form.value.street_address?.trim()) {
    parts.push(form.value.street_address.trim());
  }

  // 2. Phường (thêm prefix "Phường")
  if (selectedWard.value) {
    const wardName = normalizeLocationName(
      selectedWard.value.name_with_type,
      "ward"
    );

    parts.push(`Phường ${wardName}`);
  }

  // 3. Quận/Huyện (phân biệt Quận số vs Huyện chữ)
  if (selectedDistrict.value) {
    const districtName = normalizeLocationName(
      selectedDistrict.value.name_with_type,
      "district"
    );

    // Nếu là số → "Quận X", nếu là chữ → "Huyện X"
    const isNumeric = /^\d+$/.test(districtName);
    const prefix = isNumeric ? "Quận" : "Huyện";
    parts.push(`${prefix} ${districtName}`);
  }

  // 4. Thành phố/Tỉnh
  if (selectedProvince.value) {
    const provinceName = selectedProvince.value.name_with_type;
    parts.push(provinceName);
  }
  parts.push("Vietnam");
  return parts.join(", ");
});

// ==================== GỬI ĐẾN BACKEND ====================
const addressForBackend = computed(() => ({
  address: fullAddressPreview.value,
  ward: selectedWard.value?.name_with_type || "",
  district: selectedDistrict.value?.name_with_type || "",
  city: selectedProvince.value?.name_with_type || "",
}));

// Load tỉnh/thành
const loadProvinces = async () => {
  try {
    const res = await fetch(
      "https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1"
    );
    if (!res.ok) throw new Error("API tỉnh lỗi");

    const json = await res.json();
    let list = json.data?.data || json.data || [];

    // CHỈ GIỮ 4 THÀNH PHỐ LỚN
    const allowedProvinceCodes = ["01", "79", "48", "92"];

    provinces.value = list.filter((p) => allowedProvinceCodes.includes(p.code));

    // Sắp xếp theo thứ tự mong muốn
    const order = ["79", "01", "48", "92"]; // HCM → HN → ĐN → CT
    provinces.value.sort(
      (a, b) => order.indexOf(a.code) - order.indexOf(b.code)
    );
  } catch (err) {
    console.error("Lỗi load tỉnh:", err);
    alert("Không tải được danh sách tỉnh/thành!");
  }
};

// Load tất cả quận/huyện
const loadAllDistricts = async () => {
  try {
    const res = await fetch(
      "https://vn-public-apis.fpo.vn/districts/getAll?limit=-1"
    );
    if (!res.ok) throw new Error("API quận lỗi");
    const json = await res.json();
    allDistricts.value = json.data?.data || json.data || [];
  } catch (err) {
    console.error("Lỗi load districts:", err);
  }
};

// Load tất cả phường/xã
const loadAllWards = async () => {
  try {
    const res = await fetch(
      "https://vn-public-apis.fpo.vn/wards/getAll?limit=-1"
    );
    if (!res.ok) throw new Error("API phường lỗi");
    const json = await res.json();
    allWards.value = json.data?.data || json.data || [];
  } catch (err) {
    console.error("Lỗi load wards:", err);
  }
};

// Khi chọn tỉnh
const onProvinceChange = () => {
  districts.value = [];
  wards.value = [];
  selectedDistrictCode.value = "";
  selectedWardCode.value = "";
  loadingDistricts.value = true;

  if (selectedProvinceCode.value) {
    districts.value = allDistricts.value.filter(
      (d) => d.parent_code === selectedProvinceCode.value
    );
  }
  loadingDistricts.value = false;
};

// Khi chọn quận
const onDistrictChange = () => {
  wards.value = [];
  selectedWardCode.value = "";
  loadingWards.value = true;

  if (selectedDistrictCode.value) {
    wards.value = allWards.value.filter(
      (w) => w.parent_code === selectedDistrictCode.value
    );
  }
  loadingWards.value = false;
};

// Load dữ liệu ban đầu
onMounted(async () => {
  loadingInitial.value = true;
  await Promise.all([loadProvinces(), loadAllDistricts(), loadAllWards()]);
  loadingInitial.value = false;
});

// ==================== TIỆN ÍCH ====================
const amenities = ref([]);
onMounted(async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/posts/amenities");
    amenities.value = res.data;
  } catch (err) {
    console.error("Lỗi load tiện ích:", err);
  }
});

// ==================== UPLOAD ẢNH ====================
const images = ref([]);
const previewImages = ref([]);
const isDragOver = ref(false);
const fileInput = ref(null);

const onFileChange = (e) => {
  const files = Array.from(e.target.files || []);
  images.value = [...images.value, ...files].slice(0, 15);
  updatePreviews();
  nextTick(() => fileInput.value && (fileInput.value.value = ""));
};

const updatePreviews = () => {
  previewImages.value = [];
  images.value.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => previewImages.value.push(ev.target.result);
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  images.value.splice(index, 1);
  previewImages.value.splice(index, 1);
};

const onDrop = (e) => {
  isDragOver.value = false;
  const files = Array.from(e.dataTransfer.files).filter((f) =>
    f.type.startsWith("image/")
  );
  if (files.length) {
    images.value = [...images.value, ...files].slice(0, 15);
    updatePreviews();
  }
};

const onDragOver = (e) => {
  e.preventDefault();
  isDragOver.value = true;
};
const onDragLeave = () => (isDragOver.value = false);

// ==================== SUBMIT ====================
const isSubmitting = ref(false);
const submitPost = async () => {
  // Validation cơ bản
  if (images.value.length < 3) {
    return alert("Vui lòng upload ít nhất 3 ảnh!");
  }

  if (!form.value.title?.trim()) {
    return alert("Vui lòng nhập tiêu đề!");
  }

  if (!form.value.price || !form.value.area) {
    return alert("Vui lòng nhập giá và diện tích!");
  }

  if (!form.value.contact_phone?.trim()) {
    return alert("Vui lòng nhập số điện thoại!");
  }

  if (!form.value.street_address?.trim()) {
    return alert("Vui lòng nhập số nhà, tên đường!");
  }

  if (
    !selectedProvinceCode.value ||
    !selectedDistrictCode.value ||
    !selectedWardCode.value
  ) {
    return alert("Vui lòng chọn đầy đủ Tỉnh → Quận → Phường/Xã!");
  }

  if (!fullAddressPreview.value) {
    return alert("Địa chỉ chưa hoàn chỉnh!");
  }

  isSubmitting.value = true;

  const fd = new FormData();

  // Các field text
  fd.append("title", form.value.title.trim());
  fd.append("description", form.value.description || "");
  fd.append("price", form.value.price);
  fd.append("deposit", form.value.deposit || 0);
  fd.append("area", form.value.area);
  fd.append("room_type", form.value.room_type);
  fd.append("contact_phone", form.value.contact_phone.trim());
  fd.append("contact_zalo", form.value.contact_zalo || "");

  // ĐỊA CHỈ - CHUẨN HÓA ĐÚNG FORMAT
  const addressData = addressForBackend.value;
  fd.append("address", form.value.street_address.trim()); 
  fd.append("ward", addressData.ward); // Phường Tân Phú
  fd.append("district", addressData.district); // Quận 7
  fd.append("city", addressData.city); // Thành phố Hồ Chí Minh

  // Debug: Xem địa chỉ đang gửi
  console.log("=== ĐỊA CHỈ GỬI ĐI ===");
  console.log("address:", addressData.address);
  console.log("ward:", addressData.ward);
  console.log("district:", addressData.district);
  console.log("city:", addressData.city);

  // Amenities
  form.value.amenities.forEach((id) => fd.append("amenities[]", id));

  // Ảnh
  images.value.forEach((img) => fd.append("images", img));

  try {
    const response = await axios.post(
      "http://localhost:5000/api/posts/create",
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    // Log thông tin tọa độ trả về
    console.log("=== RESPONSE TỌA ĐỘ ===");
    console.log(response.data.data?.coordinates);

    alert("Đăng tin thành công! Tin đang chờ duyệt.");
    router.push("/");
  } catch (err) {
    console.error("Lỗi đăng tin:", err);
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.errors?.join(", ") ||
      "Đăng tin thất bại, vui lòng thử lại!";
    alert(errorMsg);
  } finally {
    isSubmitting.value = false;
  }
};

// ==================== PROGRESS BAR ====================
const step = computed(() => {
  let count = 0;
  if (form.value.title) count++;
  if (form.value.price && form.value.area) count++;
  if (fullAddressPreview.value && selectedWardCode.value) count++;
  if (form.value.contact_phone) count++;
  if (form.value.amenities.length > 0) count++;
  if (images.value.length >= 3) count++;
  return Math.min(count, 6);
});

const progress = computed(() => Math.round((step.value / 6) * 100));
</script>

<style scoped>
.amenity-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.amenity-card:hover {
  background-color: rgba(13, 110, 253, 0.05) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
}

.dropzone {
  transition: all 0.2s ease;
  cursor: pointer;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
