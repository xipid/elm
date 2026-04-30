<template>
  <Transition name="slide-up">
    <div v-show="state.isOpen" class="inventory-overlay" @keydown.esc="closeInventory" tabindex="0" ref="overlayRef">
      
      <!-- Infinite Pan/Zoom Space -->
      <div 
        class="inventory-space" 
        @pointerdown.stop="onPointerDown"
        @pointermove.stop="onPointerMove"
        @pointerup.stop="onPointerUp"
        @pointercancel.stop="onPointerUp"
        @wheel.stop.prevent="onWheel"
        @dragover.prevent
        @drop="onGlobalDrop"
      >
        <div class="inventory-scale-wrapper" :style="transformStyle">
          <!-- Lonely Island Delete Bin flexed next to the grid -->
          <div class="inventory-main-container">
            <div 
              class="inventory__slot inventory__slot--bin island-bin"
              @dragover.prevent
              @drop.stop="onDropBin"
            >
              <PhTrash :size="32" weight="bold" class="inventory__bin-icon" />
              <span class="inventory__bin-label">Discard</span>
            </div>
    
            <div class="inventory-grid-wrapper">
              <!-- Embedded Research Area -->
              <div class="inventory-research-area">
            <div class="inventory-search">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search IUPAC / Formula..." 
                class="inventory-search__input"
                @keydown.stop
                @pointerdown.stop
              />
            </div>
            <div v-if="searchResults.length > 0" class="inventory-isomers">
              <div 
                v-for="(mol, i) in searchResults" 
                :key="i"
                class="inventory-isomer__card"
                draggable="true"
                @dragstart="onResultDragStart(mol, $event)"
              >
                <img
                  :src="`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${mol.cid}/PNG`"
                  class="inventory-isomer__icon pubchem-drawing"
                />
                <span class="inventory-isomer__name">{{ mol.name || mol.formula }}</span>
              </div>
            </div>
          </div>

          <div class="inventory__grid">
            <div
              v-for="(slot, index) in state.slots"
              :key="index"
              :class="[
                'inventory__slot',
                {
                  'inventory__slot--active': state.activeSlot === index,
                  'inventory__slot--hotbar': index < HOTBAR_SLOTS,
                  'inventory__slot--dragging': dragIndex === index,
                },
              ]"
              :draggable="slot.item !== null"
              @click="setActiveSlot(index)"
              @dragstart="onDragStart(index, $event)"
              @dragover.prevent
              @drop.stop="onDrop(index)"
              @dragend="onDragEnd"
              @touchstart.passive="onTouchStart(index, $event)"
              @touchmove.prevent="onTouchMove($event)"
              @touchend="onTouchEnd(index, $event)"
            >
              <div v-if="slot.item" class="inventory__item">
                <template v-if="slot.item.moleculeData">
                  <img
                    :src="`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${slot.item.moleculeData.cid}/PNG`"
                    class="inventory__icon--molecule pubchem-drawing"
                    alt="Molecule structure"
                  />
                </template>
                <template v-else>
                  <component
                    :is="getIconComponent(slot.item.icon)"
                    :size="48"
                    weight="duotone"
                    class="inventory__icon"
                  />
                </template>
                <span v-if="slot.item.stackable && slot.count > 1" class="inventory__count">
                  {{ slot.count }}
                </span>
              </div>

              <!-- Hotbar indicator -->
              <div v-if="index < HOTBAR_SLOTS" class="inventory__hotbar-badge">
                {{ index + 1 }}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>


      <!-- HUD -->
      <div class="inventory-hud">
        <div class="inventory-hud__header">
          <button class="inventory__back" @click="closeInventory">
            <PhArrowLeft :size="20" weight="bold" />
            <span>Back</span>
          </button>
          
          <span class="inventory__hint">Scroll to zoom · Drag to pan</span>
        </div>

        <Transition name="fade">
          <div v-if="currentItem" class="inventory__info">
            <div class="inventory__info-header">
              <component
                :is="getIconComponent(currentItem.icon)"
                :size="24"
                weight="duotone"
                class="inventory__info-icon"
              />
              <span class="inventory__info-name">{{ currentItem.title }}</span>
            </div>
            <p class="inventory__info-desc">{{ currentItem.description }}</p>
          </div>
        </Transition>
      </div>
      
    </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useInventory } from '@/scripts/engine/inventory'
import { Molecule } from '../../src/molecule'
import { PhArrowLeft, PhTrash, PhAtom } from '@phosphor-icons/vue'
import * as PhIcons from '@phosphor-icons/vue'

const {
  state,
  currentItem,
  setActiveSlot,
  closeInventory,
  swapSlots,
  addItem,
  removeItem,
  HOTBAR_SLOTS,
} = useInventory()

