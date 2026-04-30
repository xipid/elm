<template>
  <div class="action-panel" @pointerdown.stop @mousedown.stop @touchstart.stop>
    <TransitionGroup name="action-list">
      <button
        v-for="action in availableActions"
        :key="action.id"
        class="action-btn"
        :class="{ 
          'action-btn--active': heldActions.includes(action.id),
          'action-btn--default': isDefault(action.id)
        }"
        :style="{ order: isDefault(action.id) ? -1 : 0 }"
        @pointerdown.stop.prevent="onPointerDown(action.id)"
        @pointerup.stop.prevent="onPointerUp(action.id)"
        @pointerleave.stop.prevent="onPointerUp(action.id)"
        @pointermove.stop.prevent
        @contextmenu.prevent
        :title="action.title + '\n' + action.description"
      >
        <component :is="getIconComponent(action.icon)" :size="20" weight="duotone" class="action-btn__icon" />
      </button>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useGameLoop } from '@/scripts/engine/game-loop'
import { useInventory } from '@/scripts/engine/inventory'
import { useSpace } from '@/scripts/engine/space'
import { getGlobalActions } from '@/scripts/engine/items'
import * as PhIcons from '@phosphor-icons/vue'

const gameLoop = useGameLoop()
const inventory = useInventory()
const space = useSpace()
const { heldActions, availableActions } = gameLoop

function isDefault(id: string) {
  const item = inventory.currentItem.value
  if (item?.moleculeData && id === 'drop_molecule') return true
  return false
}

function getIconComponent(iconName: string) {
  return (PhIcons as any)[iconName] ?? PhIcons.PhCube
}

function onPointerDown(id: string) {
  if (id === 'inventory') {
    inventory.toggleInventory()
    return
  }
  if (id === 'drop_molecule') {
    const item = inventory.currentItem.value
    if (item?.moleculeData) {
      gameLoop.handleEmptyClick(space.state.pointerWorldPosition)
    }
    return
  }
  if (id === 'fullscreen') {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(()=>{})
    } else {
      document.exitFullscreen().catch(()=>{})
    }
    return
  }
  if (!heldActions.value.includes(id)) {
    heldActions.value.push(id)
  }
  
  if ((id === 'absorb' || id === 'release') && space.state.selectedObjectUid) {
    if (id === 'absorb') {
      const taken = space.transferEnergy(space.state.selectedObjectUid, 10)
      space.state.playerEnergy = Math.min(space.state.maxPlayerEnergy, space.state.playerEnergy + taken)
    } else {
      const give = Math.min(10, space.state.playerEnergy)
      space.addEnergy(space.state.selectedObjectUid, give)
      space.state.playerEnergy -= give
    }
  }
}

function onPointerUp(id: string) {
  if (id === 'inventory' || id === 'drop_molecule' || id === 'fullscreen') return
  const idx = heldActions.value.indexOf(id)
  if (idx !== -1) {
    heldActions.value.splice(idx, 1)
  }
}
</script>

<style scoped>
.action-panel {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  pointer-events: auto;
  margin-right: 12px;
  margin-bottom: 12px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: rgba(18, 18, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.action-btn:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-2px);
}

.action-btn--default {
  transform: scale(1.6);
  margin-top: 10px; /* Separates the huge default button visually from the rest above it in column-reverse */
}

.action-btn--default:hover {
  transform: scale(1.6) translateY(-2px);
}

.action-btn--active {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 
    0 0 16px rgba(139, 92, 246, 0.3),
    inset 0 0 12px rgba(139, 92, 246, 0.2);
  transform: scale(0.95);
}

.action-btn--default.action-btn--active {
  transform: scale(1.2);
  border-color: rgba(139, 92, 246, 0.8);
  box-shadow: 
    0 0 16px rgba(139, 92, 246, 0.4),
    inset 0 0 12px rgba(139, 92, 246, 0.2);
}

/* Transitions */
.action-list-enter-active,
.action-list-leave-active {
  transition: all 0.3s ease;
}
.action-list-enter-from,
.action-list-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.action-btn__icon {
  color: var(--color-accent-400);
  transition: transform 0.2s ease;
}

.action-btn--active .action-btn__icon {
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .action-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
