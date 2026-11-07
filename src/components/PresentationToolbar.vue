<script setup lang="ts">
/** Transparent bottom-right toolbar: first / previous / next / last slide and full screen. */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { nav } from '../composables/useImpress'

const fullscreen = ref(false)
const sync = () => (fullscreen.value = !!document.fullscreenElement)

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen()
}

/** Run an action, then drop focus so Space / arrow keys keep driving impress.js instead of the button. */
function run(action: () => unknown, e: Event) {
  action()
  ;(e.currentTarget as HTMLElement).blur()
}

onMounted(() => document.addEventListener('fullscreenchange', sync))
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', sync))

const buttons = [
  { label: 'First slide', action: nav.first, path: 'M6 5v14M18 5l-8 7 8 7' },
  { label: 'Previous slide', action: nav.prev, path: 'M15 5l-7 7 7 7' },
  { label: 'Next slide', action: nav.next, path: 'M9 5l7 7-7 7' },
  { label: 'Last slide', action: nav.last, path: 'M18 5v14M6 5l8 7-8 7' },
]
</script>

<template>
  <div class="toolbar ui" role="toolbar" aria-label="Slide controls">
    <button v-for="b in buttons" :key="b.label" :title="b.label" :aria-label="b.label" @click="run(b.action, $event)">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="b.path" /></svg>
    </button>
    <span class="sep" />
    <button
      :title="fullscreen ? 'Exit full screen' : 'Full screen'"
      :aria-label="fullscreen ? 'Exit full screen' : 'Full screen'"
      :aria-pressed="fullscreen"
      @click="run(toggleFullscreen, $event)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path v-if="!fullscreen" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        <path v-else d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border: 1px solid rgba(142, 233, 242, 0.25);
  border-radius: 12px;
  background: rgba(28, 3, 71, 0.28);
  backdrop-filter: blur(4px);
  opacity: 0.55;
  transition: opacity 0.25s;
}
.toolbar:hover,
.toolbar:focus-within {
  opacity: 1;
}
button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 8px;
  background: none;
  cursor: pointer;
}
button:hover {
  background: rgba(142, 233, 242, 0.15);
}
svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: var(--amia-cyan);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.sep {
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background: rgba(142, 233, 242, 0.3);
}
</style>
