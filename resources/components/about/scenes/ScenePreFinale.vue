<template>
  <section class="scene-prefinale">
    <div class="prefinale-inner">
      <div class="prefinale-line top-line"></div>
      <p class="prefinale-text">THE JOURNEY HAS JUST BEGUN</p>
      <div class="prefinale-line bottom-line"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'

const { anim } = useScrollAnim()
const T = '.scene-prefinale'

onMounted(() => {
  anim('.prefinale-text',
    { opacity: 0, letterSpacing: '0.1em' },
    { opacity: 0.75, letterSpacing: '0.5em' },
    { trigger: T, start: 'top 70%', end: 'top 30%' }
  )
  anim('.top-line',
    { scaleX: 0 },
    { scaleX: 1.2 },
    { trigger: T, start: 'top 75%', end: 'top 40%' }
  )
  anim('.bottom-line',
    { scaleX: 0 },
    { scaleX: 1.2 },
    { trigger: T, start: 'top 65%', end: 'top 35%' }
  )
  anim('.prefinale-inner',
    { opacity: 1 },
    { opacity: 0, scale: 1.1 },
    { trigger: T, start: 'center 25%', end: 'bottom top' }
  )
})
</script>

<style scoped>
.scene-prefinale {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.prefinale-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.prefinale-text {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}
.prefinale-line {
  width: 120px;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transform-origin: center;
}
</style>
