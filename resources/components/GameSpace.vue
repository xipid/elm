<template>
  <div class="game-space" ref="containerRef">
    <TresCanvas
      clear-color="#07070f"
      :antialias="true"
      :alpha="false"
      window-size
    >
      <!-- Orthographic camera (top-down) -->
      <TresOrthographicCamera
        ref="cameraRef"
        :position="[camera.x, 20, camera.y]"
        :zoom="camera.zoom"
        :near="0.1"
        :far="100"
        :left="-20"
        :right="20"
        :top="20"
        :bottom="-20"
        :look-at="[camera.x, 0, camera.y]"
      />

      <!-- Ambient + directional lights -->
      <TresAmbientLight :intensity="0.4" color="#c4b5fd" />
      <TresDirectionalLight :position="[5, 15, 5]" :intensity="0.8" color="#e0e7ff" />
      <TresDirectionalLight :position="[-5, 10, -5]" :intensity="0.3" color="#8b5cf6" />

      <!-- Grid ground -->
      <TresMesh :rotation="[HALF_PI_NEG, 0, 0]" :position="[0, -5, 0]">
        <TresPlaneGeometry :args="[150, 150]" />
        <TresMeshStandardMaterial
          color="#0a0a1a"
          :roughness="0.9"
          :metalness="0.1"
          :transparent="true"
          :opacity="0.8"
        />
      </TresMesh>

      <!-- Grid lines -->
      <TresGridHelper
        :args="[150, 150, '#1a1a3a', '#12122a']"
        :position="[0, -4.99, 0]"
      />

      <!-- Space objects (molecules) -->
      <TresGroup
        v-for="obj in spaceState.objects"
        :key="obj.uid"
        :position="[obj.position.x, obj.position.y, obj.position.z]"
        @pointer-enter="() => onObjectHover(obj.uid)"
        @pointer-leave="() => onObjectHover(null)"
      >
        <!-- Invisible hit box -->
        <TresMesh :position="[0, 0, 0]">
          <TresSphereGeometry :args="[1.5, 8, 8]" />
          <TresMeshBasicMaterial :transparent="true" :opacity="0" :depthWrite="false" />
        </TresMesh>

        <!-- Selection ring -->
        <TresMesh
          v-if="spaceState.selectedObjectUid === obj.uid"
          :rotation="[HALF_PI_NEG, 0, 0]"
          :position="[0, -0.5, 0]"
        >
          <TresRingGeometry :args="[1.6, 1.8, 32]" />
          <TresMeshBasicMaterial color="#8b5cf6" :transparent="true" :opacity="0.6" :side="2" />
        </TresMesh>

        <!-- Hover ring -->
        <TresMesh
          v-if="spaceState.hoveredObjectUid === obj.uid && spaceState.selectedObjectUid !== obj.uid"
          :rotation="[HALF_PI_NEG, 0, 0]"
          :position="[0, -0.5, 0]"
        >
          <TresRingGeometry :args="[1.4, 1.55, 32]" />
          <TresMeshBasicMaterial color="#a78bfa" :transparent="true" :opacity="0.3" :side="2" />
        </TresMesh>

        <!-- Molecule model -->
        <MoleculeModel
          :molecule-data="obj.moleculeData"
          :energy="obj.energy"
          :rotation-xyz="obj.rotation"
        />

        <!-- Energy indicator (Hollow spinner ring) -->
        <TresMesh :position="[0, 2.2, 0]" :rotation="[HALF_PI_NEG, 0, 0]">
          <TresRingGeometry :args="[energyBarRadius(obj.energy), energyBarRadius(obj.energy) + 0.15, 32, 1, 0, energyArc(obj.energy)]" />
          <TresMeshBasicMaterial
            :color="energyColor(obj.energy)"
            :transparent="true"
            :opacity="0.6"
            :side="2"
          />
        </TresMesh>
      </TresGroup>

      <!-- Removed IUPAC Preview -->
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import MoleculeModel from './MoleculeModel.vue'
import { useSpace } from '@/scripts/engine/space'
import { useGameLoop } from '@/scripts/engine/game-loop'

const HALF_PI_NEG = -Math.PI / 2

const emit = defineEmits<{
  objectClick: [uid: string]
  objectHover: [uid: string | null]
  emptyClick: [position: { x: number; y: number; z: number }]
}>()

const { state: spaceState } = useSpace()
const gameLoop = useGameLoop()

const containerRef = ref<HTMLElement>()
const cameraRef = ref<any>()

const camera = computed(() => spaceState.camera)

watch(() => spaceState.camera.zoom, (val) => {
  if (cameraRef.value) {
    cameraRef.value.zoom = val
    if (typeof cameraRef.value.updateProjectionMatrix === 'function') {
      cameraRef.value.updateProjectionMatrix()
    } else if (cameraRef.value.camera?.updateProjectionMatrix) {
      cameraRef.value.camera.updateProjectionMatrix()
    }
  }
})



function onObjectHover(uid: string | null) {
  emit('objectHover', uid)
}

function energyBarRadius(energy: number): number {
  return 1.2 + Math.min(energy / 200, 1) * 0.4
}

function energyArc(energy: number): number {
  return (Math.min(energy / 200, 1)) * Math.PI * 2
}

function energyColor(energy: number): string {
  if (energy < 30) return '#38bdf8'
  if (energy < 80) return '#34d399'
  if (energy < 140) return '#fb923c'
  return '#ef4444'
}
</script>

<style scoped>
.game-space {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
