<template>
  <div class="menu-screen">
    <MenuBackground />

    <div class="menu-content">
      <!-- Title -->
      <div class="menu-title-group">
        <h1 class="menu-title">
          <span class="menu-title__iso">EL</span><span class="menu-title__mer">M</span>
        </h1>
        <p class="menu-subtitle">Element: The Core Chemistry Library</p>
      </div>

      <!-- Buttons -->
      <div class="menu-buttons">
        <a href="/main" class="menu-btn menu-btn--primary">
          <PhPlay :size="20" weight="fill" />
          <span>Start</span>
        </a>
        <a href="/about" class="menu-btn menu-btn--secondary">
          <PhInfo :size="20" weight="duotone" />
          <span>About</span>
        </a>
      </div>

      <!-- Footer -->
      <div class="menu-footer">
        <span>Built with TresJS + Vue 3</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuBackground from '@/components/MenuBackground.vue'
import { PhPlay, PhInfo } from '@phosphor-icons/vue'
</script>

<style scoped>
.menu-screen {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
}

.menu-title-group {
  text-align: center;
}

.menu-title {
  font-size: clamp(3.5rem, 8vw, 6rem);
  font-weight: 900;
  letter-spacing: 0.12em;
  line-height: 1;
  margin-bottom: 16px;
}

.menu-title__iso {
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.4));
}

.menu-title__mer {
  background: linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 30px rgba(56, 189, 248, 0.3));
}

.menu-subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 220px;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1.5px solid transparent;
}

.menu-btn--primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow:
    0 4px 20px rgba(139, 92, 246, 0.35),
    0 0 40px rgba(139, 92, 246, 0.15);
}

.menu-btn--primary:hover {
  transform: scale(1.05);
  box-shadow:
    0 6px 28px rgba(139, 92, 246, 0.5),
    0 0 60px rgba(139, 92, 246, 0.2);
}

.menu-btn--secondary {
  background: rgba(18, 18, 42, 0.6);
  backdrop-filter: blur(12px);
  color: var(--color-text-primary);
  border-color: rgba(139, 92, 246, 0.15);
}

.menu-btn--secondary:hover {
  transform: scale(1.05);
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.15);
}

.menu-footer {
  position: absolute;
  bottom: -120px;
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}
</style>
