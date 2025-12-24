<!-- src/components/admin/StatCard.vue -->
<template>
  <div class="card shadow-sm border-0 h-100">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <p class="text-muted mb-1 small fw-medium">{{ title }}</p>
          <h3 class="fw-bold mb-0">{{ formattedValue }}</h3>
        </div>

        <div 
          class="rounded-circle p-3" 
          :class="`bg-${color}-subtle text-${color}`"
          style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;"
        >
          <i :class="icon" class="fs-4"></i>
        </div>
      </div>

      <div class="mt-3 small">
        <span 
          :class="trend === 'up' ? 'text-success' : 'text-danger'"
        >
          <i :class="trend === 'up' ? 'bi bi-arrow-up-short' : 'bi bi-arrow-down-short'"></i>
          {{ trendValue }}
        </span>
        <span class="text-muted ms-2">so với {{ compareLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed } from 'vue'

const props = defineProps({
  title: String,
  value: [Number, String],
  trend: String,        // 'up' | 'down' | 'flat'
  trendValue: String,   // ví dụ: "+12%", "-3.4%"
  icon: String,
  color: String,        // primary, success, info, warning, danger...
  compareLabel: {
    type: String,
    default: 'hôm qua'
  }
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('vi-VN')
  }
  return props.value
})
</script>