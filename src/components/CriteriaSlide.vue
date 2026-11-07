<script setup lang="ts">
/** Screening criteria and the two-phase process. */
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
    <div class="rubric">
      Full-text review weighed:
      <span v-for="d in rubric" :key="d" class="chip">{{ d }}</span>
    </div>
  </div>
</template>

<style scoped>
.col {
  width: 820px;
}
h2 {
  font-size: 60px;
  margin: 12px 0 24px;
  min-height: 1.2em;
}
.lists {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 32px;
}
h3 {
  font-size: 24px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
h3.in {
  color: var(--amia-cyan);
}
h3.out {
  color: var(--amia-pink);
}
ul {
  margin: 0;
  padding-left: 22px;
}
li {
  font-size: 21px;
  line-height: 1.4;
  margin-bottom: 8px;
  color: var(--amia-text);
}
.rounds {
  display: flex;
  gap: 28px;
  margin: 26px 0 18px;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid var(--amia-cyan);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--amia-cyan);
}
.round b {
  font-size: 21px;
}
.round p {
  margin: 4px 0 0;
  font-size: 18px;
  color: var(--amia-text-dim);
}
.rubric {
  font-size: 20px;
  color: var(--amia-text-dim);
}
.rubric .chip {
  margin-left: 10px;
}
</style>
