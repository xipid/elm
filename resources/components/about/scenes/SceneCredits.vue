<template>
  <section class="scene-credits">
    <div class="credits-inner">
      <span class="credits-label">STUDENTS</span>
      <div class="credits-list">
        <div class="credit-name" v-for="(name, i) in students" :key="i">
          {{ name.toUpperCase() }}
        </div>
      </div>
    </div>
  </section>
</template>


<script setup lang="ts">
import { onMounted } from 'vue'
import { useScrollAnim } from '@/composables/useScrollAnim'

const { anim } = useScrollAnim()
const T = '.scene-credits'

const students = [
  "Aiche Malak Nour El Houda", "Merzoug Abderrahmene", "Ababsa Mouaki Nour El Hidaya",
  "Nacer Bouhadjam Wiam", "Benabid Soumia", "Benmohammed Youssef",
  "Djeba Imad Eddine", "Belbacha Abdeljalil", "Barour Fares",
  "Ameghchouche Mayar", "Zerouni Sara", "Benabderrahmane Rostom", "Khioani Raid"
]

onMounted(() => {
  anim('.credits-label',
    { opacity: 0, letterSpacing: '0.2em' },
    { opacity: 0.45, letterSpacing: '0.6em' },
    { trigger: T, start: 'top 80%', end: 'top 55%' }
  )
  anim('.credit-name',
    { opacity: 0, y: 35 },
    { opacity: 0.8, y: 0, stagger: 0.05 },
    { trigger: T, start: 'top 65%', end: 'center 35%' }
  )
  anim('.credits-inner',
    { opacity: 1 },
    { opacity: 0, y: -40 },
    { trigger: T, start: 'center 15%', end: 'bottom top' }
  )
})
</script>

<style scoped>
.scene-credits {
  min-height: 160vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.credits-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}
.credits-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6em;
  color: rgba(255, 255, 255, 0.4);
}
.credits-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.credit-name {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.25em;
  color: rgba(255, 255, 255, 0.75);
  will-change: opacity, transform;
}
</style>
