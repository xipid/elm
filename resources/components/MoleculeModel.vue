<template>
  <TresGroup
    :position="[0, 0, 0]"
    :rotation="[rotationXyz.x, rotationXyz.y, rotationXyz.z]"
    :scale="[displayScale, displayScale, displayScale]"
  >
    <!-- Atoms (spheres) -->
    <TresMesh
      v-for="atom in atoms"
      :key="'atom-' + atom.id"
      :position="[atom.x * SCALE_FACTOR, atom.y * SCALE_FACTOR, atom.z * SCALE_FACTOR]"
    >
      <TresSphereGeometry :args="[atom.radius * RADIUS_SCALE, 24, 24]" />
      <TresMeshStandardMaterial
        :color="atom.color"
        :emissive="atom.color"
        :emissive-intensity="emissiveIntensity"
        :roughness="0.35"
        :metalness="0.15"
        :transparent="opacity < 1"
        :opacity="opacity"
      />
    </TresMesh>

    <!-- Bonds (cylinders) -->
    <TresGroup
      v-for="(bond, i) in computedBonds"
      :key="'bond-' + i"
      :position="bond.midpoint"
      :rotation="bond.rotation"
    >
      <TresMesh v-if="bond.order < 2">
        <TresCylinderGeometry :args="[0.08, 0.08, bond.length, 8]" />
        <TresMeshStandardMaterial
          color="#475569"
          :emissive="'#475569'"
          :emissive-intensity="emissiveIntensity * 0.5"
          :roughness="0.5"
          :metalness="0.2"
          :transparent="opacity < 1"
          :opacity="opacity"
        />
      </TresMesh>

      <!-- Double bond -->
      <TresMesh v-if="bond.order === 2 || bond.order === 1.5" :position="[0.10, 0, 0]">
        <TresCylinderGeometry :args="[0.05, 0.05, bond.length, 8]" />
        <TresMeshStandardMaterial color="#64748b" :opacity="opacity" :transparent="opacity < 1" />
      </TresMesh>
      <TresMesh v-if="bond.order === 2 || bond.order === 1.5" :position="[-0.10, 0, 0]">
        <TresCylinderGeometry :args="[0.05, 0.05, bond.length, 8]" />
        <TresMeshStandardMaterial color="#64748b" :opacity="opacity" :transparent="opacity < 1" />
      </TresMesh>

      <!-- Triple bond -->
      <TresMesh v-if="bond.order >= 3" :position="[0, 0, 0]">
        <TresCylinderGeometry :args="[0.04, 0.04, bond.length, 8]" />
        <TresMeshStandardMaterial color="#64748b" :opacity="opacity" :transparent="opacity < 1" />
      </TresMesh>
      <TresMesh v-if="bond.order >= 3" :position="[0.14, 0, 0]">
        <TresCylinderGeometry :args="[0.04, 0.04, bond.length, 8]" />
        <TresMeshStandardMaterial color="#64748b" :opacity="opacity" :transparent="opacity < 1" />
      </TresMesh>
      <TresMesh v-if="bond.order >= 3" :position="[-0.14, 0, 0]">
        <TresCylinderGeometry :args="[0.04, 0.04, bond.length, 8]" />
        <TresMeshStandardMaterial color="#64748b" :opacity="opacity" :transparent="opacity < 1" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import * as THREE from 'three'
import type { MoleculeData, AtomData, BondData } from '@/scripts/engine/molecules'
import { getAtomInfo } from '@/scripts/engine/molecules'

const props = defineProps({
  moleculeData: {
    type: Object as PropType<MoleculeData>,
    required: true,
  },
  energy: {
    type: Number,
    default: 50,
  },
  rotationXyz: {
    type: Object as PropType<{ x: number; y: number; z: number }>,
    default: () => ({ x: 0, y: 0, z: 0 }),
  },
  displayScale: {
    type: Number,
    default: 1,
  },
  opacity: {
    type: Number,
    default: 1,
  },
})

const SCALE_FACTOR = 1.2 // Coordinate scaling
const RADIUS_SCALE = 0.5 // Atom radius scaling (increased for visibility)

const emissiveIntensity = computed(() => {
  return Math.min(0.4, props.energy * 0.003)
})

interface DisplayAtom {
  id: number
  x: number
  y: number
  z: number
  color: string
  radius: number
}

// Compute centroid to center molecule at origin
const centroid = computed(() => {
  const atomList = props.moleculeData.atoms
  if (atomList.length === 0) return { x: 0, y: 0, z: 0 }
  const sum = atomList.reduce(
    (acc, a) => ({ x: acc.x + a.x, y: acc.y + a.y, z: acc.z + a.z }),
    { x: 0, y: 0, z: 0 },
  )
  return {
    x: sum.x / atomList.length,
    y: sum.y / atomList.length,
    z: sum.z / atomList.length,
  }
})

const atoms = computed<DisplayAtom[]>(() => {
  const c = centroid.value
  return props.moleculeData.atoms.map(a => {
    const info = getAtomInfo(a.element)
    return {
      id: a.id,
      x: a.x - c.x,
      y: a.y - c.y,
      z: a.z - c.z,
      color: info.color,
      radius: info.radius,
    }
  })
})

interface ComputedBond {
  midpoint: [number, number, number]
  rotation: [number, number, number]
  length: number
  order: number
}

const computedBonds = computed<ComputedBond[]>(() => {
  const c = centroid.value
  const atomMap = new Map(props.moleculeData.atoms.map(a => [a.id, a]))

  return props.moleculeData.bonds.map(bond => {
    const a1 = atomMap.get(bond.atom1)!
    const a2 = atomMap.get(bond.atom2)!

    // Center-adjusted positions
    const a1x = a1.x - c.x, a1y = a1.y - c.y, a1z = a1.z - c.z
    const a2x = a2.x - c.x, a2y = a2.y - c.y, a2z = a2.z - c.z

    const dx = (a2x - a1x) * SCALE_FACTOR
    const dy = (a2y - a1y) * SCALE_FACTOR
    const dz = (a2z - a1z) * SCALE_FACTOR

    const length = Math.sqrt(dx * dx + dy * dy + dz * dz)

    // Midpoint
    const mx = (a1x + a2x) / 2 * SCALE_FACTOR
    const my = (a1y + a2y) / 2 * SCALE_FACTOR
    const mz = (a1z + a2z) / 2 * SCALE_FACTOR

    // Rotation: align cylinder (Y-axis) to the bond direction
    const direction = new THREE.Vector3(dx, dy, dz).normalize()
    const up = new THREE.Vector3(0, 1, 0)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction)
    const euler = new THREE.Euler().setFromQuaternion(quaternion)

    return {
      midpoint: [mx, my, mz] as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      length,
      order: bond.order,
    }
  })
})
</script>
