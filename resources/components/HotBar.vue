<template>
  <div class="hotbar">
    <div
      v-for="(slot, index) in hotbarSlots"
      :key="index"
      :class="['hotbar__slot', { 'hotbar__slot--active': state.activeSlot === index }]"
      @pointerdown.stop
      @pointerup.stop
      @click.stop="setActiveSlot(index)"
    >
      <div v-if="slot.item" class="hotbar__item">
        <template v-if="slot.item.moleculeData">
          <img
            :src="`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${slot.item.moleculeData.cid}/PNG`"
            class="hotbar__icon--molecule pubchem-drawing"
            alt="Molecule structure"
          />
        </template>
        <template v-else>
          <component :is="getIconComponent(slot.item.icon)" :size="24" weight="duotone" class="hotbar__icon" />
        </template>
        <span v-if="slot.item.stackable && slot.count > 1" class="hotbar__count">{{ slot.count }}</span>
      </div>
      <span class="hotbar__key">{{ index + 1 }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInventory } from '@/scripts/engine/inventory'
import * as PhIcons from '@phosphor-icons/vue'

const { state, hotbarSlots, setActiveSlot } = useInventory()

function getIconComponent(iconName: string) {
  return (PhIcons as any)[iconName] ?? PhIcons.PhCube
}
</script>

<style scoped>
.hotbar {
  display: flex;
  gap: 16px; /* Increased gap for lonely squares */
  padding: 8px;
}

.hotbar__slot {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(18, 18, 42, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s;
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.hotbar__slot:hover {
  transform: scale(1.08);
  background: rgba(26, 26, 58, 0.9);
}

.hotbar__slot--active {
  transform: scale(1.15);
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.6);
}

.hotbar__item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.hotbar__icon {
  color: var(--color-accent-400);
  transition: transform 0.15s ease;
}

.hotbar__icon--molecule {
  width: 100%;
  height: 100%;
}

.pubchem-drawing {
  filter: grayscale(1) invert(1);
  mix-blend-mode: screen;
  object-fit: contain;
  padding: 2px;
  transform: scale(1.5);
}

.hotbar__slot--active .hotbar__icon {
  color: var(--color-accent-400);
  filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.4));
  transform: scale(1.1);
}

.hotbar__count {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-primary);
  background: rgba(139, 92, 246, 0.4);
  padding: 0 4px;
  border-radius: 4px;
  line-height: 1.4;
}

.hotbar__key {
  position: absolute;
  top: 3px;
  left: 5px;
  font-size: 9px;
  font-weight: 600;
  color: var(--color-text-muted);
  opacity: 0.5;
}

@media (max-width: 768px) {
  .hotbar {
    gap: 6px;
    padding-bottom: env(safe-area-inset-bottom, 36px); /* Better lift for mobile bottom glitches */
  }
  .hotbar__slot {
    width: 44px;
    height: 44px;
  }
  .pubchem-drawing {
    transform: scale(2.5); /* Massive scale for tiny slots */
  }
}
</style>
