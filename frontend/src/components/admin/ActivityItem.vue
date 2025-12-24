<template>
  <div class="list-group-item list-group-item-action px-0 py-3">
    <div class="d-flex align-items-start gap-3">
      <!-- Avatar/Icon -->
      <div
        class="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center"
        :class="avatarBg"
        style="width: 48px; height: 48px"
      >
        <i :class="icon" class="fs-5"></i>
      </div>

      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <div class="fw-medium">{{ action }}</div>
          <small class="text-muted">{{ time }}</small>
        </div>

        <div class="text-muted small mb-1">
          <span v-if="user">
            <strong>{{ user }}</strong>
            <span class="mx-1">•</span>
          </span>
          {{ description }}
        </div>

        <div v-if="target" class="small">
          <span class="badge bg-light text-dark border">{{ target }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  activity: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const action = computed(() => props.activity.action || "Hoạt động");
const user = computed(() => props.activity.user || "");
const description = computed(() => props.activity.description || "");
const time = computed(() => props.activity.time || "Không rõ");
const target = computed(() => props.activity.target || "");
const type = computed(() => props.activity.type || "info");

const avatarBg = computed(() => {
  const styles = {
    success: "bg-success-subtle text-success",
    warning: "bg-warning-subtle text-warning",
    danger: "bg-danger-subtle text-danger",
    info: "bg-info-subtle text-info",
    primary: "bg-primary-subtle text-primary",
  };
  return styles[type.value] || styles.info;
});

const icon = computed(() => {
  const icons = {
    login: "bi bi-box-arrow-in-right",
    logout: "bi bi-box-arrow-right",
    create: "bi bi-plus-circle",
    update: "bi bi-pencil-square",
    delete: "bi bi-trash",
    error: "bi bi-exclamation-triangle",
  };
  return icons[type.value] || "bi bi-activity";
});
</script>
