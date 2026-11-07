<script setup lang="ts">
/** One of the most representative papers: bibliographic details, cover page, and why it stands out. */
import TypedText from './TypedText.vue'
import type { Featured } from '../data/featured'

const props = defineProps<{ paper: Featured; index: number; total: number }>()
const r = props.paper.record
</script>

<template>
  <div class="featured">
    <div class="info">
      <div class="eyebrow">Most representative · {{ index + 1 }} of {{ total }}</div>
      <h2><TypedText :text="r.title" :speed="16" /></h2>
      <p class="tagline">{{ paper.tagline }}</p>

      <dl class="meta">
        <div>
          <dt>Journal</dt>
          <dd>{{ r.journal }} · {{ paper.citation }}</dd>
        </div>
        <div>
          <dt>DOI</dt>
          <dd>
            <a :href="`https://doi.org/${r.doi}`" target="_blank" rel="noopener">{{ r.doi }}</a>
          </dd>
        </div>
        <div>
          <dt>PMID</dt>
          <dd>
            <a :href="`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`" target="_blank" rel="noopener">{{ r.pmid }}</a>
          </dd>
        </div>
        <div class="authors">
          <dt>Authors</dt>
          <dd>{{ r.authors }}</dd>
        </div>
      </dl>

      <h3>Why it stands out</h3>
      <ol class="innovations">
        <li v-for="item in paper.innovations" :key="item.title">
          <b>{{ item.title }}.</b> {{ item.detail }}
        </li>
      </ol>

      <div class="stats">
        <div v-for="s in paper.stats" :key="s.label">
          <b>{{ s.value }}</b>
          <span>{{ s.label }}</span>
        </div>
      </div>
    </div>

    <figure class="cover">
      <img :src="paper.cover" :alt="`First page of ${r.title}`" />
    </figure>
  </div>
</template>

<style scoped>
.featured {
  display: flex;
  gap: 60px;
  height: 100%;
  margin-top: -20px;
}
.info {
  flex: 1;
  min-width: 0;
}
h2 {
  font-size: 38px;
  line-height: 1.18;
  margin: 10px 0 10px;
  min-height: 2.36em;
}
.tagline {
  margin: 0 0 18px;
  font-size: 22px;
  color: var(--amia-pink);
}
.meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 18px;
  margin: 0 0 18px;
  font-size: 17px;
}
.meta > div {
  display: contents;
}
dt {
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 13px;
  line-height: 1.9;
  color: var(--amia-cyan);
}
dd {
  margin: 0;
  color: var(--amia-text);
}
.authors dd {
  font-size: 14px;
  line-height: 1.45;
  color: var(--amia-text-dim);
}
a {
  color: var(--amia-text);
  text-decoration: underline;
  text-decoration-color: rgba(142, 233, 242, 0.5);
  text-underline-offset: 3px;
}
h3 {
  font-size: 18px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--amia-cyan);
  margin: 0 0 8px;
}
.innovations {
  margin: 0 0 18px;
  padding-left: 24px;
}
.innovations li {
  font-size: 18px;
  line-height: 1.42;
  margin-bottom: 7px;
  color: var(--amia-text-dim);
}
.innovations b {
  color: var(--amia-text);
}
.stats {
  display: flex;
  gap: 34px;
}
.stats b {
  display: block;
  font-family: var(--font-display);
  font-size: 34px;
  color: var(--amia-cyan);
  text-shadow: var(--glow-cyan);
}
.stats span {
  display: block;
  max-width: 220px;
  font-size: 14px;
  color: var(--amia-text-dim);
}
.cover {
  flex: none;
  width: 470px;
  margin: 10px 0 0;
  transform: perspective(1600px) rotateY(-10deg);
  transform-origin: left center;
}
.cover img {
  display: block;
  width: 100%;
  border-radius: 8px;
  border: 1.5px solid var(--amia-pink);
  box-shadow: var(--glow-pink), 0 30px 60px rgba(0, 0, 0, 0.45);
}
</style>
