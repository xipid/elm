<template>
  <section class="scene-whisper">
    <div class="whisper-inner">
      <span class="whisper-diamond">◆</span>
      <span class="whisper-line left"></span>
      <em class="whisper-text">Where equations become worlds</em>
      <span class="whisper-line right"></span>
      <span class="whisper-diamond">◆</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'
const { anim } = useScrollAnim()
const T = '.scene-whisper'
onMounted(() => {
  anim('.whisper-text', { opacity: 0, y: 15 }, { opacity: 0.7, y: 0 }, { trigger: T, start: 'top 75%', end: 'top 40%' })
  anim('.whisper-line', { scaleX: 0 }, { scaleX: 1, stagger: 0 }, { trigger: T, start: 'top 70%', end: 'top 35%' })
  anim('.whisper-diamond', { opacity: 0, scale: 0 }, { opacity: 0.4, scale: 1, stagger: 0 }, { trigger: T, start: 'top 65%', end: 'top 35%' })
  anim('.whisper-inner', { opacity: 1 }, { opacity: 0 }, { trigger: T, start: 'center 30%', end: 'bottom top' })
})
</script>

<style scoped>
.scene-whisper { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
.whisper-inner { display: flex; align-items: center; gap: 16px; }
.whisper-diamond { color: rgba(45, 212, 191, 0.4); font-size: 8px; }
.whisper-line { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.25), transparent); transform-origin: center; }
.whisper-text { font-size: 15px; font-weight: 300; font-style: italic; color: rgba(45, 212, 191, 0.6); letter-spacing: 0.15em; white-space: nowrap; }
</style>
