<template>
  <div class="game-screen" tabindex="0" ref="screenRef"
    @pointerdown.capture="onPointerDown"
    @pointermove.capture="onPointerMove"
    @pointerup.capture="onPointerUp"
    @pointercancel.capture="onPointerUp"
  >
    <!-- 3D Space -->
    <GameSpace
      @object-click="onObjectClick"
      @object-hover="onObjectHover"
      @empty-click="onEmptyClick"
    />

    <!-- HUD Overlays -->
    <div class="game-hud">
      <!-- Top left: back button + info -->
      <div class="game-hud__top-left">
        <a href="/" class="game-hud__back">
          <PhArrowLeft :size="18" weight="bold" />
          <span>Menu</span>
        </a>
      </div>

      <!-- Player Global Energy -->
      <div class="game-hud__player-energy">
        <div class="game-hud__energy-fill" :style="{ width: `${(Math.min(space.state.playerEnergy, space.state.maxPlayerEnergy) / space.state.maxPlayerEnergy) * 100}%` }"></div>
        <span class="game-hud__energy-val">{{ Math.round(space.state.playerEnergy) }} / {{ space.state.maxPlayerEnergy }} kJ/mol</span>
      </div>

      <!-- Selected object info -->
      <Transition name="fade">
        <div class="game-hud__object-card" v-if="selectedObject">
          <div class="game-hud__object-name">
            {{ selectedObject.moleculeData.name || selectedObject.moleculeData.iupac || selectedObject.moleculeData.formula }}
          </div>
          <div class="game-hud__object-subname">
            {{ selectedObject.moleculeData.name ? (selectedObject.moleculeData.iupac || selectedObject.moleculeData.formula) : selectedObject.moleculeData.formula }}
          </div>
          <div class="game-hud__object-details">
            <span>Formula: {{ selectedObject.moleculeData.formula }}</span>
            <span>Energy: {{ Math.round(selectedObject.energy) }} kJ/mol</span>
            <span>Atoms: {{ selectedObject.moleculeData.atoms.length }}</span>
          </div>
        </div>
      </Transition>

      <!-- Bottom center: hotbar -->
      <div class="game-hud__bottom">
        <SnackContainer class="game-hud__snack" />
        <HotBar />
      </div>

      <!-- Bottom right: actions -->
      <div class="game-hud__bottom-right">
        <ActionPanel />
      </div>
    </div>

    <!-- Inventory overlay -->
    <Inventory />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useCurtain, SnackContainer } from "fictif"
import { PhArrowLeft, PhLightning, PhAtom } from '@phosphor-icons/vue'

import GameSpace from '@/components/GameSpace.vue'
import HotBar from '@/components/HotBar.vue'
import ActionPanel from '@/components/ActionPanel.vue'
import Inventory from '@/components/Inventory.vue'

import { useGameLoop } from '@/scripts/engine/game-loop'
import { useSpace } from '@/scripts/engine/space'
import { useInventory, initializeInventory } from '@/scripts/engine/inventory'
import { getMolecule, STARTER_MOLECULES } from '@/scripts/engine/molecules'

const screenRef = ref<HTMLElement>()
const curtain = useCurtain();

const loadFinish = curtain.start();

const router = useRouter()
const gameLoop = useGameLoop()
const space = useSpace()
const inventory = useInventory()

const { heldActions, handleKeyDown: loopKeyDown, handleKeyUp: loopKeyUp } = gameLoop
const currentItem = inventory.currentItem

const selectedObject = computed(() => {
  if (space.state.hoveredObjectUid) return space.getObject(space.state.hoveredObjectUid) ?? null
  if (!space.state.selectedObjectUid) return null
  return space.getObject(space.state.selectedObjectUid) ?? null
})

