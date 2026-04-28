<template>
  <div class="progress-control" @click="$emit('toggle')" :class="{ paused: isPaused }">
    <svg class="progress-ring" viewBox="0 0 60 60">
      <circle class="ring-track" cx="30" cy="30" r="26" />
      <circle 
        class="ring-fill" 
        cx="30" cy="30" r="26"
        :style="{ strokeDashoffset: dashOffset }"
      />
    </svg>
    <div class="icon-wrapper">
      <div class="icon-inner">
        <!-- Play triangle -->
        <svg v-if="isPaused" class="play-icon" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="6,3 20,12 6,21" />
        </svg>
        <!-- Pause bars -->
        <svg v-else class="pause-icon" viewBox="0 0 24 24" fill="currentColor">
          <rect x="5" y="3" width="4" height="18" rx="1" />
          <rect x="15" y="3" width="4" height="18" rx="1" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ val: number; isPaused: boolean }>()
defineEmits(['toggle'])

const CIRCUMFERENCE = 2 * Math.PI * 26

const dashOffset = computed(() => {
  return CIRCUMFERENCE - (props.val / 100) * CIRCUMFERENCE
})
</script>

<style scoped>
.progress-control {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 9999;
  width: 52px;
  height: 52px;
  cursor: pointer;
  user-select: none;
  transform: rotate(0deg);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-control:hover {
  transform: scale(1.12);
}

.progress-control:active {
  transform: scale(0.95);
}

/* SVG ring */
.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 2;
}

.ring-fill {
  fill: none;
  stroke: rgba(139, 92, 246, 0.7);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 163.36; /* 2 * pi * 26 */
  stroke-dashoffset: 163.36;
  transition: stroke-dashoffset 0.3s ease;
}

/* Center icon */
.icon-wrapper {
  position: absolute;
  inset: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-control:hover .icon-wrapper {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
}

.icon-inner {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.3s;
}

.progress-control:hover .icon-inner {
  color: rgba(255, 255, 255, 0.9);
}

.play-icon, .pause-icon {
  width: 100%;
  height: 100%;
}

.play-icon {
  margin-left: 2px; /* Optical centering for triangles */
}
</style>
