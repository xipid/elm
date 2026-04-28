<template>
  <section class="scene-engine">
    <div class="engine-inner">
      <span class="engine-label">PHYSICS-DRIVEN REALITY</span>
      <h2 class="engine-title glitch-text" data-text="BEYOND THE ATOM">BEYOND THE ATOM</h2>
      <div class="engine-features">
        <div class="engine-feat" v-for="(feat, i) in features" :key="i">
          <span class="feat-marker">›</span>
          <span class="feat-text">{{ feat }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'

const { anim } = useScrollAnim()
const T = '.scene-engine'
const features = [
  'IUPAC Nomenclature — Comprehensive parsing and generation',
  '3D Generation — Real-time coordinates via VSEPR theory',
  'Reaction Engine — Mass and energy-conserving simulation',
  'Thermal Dynamics — Accurate energy transfer and phase logic'
]

onMounted(() => {
  anim('.engine-label',
    { opacity: 0, y: 20 },
    { opacity: 0.5, y: 0 },
    { trigger: T, start: 'top 80%', end: 'top 55%' }
  )
  anim('.engine-title',
    { opacity: 0, scale: 2.2, filter: 'blur(20px)' },
    { opacity: 1, scale: 1, filter: 'blur(0px)' },
    { trigger: T, start: 'top 70%', end: 'top 30%' }
  )
  anim('.engine-feat',
    { opacity: 0, x: 60, filter: 'blur(4px)' },
    { opacity: 0.9, x: 0, filter: 'blur(0px)', stagger: 0.1 },
    { trigger: T, start: 'top 40%', end: 'center center' }
  )
  anim('.engine-inner',
    { opacity: 1 },
    { opacity: 0, y: -40 },
    { trigger: T, start: 'center 20%', end: 'bottom top' }
  )
})
</script>

<style scoped>
.scene-engine {
  min-height: 150vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.engine-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 750px;
  padding: 0 24px;
}
.engine-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5em;
  color: rgba(139, 92, 246, 0.6);
}
.engine-title {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 900;
  margin: 0;
  color: #fff;
  position: relative;
  letter-spacing: -0.01em;
}
.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.glitch-text::before {
  color: #ff006e;
  animation: glitch1 5s infinite linear;
}
.glitch-text::after {
  color: #38bdf8;
  animation: glitch2 5s infinite linear;
}
@keyframes glitch1 {
  0%, 92%, 100% { opacity: 0; transform: translate(0); clip-path: inset(0 0 0 0); }
  93% { opacity: 0.7; transform: translate(-3px, 1px); clip-path: inset(20% 0 60% 0); }
  95% { opacity: 0.7; transform: translate(2px, -1px); clip-path: inset(50% 0 20% 0); }
  97% { opacity: 0; }
}
@keyframes glitch2 {
  0%, 90%, 100% { opacity: 0; transform: translate(0); clip-path: inset(0 0 0 0); }
  91% { opacity: 0.7; transform: translate(3px, -2px); clip-path: inset(30% 0 40% 0); }
  93% { opacity: 0.7; transform: translate(-2px, 2px); clip-path: inset(60% 0 10% 0); }
  96% { opacity: 0; }
}
.engine-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  width: 100%;
}
.engine-feat {
  display: flex;
  align-items: baseline;
  gap: 16px;
  will-change: opacity, transform;
}
.feat-marker {
  color: #8b5cf6;
  font-weight: 800;
  font-size: 1.4rem;
  flex-shrink: 0;
}
.feat-text {
  font-size: 1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  text-align: left;
}
@media (max-width: 768px) {
  .engine-features { padding: 0 8px; }
  .feat-text { font-size: 0.9rem; }
}
</style>
