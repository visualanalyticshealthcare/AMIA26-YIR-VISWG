<script setup lang="ts">
/** Screening criteria, the two-phase process, and what the full-text review weighed. */
import TypedText from './TypedText.vue'
import { exclusion, inclusion, rounds, rubric } from '../data/search'
</script>

<template>
  <div class="col">
    <div class="eyebrow">Screening</div>
    <h2><TypedText text="How we screened" /></h2>
    <div class="lists">
      <section>
        <h3 class="in">Include</h3>
        <ul>
          <li v-for="c in inclusion" :key="c">{{ c }}</li>
        </ul>
      </section>
      <section>
        <h3 class="out">Exclude</h3>
        <ul>
          <li v-for="c in exclusion" :key="c">{{ c }}</li>
        </ul>
      </section>
    </div>
    <div class="rounds">
      <div v-for="(r, i) in rounds" :key="r.name" class="round">
        <span class="num">{{ i + 1 }}</span>
        <div>
          <b>{{ r.name }}</b>
          <p>{{ r.detail }}</p>
        </div>
      </div>
    </div>
    <h3 class="weights">Full-text review weighed</h3>
    <dl class="rubric">
      <div v-for="d in rubric" :key="d.name">
        <dt>{{ d.name }}</dt>
        <dd>{{ d.detail }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.col {
  width: 900px;
  margin-top: -30px;
}
h2 {
  font-size: 64px;
  margin: 10px 0 18px;
  min-height: 1.2em;
}
.lists {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 34px;
}
h3 {
  font-size: 22px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
h3.in,
h3.weights {
  color: var(--amia-cyan);
}
h3.out {
  color: var(--amia-pink);
}
ul {
  margin: 0;
  padding-left: 24px;
}
li {
  font-size: 22px;
  line-height: 1.35;
  margin-bottom: 6px;
}
.rounds {
  display: flex;
  gap: 30px;
  margin: 18px 0 16px;
}
.round {
  display: flex;
  gap: 14px;
  flex: 1;
}
.num {
  display: grid;
  place-items: center;
  flex: none;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1.5px solid var(--amia-cyan);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--amia-cyan);
}
.round b {
  font-size: 22px;
}
.round p {
  margin: 4px 0 0;
  font-size: 20px;
  color: var(--amia-text-dim);
}
.rubric {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 18px;
  margin: 0;
}
.rubric > div {
  display: contents;
}
dt {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 21px;
  color: var(--amia-text);
}
dd {
  margin: 0;
  font-size: 20px;
  line-height: 1.35;
  color: var(--amia-text-dim);
}
</style>
