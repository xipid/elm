<template>
  <section class="scene-hero">
    <div class="hero-inner">
      <h1 class="hero-title">
        <span class="hero-word" v-for="(word, i) in words" :key="i">
          <span class="hero-letter" v-for="(ch, j) in word.split('')" :key="j">{{ ch }}</span>
          <span v-if="i < words.length - 1" class="hero-space">&nbsp;</span>
        </span>
      </h1>
      <div class="hero-line"></div>
      <p class="hero-tagline">
        <span class="tagline-char" v-for="(ch, i) in tagline" :key="i"
          :class="{ 'tagline-space': ch === ' ' }">{{ ch === ' ' ? '\u00A0' : ch }}</span>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'
const { anim } = useScrollAnim()
const T = '.scene-hero'
const words = ['DISCOVER', 'THE', 'UNSEEN']
const tagline = 'ELEMENT : THE NEXT FRONTIER OF CHEMICAL SIMULATION'.split('')
onMounted(() => {
  anim('.hero-letter', { opacity: 0, y: 80, rotateX: -90, scale: 0.5 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, stagger: 0.03 }, { trigger: T, start: 'top 80%', end: 'top 20%' })
  anim('.hero-line', { scaleX: 0 }, { scaleX: 1 }, { trigger: T, start: 'top 50%', end: 'top 20%' })
  anim('.tagline-char', { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.012 }, { trigger: T, start: 'top 35%', end: 'center center' })
  anim('.hero-inner', { opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(15px)' }, { trigger: T, start: 'center 25%', end: 'bottom top' })
})
</script>

<style scoped>
.scene-hero { min-height: 150vh; display: flex; align-items: center; justify-content: center; }
.hero-inner { display: flex; flex-direction: column; align-items: center; gap: 28px; }
.hero-title {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 0;
  font-size: clamp(3rem, 10vw, 7rem); font-weight: 900;
  letter-spacing: -0.02em; line-height: 0.95; margin: 0; perspective: 600px;
}
.hero-word { display: inline-flex; white-space: nowrap; }
.hero-space { display: inline-block; width: 0.3em; }
.hero-letter {
  display: inline-block; will-change: transform, opacity;
  background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-line { width: 80px; height: 1px; background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), transparent); transform-origin: center; }
.hero-tagline { display: flex; flex-wrap: wrap; justify-content: center; font-size: 12px; font-weight: 500; letter-spacing: 0.35em; color: #8b5cf6; margin: 0; }
.tagline-char { display: inline-block; will-change: opacity; }
.tagline-space { width: 0.5em; }
@media (max-width: 768px) {
  .hero-title { font-size: 2.8rem; }
  .hero-tagline { font-size: 10px; letter-spacing: 0.25em; }
}
</style>
