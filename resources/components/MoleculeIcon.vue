<template>
  <div class="molecule-icon">
    <TresCanvas
      clear-color="#000000"
      :antialias="true"
      :alpha="true"
    >
      <TresPerspectiveCamera :position="[0, 0, 5]" :look-at="[0, 0, 0]" />
      <TresAmbientLight :intensity="0.8" color="#ffffff" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
      
      <TresGroup ref="groupRef">
        <MoleculeModel
          v-if="moleculeData"
          :molecule-data="moleculeData"
          :energy="0"
          :display-scale="0.8"
        />
      </TresGroup>
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { useRenderLoop } from '@tresjs/core'
import { TresCanvas } from '@tresjs/core'
import MoleculeModel from './MoleculeModel.vue'
import type { MoleculeData } from '@/scripts/engine/molecules'

const props = defineProps({
  moleculeData: {
    type: Object as PropType<MoleculeData>,
    required: true,
  }
})

const groupRef = ref<any>(null)
const { onLoop } = useRenderLoop()

onLoop(({ delta }) => {
  if (groupRef.value) {
    groupRef.value.rotation.y += delta * 0.5
    groupRef.value.rotation.x += delta * 0.2
  }
})
</script>

<style scoped>
.molecule-icon {
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
