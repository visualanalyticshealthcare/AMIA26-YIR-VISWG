<script setup lang="ts">
/** The shortlist as a slowly rotating 3D carousel of paper cards. */
import { shortlist } from '../data/records'

const radius = 700
const step = 360 / shortlist.length
const authors = (a: string) => a.split(',')[0] + (a.includes(',') ? ' et al.' : '')
</script>

<template>
  <div class="carousel-wrap">
    <div class="carousel">
      <article
        v-for="(p, i) in shortlist"
        :key="p.pmid"
        class="card"
        :class="{ perfect: p.score?.total === 9 }"
        :style="{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }"
      >
        <div class="tag">{{ p.score?.total === 9 ? "★ Most representative" : "Selected" }}</div>
        <h3>{{ p.title }}</h3>
        <div class="meta">{{ authors(p.authors) }}</div>
        <div class="meta">{{ p.journal }} · {{ p.year }}</div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.carousel-wrap {
  position: absolute;
  inset: 230px 0 0 0;
  transform-style: preserve-3d;
}
.carousel {
  position: absolute;
  left: 50%;
  top: 40%;
  transform-style: preserve-3d;
  animation: spin 60s linear infinite;
}
.card {
  position: absolute;
  width: 380px;
  height: 290px;
  margin: -145px 0 0 -190px;
  padding: 22px 26px;
  border-radius: 20px;
  border: 1.5px solid var(--amia-cyan);
  background: linear-gradient(160deg, rgba(111, 116, 245, 0.6), rgba(45, 6, 106, 0.9));
  box-shadow: var(--glow-cyan);
  backface-visibility: hidden;
}
.card.perfect {
  border-color: var(--amia-pink);
  box-shadow: var(--glow-pink);
}
.tag {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--amia-cyan);
}
.perfect .tag {
  color: var(--amia-pink);
}
h3 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 22px;
  line-height: 1.3;
  margin: 10px 0 12px;
}
.meta {
  font-size: 16px;
  color: var(--amia-text-dim);
}
@keyframes spin {
  from {
    transform: translateZ(-300px) rotateX(-8deg) rotateY(0deg);
  }
  to {
    transform: translateZ(-300px) rotateX(-8deg) rotateY(-360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .carousel {
    animation: none;
  }
}
</style>
