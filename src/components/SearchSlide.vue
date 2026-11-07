<script setup lang="ts">
/** Search strategy: from the whole visualization literature to the targeted health query, typed out in a terminal. */
import TerminalWindow, { type TermLine } from './TerminalWindow.vue'
import TypedText from './TypedText.vue'
import { broadSearch, reviewWindow, search } from '../data/search'
import { countAtLeast } from '../data/records'

const lines: TermLine[] = [
  { cmd: broadSearch.query },
  { em: `→ ${broadSearch.label} visualization & dashboard papers` },
  ...search.queryLines.map((q, i) => (i === 0 ? { cmd: q } : { out: q })),
  { em: `→ ${countAtLeast(0)} papers, all reviewed manually` },
]
</script>

<template>
  <div class="col">
    <div class="eyebrow">Search strategy</div>
    <h2><TypedText text="Where the papers came from" /></h2>
    <div class="facts">
      <div><b>{{ search.database }}</b><span>database</span></div>
      <div><b>{{ search.journals }}</b><span>journals searched</span></div>
      <div><b>12 mo</b><span>{{ reviewWindow.start }} – {{ reviewWindow.end }}</span></div>
    </div>
    <TerminalWindow title="pubmed · esearch" :lines="lines" />
  </div>
</template>

<style scoped>
.col {
  width: 940px;
}
h2 {
  font-size: 56px;
  margin: 10px 0 18px;
  min-height: 1.2em;
}
.facts {
  display: flex;
  gap: 48px;
  margin-bottom: 18px;
}
.facts b {
  display: block;
  font-family: var(--font-display);
  font-size: 46px;
  color: var(--amia-cyan);
}
.facts span {
  font-size: 21px;
  color: var(--amia-text-dim);
}
</style>
