<script setup lang="ts">
/** The selected papers as a plain-text list with links; the two most representative are starred. */
import { shortlist } from '../data/records'

const author = (a: string) => a.split(',')[0] + (a.includes(',') ? ' et al.' : '')
const pubmed = (pmid: number) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
/** Title opens the publisher's page via DOI, falling back to PubMed. */
const titleHref = (p: (typeof shortlist)[number]) => (p.doi ? `https://doi.org/${p.doi}` : pubmed(p.pmid))
</script>

<template>
  <ol class="paper-list">
    <li v-for="p in shortlist" :key="p.pmid" :class="{ star: p.score?.total === 9 }">
      <a class="title" :href="titleHref(p)" target="_blank" rel="noopener">{{ p.title }}</a>
      <span class="meta">
        {{ author(p.authors) }} · {{ p.journal }} · {{ p.year }} ·
        <a :href="pubmed(p.pmid)" target="_blank" rel="noopener">PMID {{ p.pmid }}</a>
        <template v-if="p.doi">
          · <a :href="`https://doi.org/${p.doi}`" target="_blank" rel="noopener">DOI</a>
        </template>
      </span>
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
a {
  color: inherit;
  text-decoration: none;
}
.title {
  display: block;
  color: var(--amia-text);
  font-weight: 600;
}
.title:hover {
  color: var(--amia-cyan);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.meta a {
  color: var(--amia-cyan);
  text-decoration: underline;
  text-decoration-color: rgba(142, 233, 242, 0.45);
  text-underline-offset: 3px;
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
