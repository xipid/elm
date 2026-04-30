<template>
  <div class="progress-control" @click="$emit('toggle')" :class="{ paused: isPaused }">
    <div class="icon-inner">
      <svg v-if="isPaused" class="play-icon" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="6,3 20,12 6,21" />
      </svg>
      <svg v-else class="pause-icon" viewBox="0 0 24 24" fill="currentColor">
        <rect x="5" y="3" width="4" height="18" rx="1" />
        <rect x="15" y="3" width="4" height="18" rx="1" />
      </svg>
    </div>
    <div class="progress-percent">{{ Math.round(val) }}%</div>
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
  position: relative;
  width: 48px;
  height: 48px;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-control:hover {
  transform: scale(1.1);
}

.icon-inner {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.3s;
}

.progress-control:hover .icon-inner {
  color: #fff;
}

.progress-percent {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.25);
  margin-top: 4px;
  letter-spacing: 0.05em;
  font-family: 'Outfit', sans-serif;
}

.play-icon, .pause-icon {
  width: 100%;
  height: 100%;
}

.play-icon {
  margin-left: 2px;
}
</style>
