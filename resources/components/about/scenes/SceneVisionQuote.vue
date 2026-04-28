<template>
  <section class="scene-vision">
    <div class="vision-inner">
      <p class="vision-question">WE ASKED A SIMPLE QUESTION</p>
      <h2 class="vision-answer">
        <span class="vision-word" v-for="(w, i) in answerWords" :key="i">
          {{ w }}<span v-if="i < answerWords.length - 1" class="word-space">&nbsp;</span>
        </span>
      </h2>
      <div class="vision-glow"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'

const { anim } = useScrollAnim()
const T = '.scene-vision'
const answerWords = ['WHAT', 'IF', 'CHEMISTRY', 'COULD', 'BE', 'FELT?']

onMounted(() => {
  anim('.vision-question',
    { opacity: 0, y: 20 },
    { opacity: 0.6, y: 0 },
    { trigger: T, start: 'top 75%', end: 'top 50%' }
  )
  anim('.vision-word',
    { opacity: 0, y: 50, filter: 'blur(10px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.08 },
    { trigger: T, start: 'top 55%', end: 'top 15%' }
  )
  anim('.vision-glow',
    { opacity: 0, scale: 0.5 },
    { opacity: 1, scale: 1 },
    { trigger: T, start: 'top 45%', end: 'top 20%' }
  )
  anim('.vision-inner',
    { opacity: 1 },
    { opacity: 0, y: -30 },
    { trigger: T, start: 'center 20%', end: 'bottom top' }
  )
})
</script>

<style scoped>
.scene-vision {
  min-height: 120vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vision-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  position: relative;
}
.vision-question {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4em;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}
.vision-answer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  font-size: clamp(2rem, 5.5vw, 4rem);
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
  color: #fff;
}
.vision-word {
  display: inline-block;
  will-change: transform, opacity;
}
.word-space {
  display: inline-block;
  width: 0.25em;
}
.vision-glow {
  position: absolute;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  pointer-events: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}
</style>