const dragIndex = ref<number | null>(null)
const draggedResult = ref<any | null>(null)
const overlayRef = ref<HTMLElement>()

// Search logic
const searchQuery = ref('')
const searchResults = ref<any[]>([])
let searchTimeout: any = null
let searchAbortController: AbortController | null = null

watch(searchQuery, (q) => {
  clearTimeout(searchTimeout)
  if (searchAbortController) {
    searchAbortController.abort()
  }
  
  if (!q.trim()) {
    searchResults.value = []
    return
  }
  
  searchTimeout = setTimeout(async () => {
    searchAbortController = new AbortController()
    try {
      const molecules = await Molecule.fromAny(q, searchAbortController.signal)
      searchResults.value = molecules.slice(0, 6).map(m => m.toMoleculeData())
    } catch (e) {
      if ((e as any).name !== 'AbortError') {
        searchResults.value = []
      }
    } finally {
      searchAbortController = null
    }
  }, 300)
})

// Space panning and zooming
const pan = ref({ x: 0, y: 0 })
const zoom = ref(1)
let isDraggingSpace = false
let lastMouse = { x: 0, y: 0 }

watch(() => state.isOpen, (open) => {
  if (open) {
    // Reset view
    pan.value = { x: 0, y: 0 }
    zoom.value = 1
    nextTick(() => overlayRef.value?.focus())
  }
})

const transformStyle = computed(() => ({
  transform: `translate(${pan.value.x}px, ${pan.value.y}px) scale(${zoom.value})`,
}))

function onPointerDown(e: PointerEvent) {
  const target = e.target as HTMLElement
  if (target.closest('.inventory__slot') || 
      target.closest('.inventory-hud') || 
      target.closest('.inventory-research-area') || 
      target.closest('.inventory-isomers')) return
  isDraggingSpace = true
  lastMouse = { x: e.clientX, y: e.clientY }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDraggingSpace) return
  const dx = e.clientX - lastMouse.x
  const dy = e.clientY - lastMouse.y
  lastMouse = { x: e.clientX, y: e.clientY }
  pan.value.x += dx
  pan.value.y += dy
}

function onPointerUp(e: PointerEvent) {
  isDraggingSpace = false
  if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }
}

function onWheel(e: WheelEvent) {
  const zoomFactor = 0.05
  const newZoom = zoom.value * (e.deltaY > 0 ? (1 - zoomFactor) : (1 + zoomFactor))
  zoom.value = Math.max(0.3, Math.min(3, newZoom))
}

function getIconComponent(iconName: string) {
  return (PhIcons as any)[iconName] ?? PhIcons.PhCube
}

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onResultDragStart(mol: any, event: DragEvent) {
  draggedResult.value = mol
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    // Ensure the whole card is used as the drag image
    const card = (event.currentTarget as HTMLElement)
    event.dataTransfer.setDragImage(card, card.offsetWidth / 2, card.offsetHeight / 2)
  }
}

function onDrop(targetIndex: number) {
  if (dragIndex.value !== null && dragIndex.value !== targetIndex) {
    swapSlots(dragIndex.value, targetIndex)
  } else if (draggedResult.value) {
    // Add result to this slot
    const item = {
      id: `mol_${draggedResult.value.formula}_${draggedResult.value.cid}`,
      icon: 'PhAtom',
      title: draggedResult.value.name,
      description: `Formula: ${draggedResult.value.formula}`,
      stackable: true,
      maxStack: 99,
      moleculeData: draggedResult.value,
      energy: 0
    }
    // Handle manual slot assignment or generic addItem
    addItem(item, 64)
  }
  dragIndex.value = null
  draggedResult.value = null
}

function onGlobalDrop() {
  // Reset if dropped in void
  dragIndex.value = null
  draggedResult.value = null
}

function onDropBin() {
  if (dragIndex.value !== null) {
    removeItem(dragIndex.value, 999) // Delete entire stack
  }
  dragIndex.value = null
  draggedResult.value = null
}

function onDragEnd() {
  dragIndex.value = null
  draggedResult.value = null
}

// Touch Handling for Mobile Drag/Drop
let touchDragIndex: number | null = null;
let touchStartX = 0;
let touchStartY = 0;