// ── Initialize game ──
onMounted(async () => {
  screenRef.value?.focus()

  if (!space.state.isInitialized) {
    // Init inventory with starter items
    initializeInventory()

    // Fetch and populate inventory starters
    try {
      const o2 = await getMolecule('O2');
      if (o2) inventory.addMoleculeItem({ moleculeData: o2, energy: 0 }, 64);
      
      const ch4 = await getMolecule('CH4');
      if (ch4) inventory.addMoleculeItem({ moleculeData: ch4, energy: 0 }, 64);
      
      // Spawn starter molecules
      for (const name of STARTER_MOLECULES) {
        const mol = await getMolecule(name)
        if (mol) {
          const count = name === 'water' ? 3 : 1
          for (let i = 0; i < count; i++) {
            space.spawnMolecule(mol, undefined, 30 + Math.random() * 60)
          }
        }
      }
    } catch (err) {
      console.error('[Isomer] Failed to load starter molecules:', err)
    }
    
    
    space.state.isInitialized = true
    
    // Set initial scale depending on screen size
    if (window.innerWidth < 768) {
      space.state.camera.zoom = 20; // Zoomed out for mobile
    } else {
      space.state.camera.zoom = 40; // Desktop default
    }
  }

  // Stop loading
  loadFinish();

  // Start game loop
  gameLoop.start()

  // Pointer listeners (now handle touch)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
  
  window.addEventListener('blur', () => { 
    isDragging = false; 
    space.state.draggedObjectUid = null; 
    activePointers.clear();
  })
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  screenRef.value?.addEventListener('wheel', onWheel, { passive: false })
})

onUnmounted(() => {
  gameLoop.stop()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  screenRef.value?.removeEventListener('wheel', onWheel)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
})

function onKeyUp(e: KeyboardEvent) {
  loopKeyUp(e.key)
}

function onKeyDown(e: KeyboardEvent) {
  // If a snack or input is active, don't handle game keys
  const snackActive = document.querySelector('.fictif-snack-manager--active');
  if (snackActive) return;

  loopKeyDown(e.key)
  // Don't handle if inventory overlay has focus
  if (e.repeat) return

  switch (e.key.toLowerCase()) {
    case 'f':
      e.preventDefault()
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(()=>{})
      } else {
        document.exitFullscreen().catch(()=>{})
      }
      break
    case 'e':
      e.preventDefault()
      inventory.toggleInventory()
      break
    case '1': case '2': case '3': case '4': case '5': case '6':
      e.preventDefault()
      inventory.setActiveSlot(parseInt(e.key) - 1)
      break
    case 'escape':
      if (inventory.state.isOpen) {
        inventory.closeInventory()
      } else {
        space.selectObject(null)
      }
      break
  }
}

function onWheel(e: WheelEvent) {
  if (inventory.state.isOpen) return
  e.preventDefault()

  if (e.ctrlKey) {
    // Zoom
    const delta = e.deltaY > 0 ? -1 : 1
    space.zoomCamera(delta)
    // Force reactivity update in case TresJS orthographic camera doesn't watch zoom deeply
    space.state.camera = { ...space.state.camera }
  } else if (e.shiftKey) {
    // Horizontal pan
    space.panCamera(e.deltaY * 0.05, 0)
  } else {
    // Hotbar cycle
    inventory.scrollActiveSlot(e.deltaY > 0 ? 1 : -1)
  }
}

function onObjectClick(uid: string) {
  gameLoop.handleObjectClick(uid, false)
}

function onObjectHover(uid: string | null) {
  space.hoverObject(uid)
}

function onEmptyClick(position: { x: number; y: number; z: number }) {
  gameLoop.handleEmptyClick(position)
}

// ── Camera & Molecule Panning ──
let isDragging = false
let lastMouse = { x: 0, y: 0 }
let velocityBuffer: { x: number; y: number; time: number }[] = []
let dragStartPoint = { x: 0, y: 0 }
let isClickPotential = false
let lastClickTime = 0
const DOUBLE_CLICK_DELAY = 300

// Multi-touch tracking
const activePointers = new Map<number, { x: number, y: number, startX: number, startY: number }>()

function getMouseWorldPosition(clientX: number, clientY: number) {
  const rect = screenRef.value?.getBoundingClientRect()
  if (!rect) return { x: space.state.camera.x, z: space.state.camera.y }
  
  const worldX = space.state.camera.x + (clientX - rect.left - rect.width / 2) / space.state.camera.zoom
  const worldZ = space.state.camera.y + (clientY - rect.top - rect.height / 2) / space.state.camera.zoom
  
  return { x: worldX, z: worldZ }
}

