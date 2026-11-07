<script setup lang="ts">
/** Search strategy: the PubMed query typed out in a terminal, and what it returned. */
import TerminalWindow, { type TermLine } from './TerminalWindow.vue'
import TypedText from './TypedText.vue'
import { search, reviewWindow } from '../data/search'
import { countAtLeast } from '../data/records'

const lines: TermLine[] = [
  ...search.queryLines.map((q, i) => (i === 0 ? { cmd: q } : { out: q })),
  { out: '' },
  { em: `→ ${search.results} results` },
  { em: `→ ${countAtLeast(0)} papers in full manual review` },
]
</script>

<template>
  <div class="col">
    <div class="eyebrow">Search strategy</div>
    <h2><TypedText text="Where the papers came from" /></h2>
    <div class="facts">
      <div><b>{{ search.database }}</b><span>database</span></div>
      <div><b>{{ search.journals }}</b><span>journals incl. IEEE TVCG</span></div>
      <div><b>12 mo</b><span>{{ reviewWindow.start }} – {{ reviewWindow.end }}</span></div>
    </div>
    <TerminalWindow title="pubmed · esearch" :lines="lines" />
  </div>
</template>

<style scoped>
.col {
  width: 800px;
}
h2 {
  font-size: 60px;
  margin: 12px 0 26px;
  min-height: 1.2em;
}
.facts {
  display: flex;
  gap: 44px;
  margin-bottom: 26px;
}
.facts b {
  display: block;
  font-family: var(--font-display);
  font-size: 44px;
  color: var(--amia-cyan);
}
.facts span {
  font-size: 18px;
  color: var(--amia-text-dim);
}
</style>
