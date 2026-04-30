<template>
  <section class="scene-opensource">
    <div class="opensource-inner">
      <div class="opensource-wipe">
        <h2 class="opensource-title">OPEN FOR ALL</h2>
      </div>
      <p class="opensource-desc">
        Project Element is open-source. We believe in the power of shared
        knowledge to push the boundaries of scientific simulation.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'

const { anim } = useScrollAnim()
const T = '.scene-opensource'

onMounted(() => {
  anim('.opensource-wipe',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)' },
    { trigger: T, start: 'top 70%', end: 'top 25%' }
  )
  anim('.opensource-desc',
    { opacity: 0, y: 30 },
    { opacity: 0.7, y: 0 },
    { trigger: T, start: 'top 35%', end: 'center center' }
  )
  anim('.opensource-inner',
    { opacity: 1 },
    { opacity: 0, scale: 0.9 },
    { trigger: T, start: 'center 20%', end: 'bottom top' }
  )
})
</script>

<style scoped>
.scene-opensource {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.opensource-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 600px;
  padding: 0 24px;
}
.opensource-wipe {
  overflow: hidden;
  will-change: clip-path;
}
.opensource-title {
  font-size: clamp(2.2rem, 5.5vw, 4rem);
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
  color: #fff;
  letter-spacing: -0.01em;
}
.opensource-desc {
  font-size: 1.1rem;
  font-weight: 400;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  text-align: center;
}
</style>
