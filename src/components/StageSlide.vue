<script setup lang="ts">
/** Text for one funnel stage: "<count> papers <meaning>". The points themselves are drawn by the Three.js cloud. */
import TypedText from './TypedText.vue'
import type { Stage } from '../data/pipeline'

defineProps<{ stage: Stage; index: number }>()
</script>

<template>
  <div class="col">
    <div class="eyebrow">Step {{ index + 1 }}</div>
    <h2><TypedText :text="stage.label" /></h2>
    <div class="headline">
      <span class="count">{{ stage.count }}</span>
      <span class="unit">papers<br /><b>{{ stage.meaning }}</b></span>
    </div>
    <div class="flow">{{ stage.flow }}</div>
    <p>{{ stage.description }}</p>
    <div>
      <span v-for="t in stage.chips" :key="t" class="chip">{{ t }}</span>
    </div>
  </div>
</template>

<style scoped>
.col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 760px;
  height: 100%;
}
h2 {
  font-size: 46px;
  font-weight: 700;
  margin-top: 12px;
  min-height: 1.2em;
}
.headline {
  display: flex;
  align-items: center;
  gap: 28px;
  margin: 18px 0 10px;
}
.count {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 190px;
  line-height: 1;
  color: var(--amia-cyan);
  text-shadow: var(--glow-cyan);
}
.unit {
  font-family: var(--font-display);
  font-size: 34px;
  line-height: 1.25;
  color: var(--amia-text-dim);
}
.unit b {
  color: var(--amia-text);
  font-weight: 700;
}
.flow {
  font-size: 24px;
  color: var(--amia-pink);
  margin-bottom: 18px;
}
p {
  font-size: 26px;
  line-height: 1.4;
  color: var(--amia-text-dim);
  margin: 0 0 22px;
}
</style>