function onPointerDown(e: PointerEvent) {
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY })
  
  // Ignore world-space interaction for HUD/Inventory
  if ((e.target as HTMLElement).closest('.game-hud') || (e.target as HTMLElement).closest('.inventory-overlay')) {
    isClickPotential = false
    return
  }
  
  if (activePointers.size === 1) {
    // Spatial distance check for mobile targeting (Phones don't have "hover" before touching)
    if (!space.state.hoveredObjectUid && e.pointerType === 'touch') {
      const wp = getMouseWorldPosition(e.clientX, e.clientY)
      let closest = null
      let closestDist = 4.5 // Increased selection radius for mobile thumbs
      for (const obj of space.state.objects) {
        const dist = Math.sqrt((obj.position.x - wp.x)**2 + (obj.position.z - wp.z)**2)
        if (dist < closestDist) {
          closestDist = dist
          closest = obj.uid
        }
      }
      if (closest) space.hoverObject(closest);
    }
  
    const isRightClick = e.button === 2
    
    if (space.state.hoveredObjectUid && !isRightClick) {
      // Start dragging molecule
      const { heldActions, keysHeld } = gameLoop
      if (e.ctrlKey || heldActions.value.includes('rotate') || keysHeld.has('r')) {
        space.state.draggedObjectAction = 'rotate'
      } else {
        space.state.draggedObjectAction = 'move'
      }
      space.state.draggedObjectUid = space.state.hoveredObjectUid
  
      const obj = space.getObject(space.state.draggedObjectUid)
      if (obj) {
        obj.velocity.x = 0
        obj.velocity.z = 0
      }
    } else {
      // Start dragging camera
      isDragging = true
      space.selectObject(null)
    }
  
    lastMouse = { x: e.clientX, y: e.clientY }
    dragStartPoint = { x: e.clientX, y: e.clientY }
    velocityBuffer = []
    isClickPotential = true
    
    if (screenRef.value) {
      try { screenRef.value.setPointerCapture(e.pointerId); } catch (err) {}
    }
  } else if (activePointers.size === 2) {
    // Pinch to zoom started
    isDragging = false
    space.state.draggedObjectUid = null
    isClickPotential = false
  }
}

function onPointerMove(e: PointerEvent) {
  if (activePointers.size === 2 && activePointers.has(e.pointerId)) {
    // Pinch zoom logic
    const pointers = Array.from(activePointers.values())
    const distOld = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
    
    activePointers.get(e.pointerId)!.x = e.clientX
    activePointers.get(e.pointerId)!.y = e.clientY
    
    const distNew = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
    
    if (distOld > 0) {
      const scale = distNew / distOld
      space.state.camera.zoom = Math.max(10, Math.min(100, space.state.camera.zoom * scale))
      space.state.camera = { ...space.state.camera }
    }
    return
  }

  if (activePointers.has(e.pointerId)) {
    activePointers.get(e.pointerId)!.x = e.clientX
    activePointers.get(e.pointerId)!.y = e.clientY
  }

  if (activePointers.size <= 1) {
    const dx = e.clientX - lastMouse.x
    const dy = e.clientY - lastMouse.y
    lastMouse = { x: e.clientX, y: e.clientY }
    
    space.state.pointerWorldPosition = getMouseWorldPosition(e.clientX, e.clientY)
    
    if (Math.abs(e.clientX - dragStartPoint.x) > 8 || Math.abs(e.clientY - dragStartPoint.y) > 8) {
      isClickPotential = false
    }
    
    if (space.state.draggedObjectUid) {
      const { heldActions, keysHeld } = gameLoop
      if (e.ctrlKey || heldActions.value.includes('rotate') || keysHeld.has('r')) {
        space.state.draggedObjectAction = 'rotate'
      } else {
        space.state.draggedObjectAction = 'move'
      }
  
      velocityBuffer.push({ x: dx, y: dy, time: performance.now() })
      if (velocityBuffer.length > 5) velocityBuffer.shift()
  
      const obj = space.getObject(space.state.draggedObjectUid)
      if (obj) {
        if (space.state.draggedObjectAction === 'move') {
          const panSpeed = 1 / space.state.camera.zoom
          const moveX = dx * panSpeed
          const moveZ = dy * panSpeed
          obj.position.x += moveX
          obj.position.z += moveZ
        } else if (space.state.draggedObjectAction === 'rotate') {
          obj.rotation.y += dx * 0.01
          obj.rotation.x += dy * 0.01
        }
      }
      return
    }
  
    if (isDragging) {
      const panSpeed = 1 / space.state.camera.zoom
      space.panCamera(-dx * panSpeed, -dy * panSpeed)
    }
  }
}

