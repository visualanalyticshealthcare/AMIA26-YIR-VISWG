<script setup lang="ts">
/** The final selection as a slowly rotating 3D carousel of paper cards. */
import { papers } from '../data/papers'

const radius = 560
const step = 360 / papers.length
</script>

<template>
  <div class="carousel-wrap">
    <div class="carousel">
      <article
        v-for="(p, i) in papers"
        :key="i"
        class="card"
        :style="{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }"
      >
        <div class="theme">{{ p.theme }}</div>
        <h3>{{ p.title }}</h3>
        <div class="authors">{{ p.authors }}</div>
        <div class="venue">{{ p.venue }}</div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.carousel-wrap {
  position: absolute;
  inset: 230px 0 0 0;
  perspective: 2400px;
  transform-style: preserve-3d;
}
.carousel {
  position: absolute;
  left: 50%;
  top: 40%;
  transform-style: preserve-3d;
  animation: spin 40s linear infinite;
}
.card {
  position: absolute;
  width: 360px;
  height: 260px;
  margin: -130px 0 0 -180px;
  padding: 24px 26px;
  border-radius: 20px;
  border: 1.5px solid var(--amia-cyan);
  background: linear-gradient(160deg, rgba(111, 116, 245, 0.55), rgba(45, 6, 106, 0.85));
  box-shadow: var(--glow-cyan);
  backface-visibility: hidden;
}
.theme {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--amia-pink);
}
h3 {
  font-size: 26px;
  line-height: 1.25;
  margin: 12px 0;
}
.authors,
.venue {
  font-size: 17px;
  color: var(--amia-text-dim);
}
@keyframes spin {
  from {
    transform: translateZ(-180px) rotateX(-8deg) rotateY(0deg);
  }
  to {
    transform: translateZ(-180px) rotateX(-8deg) rotateY(-360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .carousel {
    animation: none;
  }
}
</style>
