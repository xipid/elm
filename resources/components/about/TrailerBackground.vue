<template>
  <div class="trailer-bg">
    <canvas ref="canvasRef" class="particle-canvas"></canvas>
    <div class="nebula-layer"></div>
    <div class="grain-overlay"></div>
    <div class="vignette"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement>()
let animId: number
let particles: Particle[] = []

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  pulse: number
  pulseSpeed: number
}

const COLORS = ['#8b5cf6', '#a78bfa', '#38bdf8', '#c4b5fd', '#818cf8', '#6366f1']

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 3 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.15 - 0.1,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.02 + 0.005
  }
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!

  function resize() {
    canvas!.width = window.innerWidth
    canvas!.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Create particles
  const count = Math.min(120, Math.floor(window.innerWidth * window.innerHeight / 8000))
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(canvas.width, canvas.height))
  }

  // Draw connections between nearby particles
  function drawConnections(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.08 * Math.min(a.opacity, b.opacity)
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas!.width, canvas!.height)

    for (const p of particles) {
      p.x += p.vx * p.z
      p.y += p.vy * p.z
      p.pulse += p.pulseSpeed

      // Wrap around
      if (p.x < -10) p.x = canvas!.width + 10
      if (p.x > canvas!.width + 10) p.x = -10
      if (p.y < -10) p.y = canvas!.height + 10
      if (p.y > canvas!.height + 10) p.y = -10

      const pulsedOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse))
      const pulsedSize = p.size * (0.8 + 0.2 * Math.sin(p.pulse))
      const { r, g, b } = hexToRgb(p.color)

      // Glow
      ctx.beginPath()
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsedSize * 4)
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${pulsedOpacity * 0.3})`)
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      ctx.fillStyle = gradient
      ctx.arc(p.x, p.y, pulsedSize * 4, 0, Math.PI * 2)
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulsedOpacity})`
      ctx.arc(p.x, p.y, pulsedSize, 0, Math.PI * 2)
      ctx.fill()
    }

    drawConnections(ctx)
    animId = requestAnimationFrame(animate)
  }

  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  particles = []
})
</script>

<style scoped>
.trailer-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.nebula-layer {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(ellipse 600px 400px at 20% 30%, rgba(139, 92, 246, 0.06) 0%, transparent 70%),
    radial-gradient(ellipse 500px 500px at 80% 60%, rgba(56, 189, 248, 0.04) 0%, transparent 70%),
    radial-gradient(ellipse 400px 300px at 50% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
  animation: nebulaDrift 60s ease-in-out infinite alternate;
}

@keyframes nebulaDrift {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-5%, 3%) rotate(2deg); }
  100% { transform: translate(3%, -2%) rotate(-1deg); }
}

.grain-overlay {
  position: absolute;
  inset: -100%;
  width: 300%;
  height: 300%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: 0.4;
  animation: grainShift 0.5s steps(5) infinite;
}

@keyframes grainShift {
  0% { transform: translate(0, 0); }
  20% { transform: translate(-2%, 3%); }
  40% { transform: translate(3%, -1%); }
  60% { transform: translate(-1%, 2%); }
  80% { transform: translate(2%, -3%); }
  100% { transform: translate(0, 0); }
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.7) 100%);
}
</style>