function onPointerUp(e: PointerEvent) {
  const ptr = activePointers.get(e.pointerId)
  if (ptr && e.pointerType === 'touch') {
     const dy = ptr.startY - e.clientY
     const dx = Math.abs(ptr.startX - e.clientX)
     // swipe up check: significant Y delta, small X delta, started in bottom half
     if (dy > 60 && dx < 100 && ptr.startY > window.innerHeight * 0.5) {
         inventory.openInventory()
         activePointers.delete(e.pointerId)
         space.state.draggedObjectUid = null
         isDragging = false
         return
     }
  }
  
  const touchWasActive = ptr && e.pointerType === 'touch'
  activePointers.delete(e.pointerId)

  if (isDragging && screenRef.value && screenRef.value.hasPointerCapture(e.pointerId)) {
    try { screenRef.value.releasePointerCapture(e.pointerId) } catch (err) {}
  }

  // Only handle dropping or clicking if no other fingers are touching
  if (activePointers.size === 0) {
    isDragging = false
  
    if (space.state.draggedObjectUid) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const inHotbar = el?.closest('.hotbar');
      const inInventory = el?.closest('.inventory-overlay');
      
      // Only add to inventory if intentional (inventory is open or dropped specifically on hotbar/slots)
      if (inInventory || inHotbar) {
        const obj = space.getObject(space.state.draggedObjectUid)
        if (obj) {
          inventory.addMoleculeItem(obj)
          space.removeObject(obj.uid)
        }
      } else {
        const obj = space.getObject(space.state.draggedObjectUid)
        if (obj && space.state.draggedObjectAction === 'move') {
          const recent = velocityBuffer.filter(v => performance.now() - v.time < 100)
          if (recent.length > 0) {
            const avgX = recent.reduce((sum, v) => sum + v.x, 0) / recent.length
            const avgY = recent.reduce((sum, v) => sum + v.y, 0) / recent.length
            const panSpeed = 1 / space.state.camera.zoom
            obj.velocity.x = avgX * panSpeed
            obj.velocity.z = avgY * panSpeed
          }
        }
      }
      
      if (isClickPotential) {
        const isRightClick = e.button === 2
        gameLoop.handleObjectClick(space.state.draggedObjectUid, isRightClick)
      }
  
      space.state.draggedObjectUid = null
      space.state.draggedObjectAction = null
      velocityBuffer = []
    } else if (isClickPotential) {
      const isRightClick = e.button === 2
      const now = performance.now()
      const isDoubleClick = now - lastClickTime < DOUBLE_CLICK_DELAY
      lastClickTime = now
  
      if (space.state.hoveredObjectUid) {
        gameLoop.handleObjectClick(space.state.hoveredObjectUid, isRightClick, isDoubleClick)
      } else if (!isDoubleClick && !isRightClick) {
        const pos = getMouseWorldPosition(e.clientX, e.clientY)
        gameLoop.handleEmptyClick({ x: pos.x, y: 0, z: pos.z })
        space.selectObject(null) // Clears selected on empty space click
      }
    }

    if (touchWasActive) {
      space.hoverObject(null)
    }
  }
}
</script>

<style scoped>
.game-screen {
  width: 100%;
  height: 100vh;
  position: relative;
  outline: none;
  overflow: hidden;
}

/* Ensure no text selection interferes with gestures */
* {
  user-select: none;
  -webkit-user-select: none;
}

.game-loading {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: rgba(7, 7, 15, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.game-loading__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.game-loading__text {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.game-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

.game-hud > * {
  pointer-events: auto;
}

.game-hud__top-left {
  position: absolute;
  top: 16px;
  left: 16px;
}

.game-hud__back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(7, 7, 15, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.1);
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.game-hud__back:hover {
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.25);
}

.game-hud__player-energy {
  position: absolute;
  bottom: 88px; /* Positioned directly above the hotbar */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 250px;
  height: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.game-hud__energy-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, #8b5cf6, #eab308);
  transition: width 0.3s ease;
  z-index: 1;
  border-radius: 8px;
}

.game-hud__energy-val {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  z-index: 2;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}

.game-hud__object-card {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 16px 20px;
  border-radius: 20px;
  background: rgba(7, 7, 15, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.3);
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 1000; /* Ensure it stays on top */
}

.game-hud__object-name {
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 800;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}

.game-hud__object-subname {
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  margin-top: -6px;
  margin-bottom: 4px;
}

.game-hud__object-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.game-hud__bottom {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.game-hud__snack {
  position: relative;
}

.game-hud__bottom-right {
  position: absolute;
  bottom: 16px;
  right: 16px;
}

</style>
