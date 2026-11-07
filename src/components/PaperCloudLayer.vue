<script setup lang="ts">
/** Fixed full-screen Three.js layer above the slides. It follows the active slide but never touches impress.js. */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useImpressState } from '../composables/useImpress'
import { records } from '../data/records'
import { PaperCloud, type CloudScene } from '../three/PaperCloud'

const props = defineProps<{ scenes: Record<string, CloudScene> }>()

const canvas = ref<HTMLCanvasElement>()
const { currentStepId } = useImpressState()
let cloud: PaperCloud | null = null

onMounted(() => {
  cloud = new PaperCloud(canvas.value!, records)
  if (import.meta.env.DEV) (window as unknown as { __cloud: PaperCloud }).__cloud = cloud
  cloud.setScene(props.scenes[currentStepId.value] ?? 'hidden')
})
onBeforeUnmount(() => cloud?.dispose())

watch(currentStepId, (id) => cloud?.setScene(props.scenes[id] ?? 'hidden'))
</script>

<template>
  <canvas ref="canvas" class="paper-cloud" aria-hidden="true" />
</template>

<style scoped>
.paper-cloud {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5;
  pointer-events: none;
}
</style>
