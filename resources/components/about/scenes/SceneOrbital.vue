<template>
  <section class="scene-orbital">
    <div class="orbital-system">
      <div class="orbit orbit-1"><span class="orbit-dot"></span></div>
      <div class="orbit orbit-2"><span class="orbit-dot"></span></div>
      <div class="orbit orbit-3"><span class="orbit-dot"></span></div>
      <div class="orbit-core"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'

const { anim } = useScrollAnim()
const T = '.scene-orbital'

onMounted(() => {
  anim('.orbital-system',
    { opacity: 0, scale: 0.5, rotation: -60 },
    { opacity: 0.7, scale: 1, rotation: 0 },
    { trigger: T, start: 'top 80%', end: 'top 30%' }
  )
  anim('.orbit-core',
    { opacity: 0, scale: 0 },
    { opacity: 1, scale: 1 },
    { trigger: T, start: 'top 70%', end: 'top 40%' }
  )
  anim('.orbital-system',
    { opacity: 0.7 },
    { opacity: 0, scale: 0.6, y: -50 },
    { trigger: T, start: 'center 25%', end: 'bottom top' }
  )
})
</script>

<style scoped>
.scene-orbital {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.orbital-system {
  position: relative;
  width: 300px;
  height: 300px;
  will-change: transform, opacity;
}
.orbit {
  position: absolute;
  border: 1.5px solid rgba(45, 212, 191, 0.15);
  border-radius: 50%;
  top: 50%;
  left: 50%;
}
.orbit-1 { width: 140px; height: 140px; margin: -70px 0 0 -70px; animation: spin 12s linear infinite; }
.orbit-2 { width: 220px; height: 220px; margin: -110px 0 0 -110px; animation: spin 20s linear infinite reverse; }
.orbit-3 { width: 300px; height: 300px; margin: -150px 0 0 -150px; animation: spin 30s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.orbit-dot {
  position: absolute;
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(45, 212, 191, 0.6);
  box-shadow: 0 0 15px rgba(45, 212, 191, 0.4);
  top: -3.5px; left: 50%; margin-left: -3.5px;
}
.orbit-core {
  position: absolute;
  width: 14px; height: 14px; border-radius: 50%;
  background: rgba(139, 92, 246, 0.7);
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.4), 0 0 50px rgba(139, 92, 246, 0.2);
  top: 50%; left: 50%; margin: -7px 0 0 -7px;
}
</style>
