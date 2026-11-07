<script setup lang="ts">
/**
 * Fixed full-screen Three.js layer above the slides, plus its legend and the paper detail panel.
 * It follows the active slide but never touches impress.js. Hovering the cloud pauses its rotation;
 * clicking a dot opens a panel with that paper's details.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useImpressState } from '../composables/useImpress'
import { broadSearch } from '../data/search'
import { records } from '../data/records'
import { BACKGROUND_RATIO, COLORS, PaperCloud, type CloudScene } from '../three/PaperCloud'

const props = defineProps<{ scenes: Record<string, CloudScene> }>()

const canvas = ref<HTMLCanvasElement>()
const { currentStepId } = useImpressState()
const scene = computed<CloudScene>(() => props.scenes[currentStepId.value] ?? 'hidden')
const selected = ref<number | null>(null)
const paper = computed(() => (selected.value === null ? null : records[selected.value]!))
let cloud: PaperCloud | null = null
let hoverIndex: number | null = null

// ---------------------------------------------------------------- legend

interface LegendItem {
  color: string
  label: string
  faint?: boolean
}
const background: LegendItem = {
  color: COLORS.background,
  label: `Visualization & dashboard papers in the same year: ${broadSearch.label} (1 faint dot = ${BACKGROUND_RATIO === 1 ? '1 paper' : `${BACKGROUND_RATIO} papers`})`,
  faint: true,
}
const reviewed: LegendItem = { color: COLORS.paper, label: 'Paper in manual review' }
const LEGENDS: Record<CloudScene, LegendItem[]> = {
  hidden: [background],
  focus: [],
  sources: [{ ...reviewed, label: 'Paper in manual review, grouped by journal' }, background],
  criteria: [{ color: COLORS.neutral, label: 'Paper in manual review' }, background],
  stage0: [reviewed, background],
  stage1: [
    { color: COLORS.kept, label: 'Passed screening' },
    { color: COLORS.uncertain, label: 'Kept as uncertain' },
    { color: COLORS.dropped, label: 'Excluded' },
    background,
  ],
  stage2: [],
  stage3: [
    { color: COLORS.star, label: 'Highlighted' },
    { color: COLORS.kept, label: 'Selected' },
    { color: COLORS.dropped, label: 'Not selected' },
    background,
  ],
  overview: [
    { color: COLORS.star, label: 'Highlighted' },
    { color: COLORS.kept, label: 'Selected' },
    { color: COLORS.screened, label: 'Passed screening' },
    { color: COLORS.dropped, label: 'Reviewed only' },
    background,
  ],
}
const legend = computed(() => LEGENDS[scene.value])
const clickable = computed(() => !['hidden', 'focus'].includes(scene.value))

// ---------------------------------------------------------------- pointer

/** Pointer over our own UI (HUD, toolbar, panel, legend) does not count as over the cloud. */
const overUi = (e: Event) => !!(e.target as Element | null)?.closest?.('.ui')

function onMove(e: PointerEvent) {
  if (!cloud) return
  if (overUi(e)) {
    cloud.pointerLeave()
    hoverIndex = null
  } else {
    hoverIndex = cloud.pointer(e.clientX, e.clientY)
  }
  document.body.style.cursor = hoverIndex !== null ? 'pointer' : ''
}

function onClick(e: MouseEvent) {
  if (overUi(e) || hoverIndex === null) return
  // Capture phase: keep impress.js from treating this as a click on a (faint) slide underneath.
  e.stopPropagation()
  e.preventDefault()
  selected.value = hoverIndex
}

function close() {
  selected.value = null
}

onMounted(() => {
  cloud = new PaperCloud(canvas.value!, records, Math.round(broadSearch.results / BACKGROUND_RATIO))
  cloud.setScene(scene.value)
  if (import.meta.env.DEV) (window as unknown as { __cloud: PaperCloud }).__cloud = cloud
  window.addEventListener('pointermove', onMove)
  window.addEventListener('click', onClick, true)
  document.documentElement.addEventListener('pointerleave', () => cloud?.pointerLeave())
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('click', onClick, true)
  cloud?.dispose()
})

watch(scene, (s) => {
  cloud?.setScene(s)
  selected.value = null
})
watch(selected, (i) => cloud?.select(i))

const pubmed = (pmid: number) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
</script>

<template>
  <canvas ref="canvas" class="paper-cloud" aria-hidden="true" />

  <Transition name="fade" mode="out-in">
    <div v-if="legend.length" :key="scene" class="legend ui">
      <span v-for="item in legend" :key="item.label" class="item" :class="{ faint: item.faint }">
        <i :style="{ background: item.color, boxShadow: item.faint ? 'none' : `0 0 8px ${item.color}` }" />
        {{ item.label }}
      </span>
      <span v-if="clickable" class="hint">Click a dot for details</span>
    </div>
  </Transition>

  <Transition name="slide">
    <aside v-if="paper" class="paper-panel ui" role="dialog" aria-label="Paper details">
      <button class="close" aria-label="Close" @click="close">×</button>
      <div class="journal">{{ paper.journal }} · {{ paper.year }}</div>
      <h4>{{ paper.title }}</h4>
      <p class="authors">{{ paper.authors }}</p>
      <div class="links">
        <a :href="pubmed(paper.pmid)" target="_blank" rel="noopener">PMID {{ paper.pmid }} ↗</a>
        <a v-if="paper.doi" :href="`https://doi.org/${paper.doi}`" target="_blank" rel="noopener">DOI ↗</a>
      </div>
    </aside>
  </Transition>
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
.legend {
  position: fixed;
  left: 75%;
  bottom: 84px;
  z-index: 11;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 18px;
  width: min(560px, 50vw);
  transform: translateX(-50%);
  font-size: 14px;
  color: var(--amia-text);
}
.item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.item i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.item.faint {
  color: var(--amia-text-dim);
}
.item.faint i {
  width: 6px;
  height: 6px;
  opacity: 0.7;
}
.hint {
  color: var(--amia-cyan-soft);
  font-style: italic;
}
.paper-panel {
  position: fixed;
  right: 24px;
  bottom: 80px;
  z-index: 12;
  width: min(440px, calc(100vw - 48px));
  padding: 18px 22px 16px;
  border: 1.5px solid var(--amia-cyan);
  border-radius: 14px;
  background: rgba(28, 3, 71, 0.94);
  box-shadow: var(--glow-cyan), 0 20px 50px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
}
.close {
  position: absolute;
  top: 6px;
  right: 10px;
  border: 0;
  background: none;
  font-size: 26px;
  line-height: 1;
  color: var(--amia-text-dim);
  cursor: pointer;
}
.journal {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--amia-cyan);
}
h4 {
  margin: 6px 24px 8px 0;
  font-family: var(--font-display);
  font-size: 18px;
  line-height: 1.3;
}
.authors {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--amia-text-dim);
}
.links {
  display: flex;
  gap: 18px;
  font-size: 15px;
}
.links a {
  color: var(--amia-cyan);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
