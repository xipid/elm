import { reactive, computed, type ComputedRef } from 'vue'
import type { Item } from './items'
import { useSpace } from './space'

// ── Inventory slot ──

export interface InventorySlot {
  item: Item | null
  count: number
}

// ── Inventory state ──

export const COLS = 6
export const ROWS = 3
export const HOTBAR_SLOTS = COLS // Top row = hotbar

export interface InventoryState {
  slots: InventorySlot[]
  activeSlot: number    // index into slots (0-5 = hotbar)
  isOpen: boolean
  isInitialized: boolean
}

const state = reactive<InventoryState>({
  slots: Array.from({ length: COLS * ROWS }, () => ({ item: null, count: 0 })),
  activeSlot: 0,
  isOpen: false,
  isInitialized: false,
})

// ── Computed helpers ──

export function useInventory() {
  const hotbarSlots = computed(() => state.slots.slice(0, HOTBAR_SLOTS))

  const currentItem = computed(() => {
    const slot = state.slots[state.activeSlot]
    return slot?.item ?? null
  })

  const currentSlot = computed(() => state.slots[state.activeSlot] ?? null)

  function setActiveSlot(index: number) {
    if (index >= 0 && index < COLS * ROWS) {
      state.activeSlot = index
    }
  }

  function scrollActiveSlot(delta: number) {
    let next = state.activeSlot + delta
    if (next < 0) next = HOTBAR_SLOTS - 1
    if (next >= HOTBAR_SLOTS) next = 0
    state.activeSlot = next
  }

  function toggleInventory() {
    state.isOpen = !state.isOpen
  }

  function openInventory() {
    state.isOpen = true
  }

  function closeInventory() {
    state.isOpen = false
  }

  function addItem(item: Item, count = 1): boolean {
    // Try to stack existing
    if (item.stackable) {
      for (const slot of state.slots) {
        if (slot.item?.id === item.id && slot.count < item.maxStack) {
          slot.count = Math.min(slot.count + count, item.maxStack)
          return true
        }
      }
    }

    // Find empty slot
    const emptyIdx = state.slots.findIndex(s => s.item === null)
    if (emptyIdx === -1) return false

    state.slots[emptyIdx] = { item, count }
    return true
  }

  function removeItem(slotIndex: number, count = 1): boolean {
    const slot = state.slots[slotIndex]
    if (!slot?.item) return false

    slot.count -= count
    if (slot.count <= 0) {
      slot.item = null
      slot.count = 0
    }
    return true
  }

  function swapSlots(from: number, to: number) {
    if (from < 0 || to < 0 || from >= state.slots.length || to >= state.slots.length) return
    const temp = { ...state.slots[from] }
    state.slots[from] = { ...state.slots[to] }
    state.slots[to] = temp
  }

  function getSlot(index: number): InventorySlot | null {
    return state.slots[index] ?? null
  }

  function consumeItem(id: string, count: number): boolean {
    let remaining = count
    for (let i = 0; i < state.slots.length; i++) {
      const slot = state.slots[i]
      if (slot.item?.id === id) {
        if (slot.count >= remaining) {
          removeItem(i, remaining)
          return true
        } else {
          remaining -= slot.count
          removeItem(i, slot.count)
        }
      }
    }
    return remaining === 0
  }

  function addMoleculeItem(obj: any, count: number = 1) {
    // Harvesting energy
    const energyHarvested = obj.energy || 0
    
    // Update player energy
    const { state: spaceState } = useSpace()
    spaceState.playerEnergy = Math.min(spaceState.maxPlayerEnergy, spaceState.playerEnergy + energyHarvested)

    const item: Item = {
      id: `mol_${obj.moleculeData.formula}_${obj.moleculeData.cid}`,
      icon: 'PhAtom',
      title: obj.moleculeData.name,
      description: `Formula: ${obj.moleculeData.formula}`,
      stackable: true,
      maxStack: 99,
      moleculeData: obj.moleculeData,
      energy: 0 // Always 0 in inventory
    }
    addItem(item, count)
  }

  return {
    state,
    hotbarSlots,
    currentItem,
    currentSlot,
    setActiveSlot,
    scrollActiveSlot,
    toggleInventory,
    openInventory,
    closeInventory,
    addItem,
    removeItem,
    swapSlots,
    getSlot,
    consumeItem,
    addMoleculeItem,
    COLS,
    ROWS,
    HOTBAR_SLOTS,
  }
}

// ── Initialize starter inventory ──

export function initializeInventory() {
  const inv = useInventory()
  if (inv.state.isInitialized) return
  inv.state.isInitialized = true
}
