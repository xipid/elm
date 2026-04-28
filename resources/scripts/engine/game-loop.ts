import { ref, reactive, computed, type Ref } from 'vue'
import { useRouter, useCurtain, useSnack } from "fictif"
import { useSpace } from './space'
import { useInventory } from './inventory'
import type { ItemAction } from './items'
import { getGlobalActions } from './items'

// ── Game-loop state ──

const INTERACTION_INTERVAL = 100; // ms
const REACTION_ENERGY_LOSS = 2; // % per second
const isRunning = ref(false)
const heldActions: Ref<string[]> = ref([])
const keysHeld = reactive(new Set<string>())

let animFrameId: number | null = null
let lastTime = 0

export function useGameLoop() {
  const space = useSpace()
  const inventory = useInventory()

  const availableActions = computed(() => {
    const actions = getGlobalActions()
    const hovered = space.state.hoveredObjectUid
    const selectedItem = inventory.currentItem.value

    return actions.filter(action => {
      if (action.id === 'spawn' || action.id === 'fullscreen') return true
      if (action.id === 'drop_molecule') return !!selectedItem?.moleculeData
      if (['absorb', 'release', 'rotate'].includes(action.id)) {
        return !!hovered || heldActions.value.includes(action.id)
      }
      return false
    })
  })

  // Removed iupacSpawner logic

  function handleKeyDown(key: string) {
    keysHeld.add(key.toLowerCase())
  }

  function handleKeyUp(key: string) {
    keysHeld.delete(key.toLowerCase())
  }

  /** Handle a click on a space object */
  function handleObjectClick(uid: string, isRightClick = false, isDoubleClick = false) {
    const obj = space.getObject(uid)
    if (!obj) return
    
    if (isRightClick || isDoubleClick) {
      inventory.addMoleculeItem(obj)
      space.removeObject(uid)
      return
    }

    space.selectObject(uid)
  }

  /** Handle a click on empty space */
  function handleEmptyClick(position: { x: number; y: number; z: number }) {
    const item = inventory.currentItem.value
    if (item?.moleculeData) {
      space.spawnMolecule(item.moleculeData, position, item.energy)
      
      // If Space is NOT held, consume the item
      if (!keysHeld.has(' ')) {
        inventory.consumeItem(item.id, 1)
      }
      return
    }
  }

  /** The main frame loop */
  function frame(time: number) {
    if (!isRunning.value) return

    const dt = lastTime ? Math.min((time - lastTime) / 16.667, 3) : 1
    lastTime = time

    // Physics tick
    space.tick(dt)

    // Continuous energy transfer
    const isReleaseHeld = heldActions.value.includes('release') || keysHeld.has('z')
    const isAbsorbHeld = heldActions.value.includes('absorb') || keysHeld.has('a')
    
    const activeUid = space.state.draggedObjectUid || space.state.selectedObjectUid || space.state.hoveredObjectUid
    if (activeUid) {
      if (isAbsorbHeld) {
        const taken = space.transferEnergy(activeUid, 2 * dt)
        space.state.playerEnergy = Math.min(space.state.maxPlayerEnergy, space.state.playerEnergy + taken)
      } else if (isReleaseHeld && space.state.playerEnergy > 0) {
        const give = Math.min(2 * dt, space.state.playerEnergy)
        space.addEnergy(activeUid, give)
        space.state.playerEnergy -= give
      }
    }

    animFrameId = requestAnimationFrame(frame)
  }

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    lastTime = 0
    animFrameId = requestAnimationFrame(frame)
  }

  function stop() {
    isRunning.value = false
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
  }

  return {
    isRunning,
    heldActions,
    keysHeld,
    availableActions,
    start,
    stop,
    handleKeyDown,
    handleKeyUp,
    handleObjectClick,
    handleEmptyClick,
  }
}
