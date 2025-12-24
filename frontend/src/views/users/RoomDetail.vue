<template>
  <div class="container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">Đang tải chi tiết phòng...</p>
    </div>

    <div v-else-if="room" class="room-detail-container">
      <div class="mb-4">
        <h1 class="h2 fw-bold text-dark mb-2">{{ room.title }}</h1>
        <div class="d-flex align-items-center text-muted">
          <i class="bi bi-geo-alt-fill text-danger me-2"></i>
          <span class="small">{{ room.full_address }}</span>
        </div>
      </div>

      <div class="mb-4">
        <div
          id="imageCarousel"
          class="carousel slide rounded-4 overflow-hidden shadow-sm"
          data-bs-ride="carousel"
        >
          <div class="carousel-indicators">
            <button
              v-for="(img, index) in room.images"
              :key="index"
              type="button"
              data-bs-target="#imageCarousel"
              :data-bs-slide-to="index"
              :class="{ active: index === 0 }"
            ></button>
          </div>
          <div class="carousel-inner">
            <div
              v-for="(img, index) in room.images"
              :key="index"
              class="carousel-item"
              :class="{ active: index === 0 }"
            >
              <img
                :src="img.url"
                class="d-block w-100 object-fit-cover"
                alt="Ảnh phòng"
                style="height: 480px"
              />
            </div>
          </div>
          <button
            class="carousel-control-prev"
            type="button"
            data-bs-target="#imageCarousel"
            data-bs-slide="prev"
          >
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button
            class="carousel-control-next"
            type="button"
            data-bs-target="#imageCarousel"
            data-bs-slide="next"
          >
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>
      </div>

      <div class="row g-4 mb-5">
        <div class="col-lg-8">
          <div class="d-flex flex-wrap gap-3 border-bottom pb-4 mb-4">
            <div class="info-badge d-flex align-items-center me-3">
              <div class="icon-box bg-light p-2 rounded-3 me-2">
                <i class="bi bi-rulers text-primary"></i>
              </div>
              <div>
                <small class="text-muted d-block" style="font-size: 0.75rem"
                  >Diện tích</small
                >
                <span class="fw-bold">{{ room.area }} m²</span>
              </div>
            </div>
            <div class="info-badge d-flex align-items-center me-3">
              <div class="icon-box bg-light p-2 rounded-3 me-2">
                <i class="bi bi-house-door text-success"></i>
              </div>
              <div>
                <small class="text-muted d-block" style="font-size: 0.75rem"
                  >Loại phòng</small
                >
                <span class="fw-bold">{{ room.room_type }}</span>
              </div>
            </div>
            <div class="info-badge d-flex align-items-center">
              <div class="icon-box bg-light p-2 rounded-3 me-2">
                <i class="bi bi-piggy-bank text-warning"></i>
              </div>
              <div>
                <small class="text-muted d-block" style="font-size: 0.75rem"
                  >Tiền cọc</small
                >
                <span class="fw-bold">{{
                  room.deposit_formatted || "Thỏa thuận"
                }}</span>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h5 class="fw-bold mb-3">Mô tả chi tiết</h5>
            <p
              class="text-secondary lh-base"
              style="white-space: pre-line; font-size: 0.95rem"
            >
              {{ room.description || "Chưa có mô tả chi tiết cho phòng này." }}
            </p>
          </div>
        </div>

        <div class="col-lg-4">
          <div
            class="card shadow-sm border-0 rounded-4 sticky-top"
            style="top: 24px"
          >
            <div class="card-body p-4">
              <div class="mb-3">
                <span class="text-muted small">Giá thuê</span>
                <div class="d-flex align-items-baseline">
                  <h3 class="text-primary fw-bold mb-0 me-1">
                    {{ room.price_formatted }}
                  </h3>
                  <span class="text-muted small">/tháng</span>
                </div>
              </div>

              <hr class="my-3 opacity-10" />

              <div
                class="d-flex align-items-center mb-4"
                v-if="room.owner_name"
              >
                <div
                  class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold me-3"
                  style="width: 42px; height: 42px; font-size: 0.9rem"
                >
                  {{ room.owner_name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <span class="text-muted d-block" style="font-size: 0.75rem"
                    >Đăng bởi</span
                  >
                  <span class="fw-bold">{{ room.owner_name }}</span>
                </div>
              </div>

              <div class="d-grid gap-2">
                <a
                  :href="`tel:${room.contact_phone}`"
                  class="btn btn-primary btn-md rounded-3 fw-bold py-2"
                  v-if="room.contact_phone"
                >
                  <i class="bi bi-telephone-fill me-2"></i>
                  {{ room.contact_phone }}
                </a>
                <a
                  :href="zaloChatLink"
                  target="_blank"
                  class="btn btn-outline-success btn-md rounded-3 fw-bold py-2"
                  v-if="room.contact_phone"
                >
                  <i class="bi bi-chat-dots-fill me-2"></i>
                  Chat Zalo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-5 pt-4 border-top">
        <h5 class="fw-bold mb-4">Tiện ích có sẵn</h5>
        <div v-if="roomAmenities.length > 0" class="row g-2">
          <div
            v-for="amenity in roomAmenities"
            :key="amenity.amenity_id"
            class="col-6 col-md-4 col-lg-3"
          >
            <div
              class="d-flex align-items-center p-2 border rounded-3 bg-white h-100 shadow-xs"
            >
              <i
                :class="amenity.icon + ' me-2 text-primary'"
                style="font-size: 1.1rem"
              ></i>
              <span class="fw-medium" style="font-size: 0.9rem">{{
                amenity.amenity_name
              }}</span>
            </div>
          </div>
        </div>
        <p v-else class="text-muted small fst-italic">
          Không có thông tin tiện ích
        </p>
      </div>

      <div class="mb-5">
        <h5 class="fw-bold mb-3">Vị trí trên bản đồ</h5>
        <div
          ref="mapContainer"
          class="rounded-4 shadow-sm overflow-hidden border"
          style="height: 400px; width: 100%"
        ></div>
      </div>
    </div>

    <div
      v-else
      class="alert alert-light border text-center py-5 rounded-4 shadow-sm"
    >
      <i class="bi bi-exclamation-octagon fs-2 text-warning mb-3 d-block"></i>
      <h5 class="fw-bold">Không tìm thấy tin đăng!</h5>
      <p class="text-muted">
        Tin đăng này có thể đã bị xóa hoặc chưa được duyệt.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import { computed } from "vue";
const route = useRoute();
const room = ref(null);
const loading = ref(true);
const mapContainer = ref(null);

// Danh sách tất cả tiện ích
const allAmenities = ref([]);

const roomAmenities = ref([]);

onMounted(async () => {
  try {
    console.log("Bắt đầu tải dữ liệu...");

    const [roomResponse, amenitiesResponse] = await Promise.all([
      axios.get(`http://localhost:5000/api/rooms/${route.params.id}`),
      axios.get("http://localhost:5000/api/posts/amenities"),
    ]);

    const roomData =
      roomResponse.data.room || roomResponse.data.data || roomResponse.data;

    if (!roomData) {
      throw new Error("Không tìm thấy dữ liệu phòng trong phản hồi API");
    }
    room.value = roomData;

    if (room.value.amenities) {
      let rawAmenities = room.value.amenities;
      let amenityIds = [];

      if (typeof rawAmenities === "string") {
        rawAmenities = rawAmenities.trim();

        if (rawAmenities.startsWith("[")) {
          try {
            amenityIds = JSON.parse(rawAmenities);
          } catch (e) {
            console.error("Lỗi parse JSON amenities:", e);
            amenityIds = [];
          }
        } else if (rawAmenities.includes(",")) {
          amenityIds = rawAmenities
            .split(",")
            .map((item) => parseInt(item.trim()))
            .filter((id) => !isNaN(id));
        } else {
          const parsed = parseInt(rawAmenities);
          if (!isNaN(parsed)) {
            amenityIds = [parsed];
          }
        }
      } else if (Array.isArray(rawAmenities)) {
        amenityIds = rawAmenities;
      }

      if (
        amenityIds.length > 0 &&
        typeof amenityIds[0] === "object" &&
        amenityIds[0] !== null
      ) {
        roomAmenities.value = amenityIds;
      } else if (amenityIds.length > 0) {
        const numericIds = amenityIds
          .map((id) => {
            const num = typeof id === "number" ? id : parseInt(id);
            return isNaN(num) ? null : num;
          })
          .filter((id) => id !== null);

        console.log("numericIds:", numericIds);

        roomAmenities.value = allAmenities.value.filter((item) => {
          return numericIds.includes(parseInt(item.amenity_id));
        });
      }
    } else {
      roomAmenities.value = [];
    }

    loading.value = false;

    await nextTick();
    if (mapContainer.value) {
      goongjs.accessToken = "d81lP9VxaJLk7A1TambyZ3bq28QVyGBkYfDdVXz7";
      const map = new goongjs.Map({
        container: mapContainer.value,
        style: "https://tiles.goong.io/assets/goong_map_web.json",
        center: [
          room.value.longitude || 106.6297,
          room.value.latitude || 10.8231,
        ],
        zoom: 15,
      });

      new goongjs.Marker({ color: "red" })
        .setLngLat([
          room.value.longitude || 106.6297,
          room.value.latitude || 10.8231,
        ])
        .addTo(map);
    }
  } catch (error) {
    console.error("Lỗi chi tiết:", error);
    loading.value = false;
  }
});
const zaloChatLink = computed(() => {
  if (!room.value?.contact_phone) return "#";

  let phone = room.value.contact_zalo || room.value.contact_phone;

  // Xóa ký tự không phải số
  phone = phone.replace(/\D/g, "");

  // Nếu bắt đầu bằng 0 → đổi sang 84
  if (phone.startsWith("0")) {
    phone = "84" + phone.slice(1);
  }

  return `https://zalo.me/${phone}`;
});
</script>

<style scoped>
.carousel-inner img {
  border-radius: 0.5rem;
}
.list-group-item {
  border: none;
  padding: 0.5rem 0;
}

.hover-shadow {
  transition: box-shadow 0.3s ease;
}
.hover-shadow:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>
