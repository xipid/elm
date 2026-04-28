<template>
  <section class="scene-cold-open">
    <div class="cold-open-inner">
      <div class="ignition-ring"></div>
      <div class="ignition-cross">
        <div class="cross-h"></div>
        <div class="cross-v"></div>
      </div>
      <span class="cold-open-whisper">SOMETHING IS COMING</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'
const { anim } = useScrollAnim()
const T = '.scene-cold-open'
onMounted(() => {
  anim('.ignition-ring', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1 }, { trigger: T, start: 'top 80%', end: 'top 30%' })
  anim('.ignition-cross', { opacity: 0, rotation: -90, scale: 0.3 }, { opacity: 0.3, rotation: 0, scale: 1 }, { trigger: T, start: 'top 70%', end: 'top 35%' })
  anim('.cold-open-whisper', { opacity: 0, letterSpacing: '0.3em', y: 20 }, { opacity: 0.5, letterSpacing: '0.8em', y: 0 }, { trigger: T, start: 'top 55%', end: 'center center' })
  anim('.cold-open-inner', { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.8 }, { trigger: T, start: 'center 35%', end: 'bottom top' })
})
</script>

<style scoped>
.scene-cold-open { min-height: 130vh; display: flex; align-items: center; justify-content: center; }
.cold-open-inner { display: flex; flex-direction: column; align-items: center; gap: 40px; position: relative; }
.ignition-ring {
  width: 120px; height: 120px; border-radius: 50%;
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 60px rgba(139, 92, 246, 0.15), 0 0 120px rgba(139, 92, 246, 0.05), inset 0 0 40px rgba(139, 92, 246, 0.08);
  animation: ignitionPulse 3s ease-in-out infinite;
}
@keyframes ignitionPulse {
  0%, 100% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.15), 0 0 120px rgba(139, 92, 246, 0.05), inset 0 0 40px rgba(139, 92, 246, 0.08); }
  50% { box-shadow: 0 0 80px rgba(139, 92, 246, 0.3), 0 0 160px rgba(139, 92, 246, 0.12), inset 0 0 60px rgba(139, 92, 246, 0.15); }
}
.ignition-cross { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; pointer-events: none; }
.cross-h, .cross-v { position: absolute; background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent); }
.cross-h { width: 100%; height: 1px; top: 50%; }
.cross-v { width: 1px; height: 100%; left: 50%; background: linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.2), transparent); }
.cold-open-whisper { font-size: 11px; font-weight: 400; letter-spacing: 0.8em; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; }
</style>
