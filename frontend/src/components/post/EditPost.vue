<template>
  <div class="container-fluid py-4 bg-light-subtle min-vh-100">
    <div class="row justify-content-center">
      <div class="col-lg-10 col-xl-8">
        <div class="card shadow-lg border-0 rounded-4">
          <div class="card-header bg-warning text-dark text-center py-4">
            <h1 class="h3 mb-0 fw-bold">
              <i class="bi bi-pencil-square me-2"></i>
              Chỉnh sửa tin đăng
            </h1>
            <p class="mb-0 opacity-75 mt-2">
              Cập nhật thông tin chính xác giúp người thuê dễ tìm kiếm hơn
            </p>
          </div>

          <div v-if="loadingInitial" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="mt-2 text-muted">Đang tải dữ liệu tin đăng...</p>
          </div>

          <div v-else class="card-body p-4 p-lg-5">
            <form @submit.prevent="submitUpdate" enctype="multipart/form-data">
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
                    placeholder="VD: Phòng trọ giá rẻ Q.Bình Thạnh..."
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
                    <option value="can_ho">Căn hộ</option>
                    <option value="mat_bang">Mặt bằng</option>
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
                  rows="5"
                  class="form-control"
                  placeholder="Mô tả đầy đủ về phòng..."
                ></textarea>
              </div>

              <div class="mb-5">
                <label
                  class="form-label fw-bold d-block mb-3 text-uppercase text-muted small"
                >
                  Thông tin chi tiết
                </label>

                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label"
                      >Giá thuê/tháng <span class="text-danger">*</span></label
                    >
                    <div class="input-group input-group-lg">
                      <input
                        v-model.number="form.price"
                        type="number"
                        class="form-control"
                        required
                        min="500000"
                        step="10000"
                      />
                      <span class="input-group-text">₫</span>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Tiền cọc</label>
                    <div class="input-group input-group-lg">
                      <input
                        v-model.number="form.deposit"
                        type="number"
                        class="form-control"
                        min="0"
                        step="10000"
                      />
                      <span class="input-group-text">₫</span>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label"
                      >Diện tích <span class="text-danger">*</span></label
                    >
                    <div class="input-group input-group-lg">
                      <input
                        v-model.number="form.area"
                        type="number"
                        class="form-control"
                        required
                        min="5"
                      />
                      <span class="input-group-text">m²</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-5">
                <label class="form-label fw-bold mb-3 d-block">
                  <i class="bi bi-check2-square py-2 text-primary"></i>
                  Tiện ích có sẵn
                </label>

                <div
                  v-if="amenitiesList.length === 0"
                  class="text-center py-4 bg-light rounded-3"
                >
                  <div
                    class="spinner-border spinner-border-sm text-primary me-2"
                    role="status"
                  ></div>
                  <small>Đang tải tiện ích...</small>
                </div>

                <div v-else class="row g-3">
                  <div
                    v-for="amenity in amenitiesList"
                    :key="amenity.amenity_id"
                    class="col-sm-6 col-lg-4 col-xl-3"
                  >
                    <div
                      class="border rounded-3 p-3 h-100 d-flex align-items-center amenity-card"
                      :class="{
                        'border-primary bg-primary bg-opacity-10':
                          form.amenities.includes(amenity.amenity_id),
                      }"
                    >
                      <input
                        type="checkbox"
                        class="form-check-input me-3 mt-0 fs-5"
                        style="cursor: pointer"
                        :id="`amenity-${amenity.amenity_id}`"
                        :value="amenity.amenity_id"
                        v-model="form.amenities"
                      />

                      <label
                        :for="`amenity-${amenity.amenity_id}`"
                        class="form-check-label d-flex align-items-center w-100"
                        style="cursor: pointer"
                      >
                        <i
                          :class="`bi ${amenity.icon} me-2 text-primary fs-5 flex-shrink-0`"
                        ></i>
                        <span class="fw-medium">{{
                          amenity.amenity_name
                        }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <small class="text-muted mt-3 d-block fst-italic">
                  <i class="bi bi-info-circle me-1"></i>
                  Đã chọn:
                  <strong class="text-primary">{{
                    form.amenities.length
                  }}</strong>
                  tiện ích
                </small>
              </div>

              <div class="mb-5 p-4 bg-white rounded-3 shadow-sm border">
                <label class="form-label fw-bold text-success mb-3">
                  <i class="bi bi-geo-alt-fill me-2"></i>Địa chỉ phòng trọ
                </label>

                <div class="mb-3">
                  <label class="form-label"
                    >Số nhà, tên đường <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="form.street_address"
                    class="form-control form-control-lg"
                    required
                  />
                </div>

                <div class="row g-3">
                  <div class="col-md-4">
                    <select
                      v-model="selectedProvinceCode"
                      @change="onProvinceChange"
                      class="form-select form-select-lg"
                      required
                    >
                      <option value="">-- Tỉnh/Thành --</option>
                      <option
                        v-for="p in provinces"
                        :key="p.code"
                        :value="p.code"
                      >
                        {{ p.name_with_type }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <select
                      v-model="selectedDistrictCode"
                      @change="onDistrictChange"
                      class="form-select form-select-lg"
                      :disabled="!selectedProvinceCode"
                      required
                    >
                      <option value="">-- Quận/Huyện --</option>
                      <option
                        v-for="d in districts"
                        :key="d.code"
                        :value="d.code"
                      >
                        {{ d.name_with_type }}
                      </option>
                    </select>
                    <div
                      v-if="loadingDistricts"
                      class="spinner-border spinner-border-sm text-primary mt-1"
                    ></div>
                  </div>
                  <div class="col-md-4">
                    <select
                      v-model="selectedWardCode"
                      class="form-select form-select-lg"
                      :disabled="!selectedDistrictCode"
                      required
                    >
                      <option value="">-- Phường/Xã --</option>
                      <option v-for="w in wards" :key="w.code" :value="w.code">
                        {{ w.name_with_type }}
                      </option>
                    </select>
                    <div
                      v-if="loadingWards"
                      class="spinner-border spinner-border-sm text-primary mt-1"
                    ></div>
                  </div>
                </div>

                <div
                  v-if="fullAddressPreview"
                  class="mt-3 p-3 bg-light border-start border-4 border-success rounded"
                >
                  <small class="text-muted fw-bold text-uppercase"
                    >Địa chỉ hiển thị:</small
                  >
                  <div class="fw-bold text-dark fs-5">
                    {{ fullAddressPreview }}
                  </div>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold"
                    ><i class="bi bi-telephone-fill text-success me-1"></i>Số
                    điện thoại <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="form.contact_phone"
                    class="form-control form-control-lg"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold"
                    ><i class="bi bi-chat-dots-fill text-primary me-1"></i
                    >Zalo</label
                  >
                  <input
                    v-model="form.contact_zalo"
                    class="form-control form-control-lg"
                  />
                </div>
              </div>

              <div class="mb-5">
                <label class="form-label fw-bold mb-3 d-block">
                  <i class="bi bi-images me-2 text-warning"></i>
                  Hình ảnh (tối đa 15 ảnh)
                </label>

                <div
                  class="alert alert-warning d-flex align-items-center mb-4 shadow-sm border-warning border-opacity-25"
                  role="alert"
                >
                  <i
                    class="bi bi-exclamation-triangle-fill fs-4 me-3 text-warning"
                  ></i>
                  <div>
                    <strong>Lưu ý quan trọng:</strong>
                    Nếu bạn chọn ảnh mới,
                    <span class="text-danger fw-bold"
                      >TOÀN BỘ ẢNH CŨ SẼ BỊ XÓA</span
                    >
                    và thay thế bằng ảnh mới. Hãy để trống phần này nếu bạn muốn
                    giữ nguyên ảnh cũ.
                  </div>
                </div>

                <div
                  v-if="oldImages.length > 0 && previewImages.length === 0"
                  class="mb-4"
                >
                  <div
                    class="d-flex justify-content-between align-items-center mb-3"
                  >
                    <span class="text-muted small fw-bold text-uppercase"
                      >Ảnh hiện tại đang dùng:</span
                    >
                    <span class="badge bg-secondary"
                      >{{ oldImages.length }} ảnh</span
                    >
                  </div>

                  <div class="row g-3">
                    <div
                      class="col-6 col-md-4 col-lg-3 col-xl-2"
                      v-for="(img, idx) in oldImages"
                      :key="img.image_id || idx"
                    >
                      <div
                        class="position-relative rounded-3 overflow-hidden shadow-sm border h-100"
                      >
                        <img
                          :src="getBackendImageUrl(img.url || img.image_url)"
                          class="w-100 h-100"
                          style="object-fit: cover; min-height: 140px"
                        />
                        <span
                          v-if="img.is_primary || idx === 0"
                          class="position-absolute top-0 start-0 m-2 badge bg-success shadow-sm"
                          >Ảnh chính</span
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="dropzone p-5 border border-dashed border-primary rounded-4 text-center mb-4 bg-light bg-opacity-25"
                  @dragover.prevent="onDragOver"
                  @dragleave.prevent="onDragLeave"
                  @drop.prevent="onDrop"
                  @click="$refs.fileInput.click()"
                  :class="{
                    'bg-primary bg-opacity-10 border-primary': isDragOver,
                  }"
                >
                  <i
                    class="bi bi-cloud-arrow-up-fill fs-1 text-primary mb-3 d-block"
                  ></i>
                  <p class="mb-2 fw-semibold fs-5 text-dark">
                    {{
                      previewImages.length > 0
                        ? "Chọn thêm hoặc thay đổi ảnh khác"
                        : "Bấm để chọn ảnh mới thay thế"
                    }}
                  </p>
                  <small class="text-muted d-block">
                    JPG, PNG, WEBP • Kéo thả hoặc click để chọn
                  </small>

                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    @change="onFileChange"
                    class="d-none"
                  />
                </div>

                <div v-if="previewImages.length > 0">
                  <div
                    class="d-flex justify-content-between align-items-center mb-3"
                  >
                    <p class="text-success fw-bold mb-0">
                      <i class="bi bi-check-circle-fill me-2"></i>Ảnh mới sẽ
                      được lưu:
                    </p>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="cancelNewImages"
                    >
                      <i class="bi bi-x-circle me-1"></i>Hủy & Dùng lại ảnh cũ
                    </button>
                  </div>

                  <div class="row g-3">
                    <div
                      class="col-6 col-md-4 col-lg-3 col-xl-2 position-relative"
                      v-for="(img, index) in previewImages"
                      :key="index"
                    >
                      <div
                        class="rounded-3 overflow-hidden shadow-sm border position-relative group-hover"
                      >
                        <img
                          :src="img"
                          class="w-100"
                          style="height: 160px; object-fit: cover"
                          alt="Preview"
                        />

                        <div
                          v-if="index === 0"
                          class="position-absolute top-0 start-0 m-2 badge bg-primary text-white fw-bold px-3 py-2 rounded-pill shadow"
                          style="z-index: 10"
                        >
                          <i class="bi bi-star-fill me-1"></i> Ảnh chính
                        </div>

                        <button
                          @click.stop="removeImage(index)"
                          type="button"
                          class="position-absolute top-0 end-0 btn btn-danger btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-lg m-2"
                          style="width: 32px; height: 32px; z-index: 20"
                          title="Xóa ảnh này"
                        >
                          <i class="bi bi-x-lg fw-bold"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="d-flex justify-content-between align-items-center pt-3 border-top"
              >
                <button
                  type="button"
                  @click="$router.back()"
                  class="btn btn-outline-secondary px-4 btn-lg"
                >
                  <i class="bi bi-arrow-left me-2"></i>Hủy bỏ
                </button>
                <button
                  type="submit"
                  class="btn btn-warning px-5 btn-lg fw-bold shadow-sm"
                  :disabled="isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ isSubmitting ? "Đang cập nhật..." : "Lưu Thay Đổi" }}
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
import { ref, onMounted, computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const postId = route.params.id; 
const isDragOver = ref(false);

// ==================== STATE ====================
const loadingInitial = ref(true);
const isSubmitting = ref(false);

const form = reactive({
  title: "",
  description: "",
  price: null,
  deposit: null,
  area: null,
  room_type: "phong_tro",
  contact_phone: "",
  contact_zalo: "",
  amenities: [],
  street_address: "",
});

// Địa chỉ
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvinceCode = ref("");
const selectedDistrictCode = ref("");
const selectedWardCode = ref("");
const loadingDistricts = ref(false);
const loadingWards = ref(false);

// Tiện ích & Ảnh
const amenitiesList = ref([]);
const oldImages = ref([]); // Ảnh từ DB
const previewImages = ref([]); // Preview ảnh mới
const newFiles = ref([]); // File object để gửi lên server

// ==================== HELPER ĐỊA CHỈ ====================
const normalizeName = (name) => {
  if (!name) return "";
  return name
    .replace(/^(Tỉnh|Thành phố|Quận|Huyện|Thị xã|Phường|Xã|Thị trấn)\s+/i, "")
    .trim();
};

const fullAddressPreview = computed(() => {
  const p = provinces.value.find(
    (x) => x.code === selectedProvinceCode.value
  )?.name_with_type;
  const d = districts.value.find(
    (x) => x.code === selectedDistrictCode.value
  )?.name_with_type;
  const w = wards.value.find(
    (x) => x.code === selectedWardCode.value
  )?.name_with_type;
  const street = form.street_address;

  // Filter bỏ các giá trị rỗng và nối lại
  return [street, w, d, p, "Vietnam"].filter(Boolean).join(", ");
});

// ==================== LOAD DỮ LIỆU BAN ĐẦU ====================
onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập!");
      return router.push("/login");
    }

    // 1. Load danh sách Tỉnh/Thành
    const resProvinces = await fetch(
      "https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1"
    );
    const jsonProvinces = await resProvinces.json();
    provinces.value = jsonProvinces.data.data;

    const resAmenities = await axios.get(
      "http://localhost:5000/api/posts/amenities"
    ); // Gọi API lấy tiện ích
    amenitiesList.value = resAmenities.data || [];

    // 3. Load chi tiết tin đăng cần sửa
    const resPost = await axios.get(
      `http://localhost:5000/api/my-posts/${postId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const postData = resPost.data;

    // --- ĐỔ DỮ LIỆU VÀO FORM ---
    Object.assign(form, {
      title: postData.title,
      description: postData.description,
      price: postData.price,
      deposit: postData.deposit,
      area: postData.area,
      room_type: postData.room_type,
      contact_phone: postData.contact_phone,
      contact_zalo: postData.contact_zalo,
      amenities: postData.amenities || [],
      street_address: postData.address,
    });

    oldImages.value = postData.images || [];

    // --- LOGIC TỰ ĐỘNG CHỌN ĐỊA CHỈ  ---

    await reverseMapAddress(postData.city, postData.district, postData.ward);
  } catch (error) {
    console.error("Lỗi load dữ liệu:", error);
    alert("Không thể tải thông tin tin đăng.");
  } finally {
    loadingInitial.value = false;
  }
});
const getBackendImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150?text=No+Image";

  if (path.startsWith("http")) return path;

  return `http://localhost:5000${path}`;
};
// Hàm tìm lại Code từ Tên địa chỉ
const reverseMapAddress = async (cityName, districtName, wardName) => {
  // 1. Tìm Tỉnh
  const foundProvince = provinces.value.find((p) =>
    p.name_with_type.includes(normalizeName(cityName))
  );
  if (foundProvince) {
    selectedProvinceCode.value = foundProvince.code;

    // Load Huyện
    loadingDistricts.value = true;
    const resDist = await fetch(
      `https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${foundProvince.code}&limit=-1`
    );
    const jsonDist = await resDist.json();
    districts.value = jsonDist.data.data;
    loadingDistricts.value = false;

    // 2. Tìm Huyện
    const foundDistrict = districts.value.find((d) =>
      d.name_with_type.includes(normalizeName(districtName))
    );
    if (foundDistrict) {
      selectedDistrictCode.value = foundDistrict.code;

      // Load Xã
      loadingWards.value = true;
      const resWard = await fetch(
        `https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${foundDistrict.code}&limit=-1`
      );
      const jsonWard = await resWard.json();
      wards.value = jsonWard.data.data;
      loadingWards.value = false;

      // 3. Tìm Xã
      const foundWard = wards.value.find((w) =>
        w.name_with_type.includes(normalizeName(wardName))
      );
      if (foundWard) {
        selectedWardCode.value = foundWard.code;
      }
    }
  }
};

// ==================== WATCHERS ĐỊA CHỈ (KHI NGƯỜI DÙNG THAY ĐỔI) ====================
const onProvinceChange = async () => {
  districts.value = [];
  wards.value = [];
  selectedDistrictCode.value = "";
  selectedWardCode.value = "";
  if (!selectedProvinceCode.value) return;

  loadingDistricts.value = true;
  const res = await fetch(
    `https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${selectedProvinceCode.value}&limit=-1`
  );
  const json = await res.json();
  districts.value = json.data.data;
  loadingDistricts.value = false;
};

const onDistrictChange = async () => {
  wards.value = [];
  selectedWardCode.value = "";
  if (!selectedDistrictCode.value) return;

  loadingWards.value = true;
  const res = await fetch(
    `https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${selectedDistrictCode.value}&limit=-1`
  );
  const json = await res.json();
  wards.value = json.data.data;
  loadingWards.value = false;
};

// ==================== UPLOAD ẢNH ====================
const onFileChange = (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    newFiles.value = files;
    previewImages.value = files.map((file) => URL.createObjectURL(file));
  }
};

