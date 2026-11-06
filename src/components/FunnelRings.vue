<script setup lang="ts">
/**
 * Decorative neon rings placed in the impress 3D canvas, one per stage, shrinking with depth.
 * Flying through them reads as diving down a funnel; the overview step shows the whole cone.
 */
import { stagePose, ringRadius } from '../data/layout'
import { stages } from '../data/pipeline'

const rings = stages.map((s, i) => {
  const pose = stagePose(i)
  const r = ringRadius(i, stages.length)
  return { id: s.id, r, ...pose, last: i === stages.length - 1 }
})
</script>

<template>
  <div
    v-for="ring in rings"
    :key="ring.id"
    class="deco ring"
    :class="{ last: ring.last }"
    :style="{
      width: `${ring.r * 2}px`,
      height: `${ring.r * 2}px`,
      transform: `translate(-50%, -50%) translate3d(${ring.x}px, ${ring.y}px, ${ring.z - 400}px) rotateZ(${ring.rotateZ}deg)`,
    }"
  />
</template>

<style scoped>
.ring {
  border-radius: 50%;
  border: 12px solid var(--amia-cyan);
  box-shadow: var(--glow-cyan), inset var(--glow-cyan);
  opacity: 0.55;
}
.ring.last {
  border-color: var(--amia-pink);
  box-shadow: var(--glow-pink), inset var(--glow-pink);
}
</style>
