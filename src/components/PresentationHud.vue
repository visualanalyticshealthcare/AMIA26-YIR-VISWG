<script setup lang="ts">
/** Fixed overlay: header with a home link (top), funnel stage tracker (bottom center). */
import { computed } from 'vue'
import { meta } from '../data/meta'
import { stages } from '../data/pipeline'
import { goto, useImpressState } from '../composables/useImpress'

const { currentStepId } = useImpressState()
const activeIndex = computed(() => stages.findIndex((s) => s.id === currentStepId.value))
const showTracker = computed(() => activeIndex.value >= 0)

function home(e: Event) {
  e.preventDefault()
  goto('title')
}
</script>

<template>
  <header class="hud-top ui">
    <a href="#/title" class="home" title="Back to the first slide" @click="home">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5M5.5 9.8V20h4.8v-5.6h3.4V20h4.8V9.8" />
      </svg>
    </a>
    <span class="ws">{{ meta.workshop }}</span>
    <span class="sep" />
    <span class="brand">{{ meta.conference }}</span>
    <span class="sep" />
    <span class="ws">{{ meta.title }}</span>
  </header>

  <nav class="tracker ui" :class="{ hidden: !showTracker }" aria-label="Funnel stages">
    <button
      v-for="(s, i) in stages"
      :key="s.id"
      class="node"
      :class="{ done: i < activeIndex, active: i === activeIndex }"
      @click="goto(s.id)"
    >
      <span class="dot" />
      <span class="n">{{ s.count }}</span>
      <span class="l">{{ s.short }}</span>
    </button>
  </nav>
</template>

<style scoped>
.hud-top {
  position: fixed;
  top: 18px;
  left: 22px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--amia-text);
}
.home {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1.5px solid rgba(142, 233, 242, 0.5);
  border-radius: 10px;
  background: rgba(28, 3, 71, 0.4);
  transition:
    background 0.2s,
    border-color 0.2s;
}
.home:hover {
  border-color: var(--amia-cyan);
  background: rgba(142, 233, 242, 0.15);
}
.home svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: var(--amia-cyan);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
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
  bottom: 20px;
  z-index: 10;
  display: flex;
  gap: 8px;
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
  min-width: 120px;
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
  font-size: 18px;
}
.l {
  font-size: 13px;
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
