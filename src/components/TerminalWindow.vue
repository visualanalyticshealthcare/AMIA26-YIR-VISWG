<script setup lang="ts">
/** A terminal-style panel whose commands and output type out (typed.js) when the slide is first entered. */
import { ref } from 'vue'
import { escapeHtml, useTypeOnEnter } from '../composables/useTypeOnEnter'

export interface TermLine {
  /** Shown after a `$` prompt. */
  cmd?: string
  /** Plain output line. */
  out?: string
  /** Highlighted output line. */
  em?: string
}

const props = withDefaults(defineProps<{ title: string; lines: TermLine[]; speed?: number }>(), { speed: 6 })
const body = ref<HTMLElement>()

const toHtml = () =>
  props.lines
    .map((l) =>
      l.cmd !== undefined
        ? `<span class="p">$</span> ${escapeHtml(l.cmd)}`
        : l.em !== undefined
          ? `<span class="em">${escapeHtml(l.em)}</span>`
          : `<span class="o">${escapeHtml(l.out ?? '')}</span>`,
    )
    .join('<br>')

useTypeOnEnter(body, toHtml, props.speed)
</script>

<template>
  <div class="term">
    <div class="bar">
      <i /><i /><i />
      <span>{{ title }}</span>
    </div>
    <pre ref="body" class="body" />
  </div>
</template>

<style scoped>
.term {
  border: 1.5px solid rgba(142, 233, 242, 0.55);
  border-radius: 14px;
  background: rgba(20, 2, 52, 0.82);
  box-shadow: 0 0 30px rgba(142, 233, 242, 0.12);
  overflow: hidden;
}
.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(111, 116, 245, 0.25);
  font-size: 16px;
  color: var(--amia-text-dim);
}
.bar i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--amia-violet);
}
.bar i:first-child {
  background: var(--amia-pink);
}
.bar i:nth-child(2) {
  background: var(--amia-cyan-soft);
}
.bar span {
  margin-left: 8px;
  letter-spacing: 0.08em;
}
.body {
  margin: 0;
  padding: 18px 22px;
  min-height: 2em;
  font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
  font-size: 19px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--amia-text);
}
.body :deep(.p) {
  color: var(--amia-pink);
}
.body :deep(.o) {
  color: var(--amia-text-dim);
}
.body :deep(.em) {
  color: var(--amia-cyan);
  font-weight: 700;
}
</style>
