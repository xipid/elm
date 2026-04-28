import { reactive } from 'vue'

// ── Item action definition ──

export interface ItemAction {
  id: string
  icon: string         // Phosphor icon name
  title: string
  description: string
  triggerDescription: string
  isActive?: boolean
}

// ── Item definition ──

export interface Item {
  id: string
  icon: string         // Phosphor icon name
  title: string
  description: string
  stackable: boolean
  maxStack: number
  moleculeData?: any
  energy?: number
}

// ── Item registry ──

const itemRegistry = new Map<string, Item>()

export function registerItem(item: Item): void {
  itemRegistry.set(item.id, item)
}

export function getItem(id: string): Item | undefined {
  return itemRegistry.get(id)
}

export function getAllItems(): Item[] {
  return Array.from(itemRegistry.values())
}

// Register built-ins (currently none)

// ── Global Actions ──

export function getGlobalActions(): ItemAction[] {
  return [
    {
      id: 'spawn',
      icon: 'PhPlusCircle',
      title: 'Spawn',
      description: 'Spawn a molecule using IUPAC nomenclature.',
      triggerDescription: 'Hold / Click / Press I',
    },
    {
      id: 'drop_molecule',
      icon: 'PhDrop',
      title: 'Drop',
      description: 'Drop the selected molecule back into space.',
      triggerDescription: 'Click empty space',
    },
    {
      id: 'rotate',
      icon: 'PhArrowsClockwise',
      title: 'Rotate',
      description: 'Rotate the grabbed molecule.',
      triggerDescription: 'Hold & Drag / Ctrl & Drag',
    },
    {
      id: 'absorb',
      icon: 'PhArrowFatLineDown',
      title: 'Absorb',
      description: 'Absorb energy from a molecule.',
      triggerDescription: 'Hold A & Click / Action',
    },
    {
      id: 'release',
      icon: 'PhArrowFatLineUp',
      title: 'Release',
      description: 'Release energy into a molecule.',
      triggerDescription: 'Hold Z & Click / Right Click',
    },
    {
      id: 'fullscreen',
      icon: 'PhCornersOut',
      title: 'Fullscreen',
      description: 'Toggle fullscreen view.',
      triggerDescription: 'Click or Press F',
    },
  ]
}
