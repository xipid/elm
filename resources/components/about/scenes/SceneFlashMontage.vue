<template>
  <section class="scene-flash">
    <div class="flash-container">
      <span class="flash-word" v-for="(w, i) in words" :key="i"
        :data-flash-idx="i" :style="{ color: colors[i] }">{{ w }}</span>
    </div>
    <div class="flash-overlay" v-for="i in words.length" :key="'o'+i"
      :data-flash-overlay="i-1"></div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const words = ['PARSE', 'GENERATE', 'SIMULATE', 'VISUALIZE', 'REACT', 'DISCOVER']
const colors = ['#8b5cf6', '#38bdf8', '#2dd4bf', '#fbbf24', '#fb7185', '#a78bfa']

const triggers: ScrollTrigger[] = []

onMounted(() => {
  const T = '.scene-flash'
  const S = '.trailer-page'

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: T,
      scroller: S,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true,
    }
  })

  if (tl.scrollTrigger) triggers.push(tl.scrollTrigger)

  words.forEach((_, i) => {
    const word = `[data-flash-idx="${i}"]`
    const overlay = `[data-flash-overlay="${i}"]`

    tl.fromTo(overlay, { opacity: 0 }, { opacity: 0.08, duration: 0.02 })
    tl.fromTo(word,
      { opacity: 0, scale: 2.5, filter: 'blur(15px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.12 }
    )
    tl.to(word, { opacity: 1, duration: 0.05 })
    tl.to(word, { opacity: 0, scale: 0.75, filter: 'blur(5px)', duration: 0.08 })
    tl.to(overlay, { opacity: 0, duration: 0.02 })
  })
})

onUnmounted(() => {
  triggers.forEach(t => t.kill())
})
</script>

<style scoped>
.scene-flash {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.flash-container {
  position: relative;
  width: 100%;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flash-word {
  position: absolute;
  font-size: clamp(3rem, 12vw, 8rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  opacity: 0;
  will-change: transform, opacity, filter;
  text-shadow: 0 0 50px currentColor;
}
.flash-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: currentColor;
  opacity: 0;
  z-index: 9;
  mix-blend-mode: soft-light;
}
</style>
