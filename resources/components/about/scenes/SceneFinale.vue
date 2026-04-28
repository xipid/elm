<template>
  <section class="scene-finale">
    <!-- Full-screen black overlay -->
    <div class="finale-blackout"></div>

    <!-- Fixed content container — stays centered in viewport -->
    <div class="finale-content">
      <div class="finale-identity">
        <PhAtom :size="64" weight="thin" class="finale-icon" />
        <h1 class="finale-name">
          <span class="finale-letter" v-for="(l, i) in 'ELM'.split('')" :key="i">{{ l }}</span>
        </h1>
        <p class="finale-license">Released under the Apache 2.0 License</p>
      </div>

      <div class="finale-actions">
        <a href="https://github.com/xipid/elm" target="_blank" class="finale-btn">
          SOURCE CODE ON GITHUB
        </a>
        <button @click="router.visit('/')" class="finale-btn">
          BACK TO MENU
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'fictif'
import { PhAtom } from '@phosphor-icons/vue'
import { useScrollAnim } from '@/composables/useScrollAnim'

const { anim } = useScrollAnim()
const router = useRouter()
const T = '.scene-finale'

onMounted(() => {
  anim('.finale-blackout',
    { opacity: 0 },
    { opacity: 1 },
    { trigger: T, start: 'top 95%', end: 'top 55%' }
  )
  anim('.finale-icon',
    { opacity: 0, scale: 0.2, rotation: -180 },
    { opacity: 0.9, scale: 1, rotation: 0 },
    { trigger: T, start: 'top 60%', end: 'top 20%' }
  )
  anim('.finale-letter',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, stagger: 0.15 },
    { trigger: T, start: 'top 40%', end: 'top 10%' }
  )
  anim('.finale-license',
    { opacity: 0 },
    { opacity: 0.4 },
    { trigger: T, start: 'top 20%', end: 'top 0%' }
  )
  anim('.finale-content',
    { opacity: 0, visibility: 'hidden' },
    { opacity: 1, visibility: 'visible' },
    { trigger: T, start: 'top 80%', end: 'top 40%' }
  )
  anim('.finale-actions',
    { opacity: 0, y: 60 },
    { opacity: 1, y: 0 },
    { trigger: T, start: 'top 10%', end: 'center center' }
  )
})
</script>

<style scoped>
.scene-finale {
  min-height: 200vh; /* More scroll space for the finale */
  position: relative;
}
.finale-blackout {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  will-change: opacity;
}
.finale-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 70px;
  width: 100%;
  padding: 0 24px;
  /* visibility/opacity controlled by GSAP */
}
.finale-identity {
  display: flex; flex-direction: column; align-items: center; gap: 18px;
}
.finale-icon {
  color: #fff; will-change: transform, opacity;
  filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.15));
  animation: iconPulse 4s ease-in-out infinite;
}
@keyframes iconPulse {
  0%, 100% { filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.15)); transform: scale(1); }
  50% { filter: drop-shadow(0 0 45px rgba(255, 255, 255, 0.25)); transform: scale(1.05); }
}
.finale-name {
  display: flex; gap: 10px; font-size: 3.8rem; font-weight: 900;
  letter-spacing: 0.6em; color: #fff; margin: 0; padding-left: 0.6em;
}
.finale-letter { display: inline-block; will-change: opacity, transform; }
.finale-license {
  font-size: 11px; font-weight: 400; letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.4); margin: 0;
}
.finale-actions {
  display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px;
}
.finale-btn {
  padding: 14px 20px; background: transparent; color: rgba(255, 255, 255, 0.6);
  border: 1.5px solid rgba(255, 255, 255, 0.15); border-radius: 4px;
  font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700;
  letter-spacing: 0.25em; text-decoration: none; text-align: center;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.finale-btn:hover {
  color: #fff; border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}
</style>
