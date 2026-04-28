<template>
  <div class="menu-bg" ref="bgRef">
    <!-- Gradient overlay -->
    <div class="menu-bg__gradient"></div>

    <!-- Floating molecule silhouettes -->
    <div
      v-for="mol in molecules"
      :key="mol.id"
      class="menu-bg__molecule"
      :style="mol.style"
    >
      <svg :width="mol.size" :height="mol.size" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Ball and stick silhouette -->
        <circle :cx="30" :cy="20" :r="mol.r1" :fill="mol.color" :opacity="mol.opacity" />
        <circle :cx="18" :cy="42" :r="mol.r2" :fill="mol.color" :opacity="mol.opacity * 0.8" />
        <circle :cx="42" :cy="42" :r="mol.r2" :fill="mol.color" :opacity="mol.opacity * 0.8" />
        <line x1="30" y1="20" x2="18" y2="42" :stroke="mol.color" :stroke-width="1.5" :opacity="mol.opacity * 0.5" />
        <line x1="30" y1="20" x2="42" y2="42" :stroke="mol.color" :stroke-width="1.5" :opacity="mol.opacity * 0.5" />
      </svg>
    </div>

    <!-- Ambient particles -->
    <div
      v-for="p in particles"
      :key="p.id"
      class="menu-bg__particle"
      :style="p.style"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const bgRef = ref<HTMLElement>()

interface FloatingMol {
  id: number
  size: number
  r1: number
  r2: number
  color: string
  opacity: number
  style: Record<string, string>
}

interface Particle {
  id: number
  style: Record<string, string>
}

const colors = ['#8b5cf6', '#a78bfa', '#38bdf8', '#34d399', '#f472b6']

const molecules = ref<FloatingMol[]>([])
const particles = ref<Particle[]>([])

function generateMolecules() {
  const mols: FloatingMol[] = []
  for (let i = 0; i < 8; i++) {
    const size = 40 + Math.random() * 60
    const duration = 20 + Math.random() * 30
    const delay = Math.random() * -duration
    const startX = Math.random() * 100
    const startY = Math.random() * 100
    const color = colors[Math.floor(Math.random() * colors.length)]

    mols.push({
      id: i,
      size,
      r1: 5 + Math.random() * 4,
      r2: 3 + Math.random() * 3,
      color,
      opacity: 0.08 + Math.random() * 0.12,
      style: {
        left: `${startX}%`,
        top: `${startY}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        '--drift-x': `${(Math.random() - 0.5) * 300}px`,
        '--drift-y': `${(Math.random() - 0.5) * 300}px`,
        '--rotate': `${Math.random() * 360}deg`,
      },
    })
  }
  molecules.value = mols
}

function generateParticles() {
  const pts: Particle[] = []
  for (let i = 0; i < 20; i++) {
    const size = 2 + Math.random() * 3
    const duration = 10 + Math.random() * 20
    const delay = Math.random() * -duration
    const color = colors[Math.floor(Math.random() * colors.length)]

    pts.push({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        '--drift-x': `${(Math.random() - 0.5) * 200}px`,
        '--drift-y': `${(Math.random() - 0.5) * 200}px`,
      },
    })
  }
  particles.value = pts
}

onMounted(() => {
  generateMolecules()
  generateParticles()
})
</script>

<style scoped>
.menu-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--color-surface-900);
}

.menu-bg__gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 100%),
    radial-gradient(ellipse 40% 60% at 20% 80%, rgba(56, 189, 248, 0.04) 0%, transparent 100%),
    radial-gradient(ellipse 40% 60% at 80% 20%, rgba(244, 114, 182, 0.03) 0%, transparent 100%);
}

.menu-bg__molecule {
  position: absolute;
  animation: float-drift linear infinite;
  pointer-events: none;
  will-change: transform;
}

.menu-bg__particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation: float-drift linear infinite;
  pointer-events: none;
  filter: blur(1px);
  will-change: transform;
}

@keyframes float-drift {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--drift-x), var(--drift-y)) rotate(var(--rotate, 360deg));
    opacity: 0;
  }
}
</style>