const cancelNewImages = () => {
  newFiles.value = [];
  previewImages.value = [];
};

// ==================== SUBMIT UPDATE ====================
const submitUpdate = async () => {
  isSubmitting.value = true;
  const token = localStorage.getItem("token");

  try {
    const fd = new FormData();

    // Append text fields
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("deposit", form.deposit || 0);
    fd.append("area", form.area);
    fd.append("room_type", form.room_type);
    fd.append("contact_phone", form.contact_phone);
    fd.append("contact_zalo", form.contact_zalo || "");

    // Địa chỉ: Lấy tên từ object (nếu người dùng có thay đổi) hoặc giữ nguyên
    const pName =
      provinces.value.find((p) => p.code === selectedProvinceCode.value)
        ?.name_with_type || "";
    const dName =
      districts.value.find((d) => d.code === selectedDistrictCode.value)
        ?.name_with_type || "";
    const wName =
      wards.value.find((w) => w.code === selectedWardCode.value)
        ?.name_with_type || "";

    fd.append("city", pName);
    fd.append("district", dName);
    fd.append("ward", wName);
    fd.append("address", form.street_address); // Tên đường

    // Tiện ích
    form.amenities.forEach((id) => fd.append("amenities[]", id));

    // Ảnh: Chỉ gửi nếu có ảnh mới
    if (newFiles.value.length > 0) {
      newFiles.value.forEach((file) => fd.append("images", file));
    }

    
    await axios.put(`/my-posts/${postId}`, fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Cập nhật tin thành công!");
    router.push("/my-posts"); // Quay về danh sách tin
  } catch (error) {
    console.error("Lỗi update:", error);
    alert(
      "Cập nhật thất bại: " + (error.response?.data?.message || "Lỗi server")
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.amenity-card {
  transition: all 0.2s;
}
.amenity-card:hover {
  border-color: #0d6efd !important;
}
.dropzone {
  cursor: pointer;
  transition: background 0.2s;
}
.dropzone:hover {
  background-color: #f8f9fa;
}
</style>
