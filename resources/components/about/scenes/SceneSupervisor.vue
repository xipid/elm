<template>
  <section class="scene-supervisor">
    <div class="supervisor-inner">
      <span class="supervisor-label">GUIDED BY EXCELLENCE</span>
      <span class="supervisor-sub">SUPERVISED BY</span>
      <h2 class="supervisor-name text-center">MR. BELMANE ILYAS</h2>
      <div class="supervisor-line"></div>
      <p class="supervisor-desc">
        Enabling the next generation of scientific explorers through
        dedicated mentorship and technical leadership.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'

const { anim } = useScrollAnim()
const T = '.scene-supervisor'

onMounted(() => {
  anim('.supervisor-label',
    { opacity: 0, y: 20 },
    { opacity: 0.5, y: 0 },
    { trigger: T, start: 'top 80%', end: 'top 55%' }
  )
  anim('.supervisor-sub',
    { opacity: 0, y: 20 },
    { opacity: 0.6, y: 0 },
    { trigger: T, start: 'top 65%', end: 'top 40%' }
  )
  anim('.supervisor-name',
    { opacity: 0, scale: 3, filter: 'blur(20px)' },
    { opacity: 1, scale: 1, filter: 'blur(0px)' },
    { trigger: T, start: 'top 55%', end: 'top 15%' }
  )
  anim('.supervisor-line',
    { scaleX: 0 },
    { scaleX: 1 },
    { trigger: T, start: 'top 30%', end: 'top 15%' }
  )
  anim('.supervisor-desc',
    { opacity: 0, y: 25 },
    { opacity: 0.6, y: 0 },
    { trigger: T, start: 'top 25%', end: 'center center' }
  )
  anim('.supervisor-inner',
    { opacity: 1 },
    { opacity: 0, y: -50 },
    { trigger: T, start: 'center 18%', end: 'bottom top' }
  )
})
</script>

<style scoped>
.scene-supervisor {
  min-height: 130vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.supervisor-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 650px;
  padding: 0 24px;
}
.supervisor-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5em;
  color: rgba(251, 191, 36, 0.6);
}
.supervisor-sub {
  font-size: clamp(1.1rem, 2.8vw, 1.8rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 10px;
  letter-spacing: 0.05em;
}
.supervisor-name {
  font-size: clamp(2.2rem, 6.5vw, 4.5rem);
  font-weight: 900;
  margin: 0;
  line-height: 1.1;
  color: #fff;
  text-shadow: 0 0 60px rgba(251, 191, 36, 0.3);
  will-change: transform, opacity;
  letter-spacing: -0.01em;
}
.supervisor-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5), transparent);
  transform-origin: center;
  margin: 10px 0;
}
.supervisor-desc {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.6);
  max-width: 480px;
  margin: 0;
  text-align: center;
}
</style>
