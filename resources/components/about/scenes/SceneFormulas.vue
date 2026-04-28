<template>
  <section class="scene-formulas">
    <div class="formula-track">
      <span class="formula" v-for="(f, i) in formulas" :key="i"
        :style="{ top: `${(i / formulas.length) * 85 + 5}%`, fontSize: `${1.2 + (i % 4) * 0.5}rem` }">{{ f }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'
const { anim } = useScrollAnim()
const T = '.scene-formulas'
const formulas = ['H₂O', 'C₆H₁₂O₆', 'NaCl', 'CH₄', 'C₂H₅OH', 'CO₂', 'NH₃', 'H₂SO₄', 'Fe₂O₃', 'CaCO₃']
onMounted(() => {
  document.querySelectorAll('.formula').forEach((el, i) => {
    const dir = i % 2 === 0 ? 1 : -1
    anim(el, { x: dir * 500, opacity: 0 }, { x: -dir * 500, opacity: i % 3 === 0 ? 0.22 : 0.12 }, { trigger: T, start: 'top bottom', end: 'bottom top' })
  })
})
</script>

<style scoped>
.scene-formulas { min-height: 80vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.formula-track { position: relative; width: 100%; height: 400px; }
.formula { position: absolute; left: 50%; font-weight: 300; color: rgba(139, 92, 246, 0.15); white-space: nowrap; will-change: transform, opacity; pointer-events: none; }
</style>
