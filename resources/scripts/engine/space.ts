import { reactive } from 'vue'
import { getMolecule, type MoleculeData } from './molecules'
import { NUM_TO_SYMBOL } from './fml'
import {
  evaluateCollision,
  evaluateSplit,
  resolveProducts,
  type ReactionResult,
} from './reactions'

// ── Space object ──

export interface SpaceObject {
  uid: string
  type: 'molecule'
  moleculeData: MoleculeData
  position: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  rotationalVelocity: { x: number; y: number; z: number }
  energy: number   // thermal energy → affects vibration intensity
  scale: number
  isReacting?: boolean
  reactionCooldownUntil?: number // ms
}

// ── Space state ──

export interface SpaceState {
  objects: SpaceObject[]
  camera: {
    x: number
    y: number
    zoom: number
  }
  selectedObjectUid: string | null
  hoveredObjectUid: string | null
  draggedObjectUid: string | null
  draggedObjectAction: 'move' | 'rotate' | null
  playerEnergy: number
  maxPlayerEnergy: number
  pointerWorldPosition: { x: number; z: number }
  isInitialized: boolean
}

const state = reactive<SpaceState>({
  objects: [],
  camera: { x: 0, y: 0, zoom: 12 },
  selectedObjectUid: null,
  hoveredObjectUid: null,
  draggedObjectUid: null,
  draggedObjectAction: null,
  playerEnergy: 10000,
  maxPlayerEnergy: 50000,
  pointerWorldPosition: { x: 0, z: 0 },
  isInitialized: false,
})

let uidCounter = 0

// Track which pairs recently collided to avoid rapid re-bouncing
const recentCollisions = new Map<string, number>()
const COLLISION_COOLDOWN = 300 // ms

