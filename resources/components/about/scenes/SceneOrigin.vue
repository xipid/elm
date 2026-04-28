<template>
  <section class="scene-origin">
    <div class="origin-inner">
      <span class="origin-label">BORN IN THE HEART OF ALGERIA</span>
      <h2 class="origin-title">
        <span class="origin-word">BATNA,&nbsp;</span>
        <span class="origin-word">2026</span>
      </h2>
      <div class="origin-accent"></div>
      <p class="origin-desc">
        <span class="origin-line" v-for="(line, i) in lines" :key="i">{{ line }}</span>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'
const { anim } = useScrollAnim()
const T = '.scene-origin'
const lines = [
  'In the halls of the High School of Guada, a vision was forged.',
  'A vision to bridge the gap between abstract equations',
  'and tangible reality, bringing the beauty of molecular',
  'structures to the fingertips of everyone.'
]
onMounted(() => {
  anim('.origin-label', { opacity: 0, y: 25, letterSpacing: '0.2em' }, { opacity: 0.5, y: 0, letterSpacing: '0.5em' }, { trigger: T, start: 'top 80%', end: 'top 50%' })
  anim('.origin-word', { opacity: 0, y: 60, scale: 1.6, filter: 'blur(8px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', stagger: 0.15 }, { trigger: T, start: 'top 70%', end: 'top 30%' })
  anim('.origin-accent', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1 }, { trigger: T, start: 'top 50%', end: 'top 35%' })
  anim('.origin-line', { opacity: 0, x: -40 }, { opacity: 0.65, x: 0, stagger: 0.08 }, { trigger: T, start: 'top 45%', end: 'center center' })
  anim('.origin-inner', { opacity: 1 }, { opacity: 0, y: -40 }, { trigger: T, start: 'center 25%', end: 'bottom top' })
})
</script>

<style scoped>
.scene-origin { min-height: 140vh; display: flex; align-items: center; justify-content: center; }
.origin-inner { display: flex; flex-direction: column; align-items: center; gap: 14px; max-width: 700px; padding: 0 24px; }
.origin-label { font-size: 11px; font-weight: 400; letter-spacing: 0.5em; color: rgba(251, 191, 36, 0.5); text-transform: uppercase; }
.origin-title { display: flex; font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 900; margin: 0; line-height: 1; color: #fff; }
.origin-word { display: inline-block; will-change: transform, opacity; }
.origin-accent { width: 40px; height: 2px; background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), transparent); transform-origin: center; margin: 4px 0; }
.origin-desc { display: flex; flex-direction: column; gap: 5px; margin: 8px 0 0; }
.origin-line { display: block; font-size: 1rem; font-weight: 300; line-height: 1.8; color: rgba(255, 255, 255, 0.6); text-align: center; will-change: opacity, transform; }
</style>
