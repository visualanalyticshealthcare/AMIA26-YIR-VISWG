<script setup lang="ts">
/** Fixed overlay: conference wordmark (top) and funnel progress tracker (bottom). */
import { computed } from 'vue'
import { meta } from '../data/meta'
import { stages } from '../data/pipeline'
import { goto, useImpressState } from '../composables/useImpress'

const { currentStepId } = useImpressState()
const activeIndex = computed(() => stages.findIndex((s) => s.id === currentStepId.value))
const showTracker = computed(() => activeIndex.value >= 0)
</script>

<template>
  <header class="hud-top">
    <span class="brand">{{ meta.conference }}</span>
    <span class="sep" />
    <span class="ws">{{ meta.workshop }} · {{ meta.title }}</span>
  </header>

  <nav class="tracker" :class="{ hidden: !showTracker }" aria-label="Funnel stages">
    <button
      v-for="(s, i) in stages"
      :key="s.id"
      class="node"
      :class="{ done: i < activeIndex, active: i === activeIndex }"
      @click="goto(s.id)"
    >
      <span class="dot" />
      <span class="n">{{ s.count.toLocaleString('en-US') }}</span>
      <span class="l">{{ s.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.hud-top {
  position: fixed;
  top: 22px;
  left: 32px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-display);
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--amia-text);
}
.brand {
  font-weight: 800;
}
.sep {
  width: 1px;
  height: 18px;
  background: var(--amia-cyan-soft);
}
.ws {
  color: var(--amia-text-dim);
  font-weight: 500;
}
.tracker {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 10;
  display: flex;
  gap: 6px;
  transform: translateX(-50%);
  transition: opacity 0.5s;
}
.tracker.hidden {
  opacity: 0;
  pointer-events: none;
}
.node {
  display: grid;
  justify-items: center;
  gap: 2px;
  min-width: 96px;
  padding: 6px 8px;
  border: 0;
  background: none;
  color: var(--amia-text-dim);
  font: inherit;
  cursor: pointer;
  opacity: 0.6;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--amia-violet);
}
.n {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
}
.l {
  font-size: 11px;
}
.node.done {
  opacity: 0.9;
}
.node.done .dot {
  background: var(--amia-cyan-soft);
}
.node.active {
  opacity: 1;
  color: var(--amia-text);
}
.node.active .dot {
  background: var(--amia-cyan);
  box-shadow: var(--glow-cyan);
}
</style>
