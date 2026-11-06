<script setup lang="ts">
/** Content for one funnel stage: label + big count on the left, the paper field on the right. */
import PaperField from './PaperField.vue'
import type { Stage } from '../data/pipeline'

const props = defineProps<{ stage: Stage; index: number; incoming: number }>()
const fmt = (n: number) => n.toLocaleString('en-US')
const pct = props.incoming > props.stage.count ? Math.round((props.stage.count / props.incoming) * 100) : null
</script>

<template>
  <div class="stage">
    <div class="stage-text">
      <div class="eyebrow">Stage {{ index + 1 }}</div>
      <h2>{{ stage.label }}</h2>
      <div class="count">{{ fmt(stage.count) }}</div>
      <div v-if="pct !== null" class="delta">{{ pct }}% of {{ fmt(incoming) }} kept</div>
      <p>{{ stage.description }}</p>
      <div v-if="stage.tags">
        <span v-for="t in stage.tags" :key="t" class="chip">{{ t }}</span>
      </div>
    </div>
    <PaperField :incoming="incoming" :kept="stage.count" :seed="index * 97 + 11" />
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  gap: 60px;
  height: 100%;
}
.stage-text {
  flex: 1;
}
h2 {
  font-size: 56px;
  font-weight: 700;
  margin-top: 12px;
}
.count {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 180px;
  line-height: 1;
  margin: 18px 0 6px;
  color: var(--amia-cyan);
  text-shadow: var(--glow-cyan);
}
.delta {
  font-size: 24px;
  color: var(--amia-pink);
  margin-bottom: 18px;
}
p {
  font-size: 28px;
  line-height: 1.4;
  color: var(--amia-text-dim);
  max-width: 560px;
}
</style>
