<script setup lang="ts">
/** One impress.js step. Position props map directly onto impress `data-*` attributes. */
withDefaults(
  defineProps<{
    id: string
    x?: number
    y?: number
    z?: number
    rotateX?: number
    rotateY?: number
    rotateZ?: number
    scale?: number
  }>(),
  { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 },
)
</script>

<template>
  <div
    :id="id"
    class="step"
    :data-x="x"
    :data-y="y"
    :data-z="z"
    :data-rotate-x="rotateX"
    :data-rotate-y="rotateY"
    :data-rotate-z="rotateZ"
    :data-scale="scale"
  >
    <slot />
  </div>
</template>