export function useSpace() {
  function spawnMolecule(
    moleculeData: MoleculeData,
    position?: { x: number; y: number; z: number },
    energy = 0,
  ): SpaceObject {
    const uid = `mol_${++uidCounter}_${Date.now()}`

    const obj: SpaceObject = {
      uid,
      type: 'molecule',
      moleculeData,
      position: position ?? {
        x: (Math.random() - 0.5) * 10,
        y: 0,
        z: (Math.random() - 0.5) * 10,
      },
      velocity: {
        x: (Math.random() - 0.5) * 0.02,
        y: 0,
        z: (Math.random() - 0.5) * 0.02,
      },
      rotation: {
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2,
      },
      rotationalVelocity: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      },
      energy,
      scale: 1,
    }

    state.objects.push(obj)
    return obj
  }

  function removeObject(uid: string) {
    const idx = state.objects.findIndex(o => o.uid === uid)
    if (idx !== -1) state.objects.splice(idx, 1)
    if (state.selectedObjectUid === uid) state.selectedObjectUid = null
    if (state.hoveredObjectUid === uid) state.hoveredObjectUid = null
  }

  function getObject(uid: string): SpaceObject | undefined {
    return state.objects.find(o => o.uid === uid)
  }

  function selectObject(uid: string | null) {
    state.selectedObjectUid = uid
  }

  function hoverObject(uid: string | null) {
    state.hoveredObjectUid = uid
  }

  function panCamera(dx: number, dz: number) {
    state.camera.x += dx
    state.camera.y += dz
  }

  function zoomCamera(delta: number) {
    state.camera.zoom = Math.max(4, Math.min(30, state.camera.zoom + delta))
  }

  function transferEnergy(fromUid: string, amount: number): number {
    const obj = getObject(fromUid)
    if (!obj) return 0
    const actual = Math.min(obj.energy, Math.abs(amount))
    obj.energy -= actual
    return actual
  }

  function addEnergy(toUid: string, amount: number) {
    const obj = getObject(toUid)
    if (!obj) return
    obj.energy = Math.max(0, obj.energy + amount)
  }

  // ── Collision helpers ──

  function collisionKey(uid1: string, uid2: string): string {
    return uid1 < uid2 ? `${uid1}|${uid2}` : `${uid2}|${uid1}`
  }

  function isOnCooldown(uid1: string, uid2: string): boolean {
    const key = collisionKey(uid1, uid2)
    const last = recentCollisions.get(key)
    if (!last) return false
    return Date.now() - last < COLLISION_COOLDOWN
  }

  function markCollision(uid1: string, uid2: string) {
    const key = collisionKey(uid1, uid2)
    recentCollisions.set(key, Date.now())
  }

  /**
   * Apply elastic bounce between two objects.
   * Shares energy toward thermal equilibrium.
   */
  function bounceObjects(o1: SpaceObject, o2: SpaceObject) {
    const dx = o1.position.x - o2.position.x
    const dz = o1.position.z - o2.position.z
    const dist = Math.sqrt(dx * dx + dz * dz) || 0.01

    // Collision normal
    const nx = dx / dist
    const nz = dz / dist

    // Relative velocity along normal
    const dvx = o1.velocity.x - o2.velocity.x
    const dvz = o1.velocity.z - o2.velocity.z
    const dvn = dvx * nx + dvz * nz

    // Only bounce if objects are approaching
    if (dvn < 0) {
      const restitution = 0.6
      const impulse = -(1 + restitution) * dvn / 2

      o1.velocity.x += impulse * nx
      o1.velocity.z += impulse * nz
      o2.velocity.x -= impulse * nx
      o2.velocity.z -= impulse * nz
    }

    // Separate objects to prevent overlap
    const collisionRadius = 3.5
    const overlap = collisionRadius - dist
    if (overlap > 0) {
      const sep = overlap / 2 + 0.1
      o1.position.x += nx * sep
      o1.position.z += nz * sep
      o2.position.x -= nx * sep
      o2.position.z -= nz * sep
    }

    // Thermal energy equilibration: each collision shares ~20% toward average
    const avgEnergy = (o1.energy + o2.energy) / 2
    const SHARE_RATE = 0.2
    o1.energy += (avgEnergy - o1.energy) * SHARE_RATE
    o2.energy += (avgEnergy - o2.energy) * SHARE_RATE
  }

  /** Physics tick — moves objects, applies drag, handles collisions */
  function tick(dt: number) {
    const DRAG = 0.995
    const VELOCITY_CAP = 0.8 // Max velocity magnitude per axis

    // Auto-replenish player energy
    const REPLENISH_RATE = 50 // energy per frame-tick
    state.playerEnergy = Math.min(
      state.maxPlayerEnergy,
      state.playerEnergy + REPLENISH_RATE * dt,
    )

    for (const obj of state.objects) {
      if (state.draggedObjectUid === obj.uid) continue

      // Position update
      obj.position.x += obj.velocity.x * dt
      obj.position.z += obj.velocity.z * dt

      // Energy-based rotational speed boost
      const energyFactor = 1 + obj.energy * 0.005
      obj.rotation.x += obj.rotationalVelocity.x * energyFactor * dt
      obj.rotation.y += obj.rotationalVelocity.y * energyFactor * dt
      obj.rotation.z += obj.rotationalVelocity.z * energyFactor * dt

      // Drag on velocities
      obj.velocity.x *= DRAG
      obj.velocity.z *= DRAG
      obj.rotationalVelocity.x *= DRAG
      obj.rotationalVelocity.y *= DRAG
      obj.rotationalVelocity.z *= DRAG

      // Cap velocity to prevent runaway speeds
      obj.velocity.x = Math.max(-VELOCITY_CAP, Math.min(VELOCITY_CAP, obj.velocity.x))
      obj.velocity.z = Math.max(-VELOCITY_CAP, Math.min(VELOCITY_CAP, obj.velocity.z))

      // Boundary wrap (soft bounds)
      const BOUND = 50
      if (Math.abs(obj.position.x) > BOUND) obj.velocity.x *= -0.5
      if (Math.abs(obj.position.z) > BOUND) obj.velocity.z *= -0.5

      // Thermal splitting: molecule exceeds max energy
      if (obj.energy > obj.moleculeData.maxEnergy && !obj.isReacting) {
        if (obj.moleculeData.atoms.length >= 2) {
          obj.isReacting = true
          handleSplit(obj)
          continue
        } else {
          // Single atom: just cap energy (radiate away the excess)
          obj.energy = obj.moleculeData.maxEnergy
        }
      }
    }

    // Collision detection — ALL molecules bounce, reactions happen on top of bouncing
    for (let i = 0; i < state.objects.length; i++) {
      const o1 = state.objects[i]
      if (o1.isReacting) continue

      for (let j = i + 1; j < state.objects.length; j++) {
        const o2 = state.objects[j]
        if (o2.isReacting) continue

        const dx = o1.position.x - o2.position.x
        const dz = o1.position.z - o2.position.z
        const distSq = dx * dx + dz * dz

        const COLLISION_DIST_SQ = 12.25 // 3.5^2

        if (distSq < COLLISION_DIST_SQ) {
          // Skip if recently collided (prevents rapid bouncing)
          if (isOnCooldown(o1.uid, o2.uid)) continue
          markCollision(o1.uid, o2.uid)

          // ALWAYS bounce
          bounceObjects(o1, o2)

          // THEN check for reaction (only if both are out of grace period)
          const now = Date.now()
          const canReact = (!o1.reactionCooldownUntil || now > o1.reactionCooldownUntil) &&
                           (!o2.reactionCooldownUntil || now > o2.reactionCooldownUntil)

          if (canReact) {
            // Trigger async reaction
            o1.isReacting = true
            o2.isReacting = true

            evaluateCollision(
              o1.uid, o1.moleculeData, o1.energy,
              o2.uid, o2.moleculeData, o2.energy,
            ).then(result => {
              if (result && result.outcome) {
                const totalReactantEnergy = o1.energy + o2.energy
                const energyForProducts = Math.max(
                  5,
                  totalReactantEnergy - (result.outcome.energyCost || 0) + (result.outcome.energyDelta || 0),
                )
                triggerReaction(result, o1.position, o2.position, energyForProducts)
              } else {
                o1.isReacting = false
                o2.isReacting = false
              }
            }).catch(() => {
              o1.isReacting = false
              o2.isReacting = false
            })
          }
        }
      }
    }

    // Clean up old cooldown entries periodically
    if (Math.random() < 0.01) {
      const now = Date.now()
      for (const [key, time] of recentCollisions) {
        if (now - time > COLLISION_COOLDOWN * 2) {
          recentCollisions.delete(key)
        }
      }
    }
  }

  /**
   * Handle thermal splitting of an overheated molecule.
   * Finds weakest bond, splits into fragments, spawns them gently.
   */
  async function handleSplit(obj: SpaceObject) {
    const pos = { ...obj.position }
    const parentEnergy = obj.energy

    evaluateSplit(obj.moleculeData, obj.energy).then(async (splitResult) => {
      if (!splitResult || !splitResult.fragments) {
        // Universal thermal fallback: rip atoms apart
        const fragments = []
        for (const a of obj.moleculeData.atoms) {
          const el = NUM_TO_SYMBOL[a.element] || 'C'
          const m = await getMolecule(el)
          if (m) fragments.push(m)
        }
        
        if (fragments.length >= 2) {
            console.log(`[Isomer] Universal Thermal Dissociation`)
            removeObject(obj.uid)
            const energyPerFragment = parentEnergy / fragments.length
            const GENTLE_SPEED = 0.15
            for (let i = 0; i < fragments.length; i++) {
              const angle = (i / fragments.length) * Math.PI * 2
              const frag = spawnMolecule(
                fragments[i],
                { x: pos.x + Math.cos(angle) * 1.5, y: 0, z: pos.z + Math.sin(angle) * 1.5 },
                Math.min(energyPerFragment, fragments[i].maxEnergy * 0.8),
              )
              frag.velocity.x = Math.cos(angle) * GENTLE_SPEED
              frag.velocity.z = Math.sin(angle) * GENTLE_SPEED
              frag.reactionCooldownUntil = Date.now() + 1000
            }
        } else {
            obj.isReacting = false
            obj.energy = obj.moleculeData.maxEnergy
        }
        return
      }

      console.log(`[Isomer] ${splitResult.pathwayName}`)
      
      // Remove the parent molecule
      removeObject(obj.uid)

      // Resolve fragment molecules
      const fragments = await resolveProducts(splitResult.fragments)

      if (fragments.length === 0) return

      const energyPerFragment = parentEnergy / fragments.length
      const GENTLE_SPEED = 0.15

      for (let i = 0; i < fragments.length; i++) {
        const angle = (i / fragments.length) * Math.PI * 2
        const frag = spawnMolecule(
          fragments[i],
          { x: pos.x + Math.cos(angle) * 1.5, y: 0, z: pos.z + Math.sin(angle) * 1.5 },
          Math.min(energyPerFragment, fragments[i].moleculeData.maxEnergy * 0.8),
        )
        frag.velocity.x = Math.cos(angle) * GENTLE_SPEED
        frag.velocity.z = Math.sin(angle) * GENTLE_SPEED
        frag.reactionCooldownUntil = Date.now() + 1000
      }
    }).catch(() => {
      obj.isReacting = false
      obj.energy = obj.moleculeData.maxEnergy
    })
  }

  /**
   * Execute a reaction: remove reactants, fetch products, spawn them gently.
   */
  async function triggerReaction(
    result: ReactionResult,
    posA: { x: number; y: number; z: number },
    posB: { x: number; y: number; z: number },
    totalEnergy: number,
  ) {
    console.log(`[Isomer] 🧪 ${result.outcome.pathwayName}`)

    // Remove reactants
    for (const uid of result.reactantUids) {
      removeObject(uid)
    }

    // Midpoint position for products
    const midX = (posA.x + posB.x) / 2
    const midZ = (posA.z + posB.z) / 2

    // Resolve product molecules
    const products = await resolveProducts(result.outcome.products)

    if (products.length === 0) {
      console.warn(`[Isomer] No products resolved for reaction, reactants consumed.`)
      return
    }

    // Distribute energy among products
    const energyPerProduct = Math.max(5, totalEnergy / products.length)

    // Spawn products with GENTLE velocity — they should stay nearby
    const GENTLE_SPEED = 0.2

    for (let i = 0; i < products.length; i++) {
      const angle = (i / products.length) * Math.PI * 2 + Math.random() * 0.3
      const offsetX = Math.cos(angle) * 2.0
      const offsetZ = Math.sin(angle) * 2.0

      const obj = spawnMolecule(
        products[i],
        { x: midX + offsetX, y: 0, z: midZ + offsetZ },
        Math.min(energyPerProduct, products[i].maxEnergy * 0.9),
      )

      // Gentle outward drift, NOT explosive
      obj.velocity.x = Math.cos(angle) * GENTLE_SPEED + (Math.random() - 0.5) * 0.05
      obj.velocity.z = Math.sin(angle) * GENTLE_SPEED + (Math.random() - 0.5) * 0.05
      obj.reactionCooldownUntil = Date.now() + 1000 // 1s grace period
    }
  }

  function clearAll() {
    state.objects.length = 0
    state.selectedObjectUid = null
    state.hoveredObjectUid = null
  }

  return {
    state,
    spawnMolecule,
    removeObject,
    getObject,
    selectObject,
    hoverObject,
    panCamera,
    zoomCamera,
    transferEnergy,
    addEnergy,
    tick,
    clearAll,
  }
}
