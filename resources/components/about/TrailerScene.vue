<template>
  <section class="trailer-scene" ref="sceneRef">
    <div class="scene-inner" ref="innerRef">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  height?: string
}>()

const sceneRef = ref<HTMLElement>()
const innerRef = ref<HTMLElement>()

defineExpose({ sceneRef, innerRef })
</script>

<style scoped>
.trailer-scene {
  min-height: v-bind("props.height || '120vh'");
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8%;
  position: relative;
  overflow: hidden;
}

.scene-inner {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  will-change: transform, opacity;
}
</style>
