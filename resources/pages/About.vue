<template>
  <div class="trailer-page" ref="pageRef">
    <!-- Fixed layers -->
    <TrailerBackground />
    <TrailerProgress :val="progress" :isPaused="isPaused" @toggle="toggleAutoScroll" />

    <!-- Cinema letterbox bars -->
    <div class="cinema-bar top"></div>
    <div class="cinema-bar bottom"></div>

    <!-- Scanline overlay -->
    <div class="scanlines"></div>

    <!-- ═══════════════ SCROLLABLE CONTENT ═══════════════ -->
    <div class="trailer-content">
      <SceneColdOpen />
      <SceneHero />
      <SceneWhisper />
      <SceneFormulas />
      <SceneOrigin />
      <SceneVisionQuote />
      <SceneEngine />
      <SceneFlashMontage />
      <SceneOrbital />
      <SceneSupervisor />
      <SceneCredits />
      <SceneOpenSource />
      <ScenePreFinale />
      <SceneFinale />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import TrailerBackground from '@/components/about/TrailerBackground.vue'
import TrailerProgress from '@/components/about/TrailerProgress.vue'

import SceneColdOpen from '@/components/about/scenes/SceneColdOpen.vue'
import SceneHero from '@/components/about/scenes/SceneHero.vue'
import SceneWhisper from '@/components/about/scenes/SceneWhisper.vue'
import SceneFormulas from '@/components/about/scenes/SceneFormulas.vue'
import SceneOrigin from '@/components/about/scenes/SceneOrigin.vue'
import SceneVisionQuote from '@/components/about/scenes/SceneVisionQuote.vue'
import SceneEngine from '@/components/about/scenes/SceneEngine.vue'
import SceneFlashMontage from '@/components/about/scenes/SceneFlashMontage.vue'
import SceneOrbital from '@/components/about/scenes/SceneOrbital.vue'
import SceneSupervisor from '@/components/about/scenes/SceneSupervisor.vue'
import SceneCredits from '@/components/about/scenes/SceneCredits.vue'
import SceneOpenSource from '@/components/about/scenes/SceneOpenSource.vue'
import ScenePreFinale from '@/components/about/scenes/ScenePreFinale.vue'
import SceneFinale from '@/components/about/scenes/SceneFinale.vue'

gsap.registerPlugin(ScrollTrigger)

const pageRef = ref<HTMLElement>()
const progress = ref(0)
const isPaused = ref(false)

// ── Auto-scroll — faster speed ──
const SCROLL_SPEED = 2.8
let scrollFrameId: number
let progressST: ScrollTrigger

function autoScroll() {
  if (!isPaused.value && pageRef.value) {
    const el = pageRef.value
    if (el.scrollTop < el.scrollHeight - el.clientHeight) {
      el.scrollTop += SCROLL_SPEED
    }
  }
  scrollFrameId = requestAnimationFrame(autoScroll)
}

function toggleAutoScroll() {
  isPaused.value = !isPaused.value
}

function handleManualInteraction() {
  isPaused.value = true
}

onMounted(async () => {
  await nextTick()
  if (!pageRef.value) return

  scrollFrameId = requestAnimationFrame(autoScroll)

  // Global progress tracker
  progressST = ScrollTrigger.create({
    trigger: '.trailer-content',
    scroller: pageRef.value,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => { progress.value = self.progress * 100 }
  })

  window.addEventListener('keydown', handleManualInteraction)
  window.addEventListener('wheel', handleManualInteraction, { passive: true })
  window.addEventListener('touchstart', handleManualInteraction, { passive: true })
})

onUnmounted(() => {
  cancelAnimationFrame(scrollFrameId)
  progressST?.kill()
  ScrollTrigger.getAll().forEach(st => st.kill())
  window.removeEventListener('keydown', handleManualInteraction)
  window.removeEventListener('wheel', handleManualInteraction)
  window.removeEventListener('touchstart', handleManualInteraction)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap');

.trailer-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #020205;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  scrollbar-width: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.trailer-page::-webkit-scrollbar { display: none; }

.cinema-bar {
  position: fixed;
  left: 0;
  width: 100%;
  height: 5.5vh;
  background: #000;
  z-index: 9000;
  pointer-events: none;
}
.cinema-bar.top { top: 0; }
.cinema-bar.bottom { bottom: 0; }

.scanlines {
  position: fixed;
  inset: 0;
  z-index: 8999;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
}

.trailer-content {
  position: relative;
  z-index: 50;
}
</style>
