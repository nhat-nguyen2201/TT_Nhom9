<!-- src/components/admin/SystemStatusItem.vue -->
<template>
  <div
    class="d-flex justify-content-between align-items-center py-2 border-bottom"
  >
    <div>
      <div class="fw-medium">{{ label }}</div>
      <div class="small text-muted" v-if="description">{{ description }}</div>
    </div>

    <div class="d-flex align-items-center gap-3">
      <span class="fw-bold">{{ value }}</span>

      <span class="badge rounded-pill px-3 py-2 fw-medium" :class="statusClass">
        {{ statusText }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  label: String,
  value: [String, Number],
  description: String,
  status: {
    type: String,
    default: "info",
    validator: (v) =>
      ["success", "warning", "danger", "info", "secondary"].includes(v),
  },
});

const statusMap = {
  success: { text: "Tốt", class: "bg-success-subtle text-success" },
  warning: { text: "Cảnh báo", class: "bg-warning-subtle text-warning" },
  danger: { text: "Nguy hiểm", class: "bg-danger-subtle text-danger" },
  info: { text: "Bình thường", class: "bg-info-subtle text-info" },
  secondary: { text: "-", class: "bg-secondary-subtle text-secondary" },
};

const statusInfo = computed(
  () => statusMap[props.status] || statusMap.secondary
);

const statusClass = computed(() => statusInfo.value.class);
const statusText = computed(() => statusInfo.value.text);
</script>
