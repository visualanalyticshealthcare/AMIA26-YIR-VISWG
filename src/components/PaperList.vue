<script setup lang="ts">
/** The selected papers as a plain-text list; the two most representative are starred. */
import { shortlist } from '../data/records'

const author = (a: string) => a.split(',')[0] + (a.includes(',') ? ' et al.' : '')
</script>

<template>
  <ol class="paper-list">
    <li v-for="p in shortlist" :key="p.pmid" :class="{ star: p.score?.total === 9 }">
      <span class="title">{{ p.title }}</span>
      <span class="meta">{{ author(p.authors) }} · {{ p.journal }} · {{ p.year }}</span>
    </li>
  </ol>
</template>

<style scoped>
.paper-list {
  columns: 2;
  column-gap: 56px;
  margin: 22px 0 0;
  padding-left: 30px;
}
li {
  break-inside: avoid;
  margin-bottom: 16px;
  font-size: 20px;
  line-height: 1.32;
  color: var(--amia-text-dim);
}
li::marker {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--amia-cyan);
}
.title {
  display: block;
  color: var(--amia-text);
  font-weight: 600;
}
.meta {
  font-size: 17px;
}
.star .title::before {
  content: '★ ';
  color: var(--amia-pink);
}
.star::marker {
  color: var(--amia-pink);
}
</style>