function onTouchStart(index: number, e: TouchEvent) {
  if (state.slots[index].item === null) return;
  touchDragIndex = index;
  dragIndex.value = index;
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function onTouchMove(e: TouchEvent) {
  if (touchDragIndex === null) return;
  // Visual feedback could be added here if needed, but for now we just track completion
}

function onTouchEnd(index: number, e: TouchEvent) {
  if (touchDragIndex === null) return;
  
  const touch = e.changedTouches[0];
  const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
  const slotEl = targetEl?.closest('.inventory__slot');
  const binEl = targetEl?.closest('.island-bin');

  if (binEl) {
    onDropBin();
  } else if (slotEl) {
    // Find the index of the slot element
    const allSlots = Array.from(document.querySelectorAll('.inventory__slot'));
    const targetIdx = allSlots.indexOf(slotEl as any);
    if (targetIdx !== -1) {
      onDrop(targetIdx);
    }
  }

  touchDragIndex = null;
  dragIndex.value = null;
}
</script>

<style scoped>
.inventory-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(7, 7, 15, 0.4);
  backdrop-filter: blur(20px);
  outline: none;
}

.inventory-space {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none; /* prevent browser panning */
  user-select: none;
  -webkit-user-select: none;
}

.inventory-grid-wrapper {
  will-change: transform;
  transform-origin: center center;
}

.inventory__grid {
  display: grid;
  grid-template-columns: repeat(6, 120px);
  grid-auto-rows: 120px;
  gap: 16px;
  padding: 40px;
}

/* Scale wrapper */
.inventory-scale-wrapper {
  display: flex;
  flex-direction: column;
  transform-origin: center center;
  transition: transform 0.1s linear;
}

/* Main container that aligns bin and grid */
.inventory-main-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 40px;
}

.island-bin {
  width: 120px;
  height: 120px;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.island-bin:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
  transform: translateY(-8px) scale(1.05); /* Modernized hover transform lacking absolute coords */
}

.inventory__bin-icon {
  color: #ef4444;
}

.inventory__bin-label {
  font-size: 11px;
  font-weight: 800;
  color: #ef4444;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.inventory__slot {
  position: relative;
  width: 120px;
  height: 120px;
  background: rgba(18, 18, 42, 0.7);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(12px);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.inventory__slot:hover {
  background: rgba(26, 26, 58, 0.8);
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(139, 92, 246, 0.2);
}

.inventory__slot--active {
  border-color: rgba(139, 92, 246, 0.6);
  background: rgba(139, 92, 246, 0.15);
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.3);
}

.inventory__slot--hotbar {
  background: rgba(18, 18, 42, 0.8);
  border-color: rgba(56, 189, 248, 0.2);
}

.inventory__slot--dragging {
  opacity: 0.4;
  transform: scale(0.9);
}

.inventory__icon {
  color: var(--color-accent-400);
  filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.4));
}

.inventory__icon--molecule {
  width: 100%;
  height: 100%;
}

.pubchem-drawing {
  filter: grayscale(1) invert(1);
  mix-blend-mode: screen;
  object-fit: contain;
  padding: 2px;
  transform: scale(2.0);
}

.inventory__count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 14px;
  font-weight: 800;
  color: white;
  background: rgba(139, 92, 246, 0.6);
  padding: 2px 8px;
  border-radius: 6px;
}

.inventory__hotbar-badge {
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 12px;
  font-weight: 800;
  color: #38bdf8;
  opacity: 0.7;
}

/* HUD Overlay inside inventory */
.inventory-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px;
}

.inventory-hud > * {
  pointer-events: auto;
}

.inventory-hud__header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.inventory__back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(18, 18, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: var(--color-text-primary);
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.inventory__back:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.4);
}

.inventory__title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

.inventory__hint {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* IUPAC Search inside grid wrapper */
.inventory-research-area {
  display: flex;
  flex-direction: column-reverse; /* Reverses order so isomers are on top */
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
  pointer-events: auto;
}

.inventory-search {
  width: 100%;
  display: flex;
  justify-content: center;
}

.inventory-search__input {
  width: 100%;
  max-width: 600px;
  background: rgba(18, 18, 42, 0.6);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 14px;
  padding: 16px 24px;
  color: white;
  font-family: inherit;
  font-size: 18px;
  font-weight: 600;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.inventory-search__input:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(26, 26, 58, 0.8);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.2);
}

/* Isomers */
.inventory-isomers {
  display: flex;
  justify-content: center;
  gap: 20px;
  pointer-events: auto;
}

.inventory-isomer__card {
  width: 110px;
  height: 130px;
  background: rgba(18, 18, 42, 0.85);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(8px);
  padding: 12px;
  overflow: hidden;
}

.inventory-isomer__card:hover {
  transform: translateY(-8px) scale(1.05);
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.2);
}

.inventory-isomer__icon {
  width: 64px;
  height: 64px;
  transform: scale(2.8); /* Massively scale topological icons */
}

.inventory-isomer__name {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inventory__info {
  align-self: flex-end;
  background: rgba(12, 12, 26, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 20px;
  padding: 24px;
  width: 360px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.inventory__info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.inventory__info-icon {
  color: var(--color-accent-400);
}

.inventory__info-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.inventory__info-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
</style>
