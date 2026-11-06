<script setup lang="ts">
/**
 * The deck. Steps are rendered once; impress.js then takes over positioning and navigation.
 * Do not put reactive state in this template (see composables/useImpress.ts).
 */
import FunnelRings from './components/FunnelRings.vue'
import ImpressStep from './components/ImpressStep.vue'
import PresentationHud from './components/PresentationHud.vue'
import SelectedPapers from './components/SelectedPapers.vue'
import StageSlide from './components/StageSlide.vue'
import { STAGE_DEPTH, stagePose } from './data/layout'
import { meta } from './data/meta'
import { stages } from './data/pipeline'
import { useImpressRoot } from './composables/useImpress'

useImpressRoot('impress')

const stageSteps = stages.map((stage, i) => ({
  stage,
  index: i,
  incoming: i === 0 ? stage.count : stages[i - 1]!.count,
  pose: stagePose(i),
}))
const papersPose = stagePose(stages.length)
const funnelMid = -STAGE_DEPTH * ((stages.length + 1) / 2)
</script>

<template>
  <div class="fallback-message">
    <p>Your browser does not support the features required by impress.js, so this is a simplified version of the presentation.</p>
    <p>For the best experience please use the latest Chrome, Safari, Firefox, or Edge.</p>
  </div>

  <div
    id="impress"
    data-width="1600"
    data-height="900"
    data-perspective="1000"
    data-transition-duration="1400"
  >
    <FunnelRings />

    <ImpressStep id="title" :z="0">
      <div class="title-slide">
        <div class="eyebrow">{{ meta.conference }} · {{ meta.location }}</div>
        <h1>
          {{ meta.workshop }}<br />
          <span class="accent">{{ meta.title }}</span>
        </h1>
        <p class="subtitle">{{ meta.subtitle }}</p>
        <p class="presenters">{{ meta.presenters.join(' · ') }}</p>
        <p class="hint">Press <kbd>→</kbd> or <kbd>Space</kbd> to dive in</p>
      </div>
    </ImpressStep>

    <ImpressStep
      v-for="s in stageSteps"
      :id="s.stage.id"
      :key="s.stage.id"
      :x="s.pose.x"
      :y="s.pose.y"
      :z="s.pose.z"
      :rotate-z="s.pose.rotateZ"
    >
      <StageSlide :stage="s.stage" :index="s.index" :incoming="s.incoming" />
    </ImpressStep>

    <ImpressStep id="papers" :x="papersPose.x" :y="papersPose.y" :z="papersPose.z" :rotate-z="papersPose.rotateZ">
      <div class="eyebrow">The selection</div>
      <h2 class="section-title">{{ stages.at(-1)!.count }} papers that defined the year</h2>
      <SelectedPapers />
    </ImpressStep>

    <ImpressStep id="overview" class="overview" :x="3200" :y="-600" :z="funnelMid" :rotate-x="-12" :rotate-y="52" :scale="9.5">
      <div class="overview-label">
        <div class="eyebrow">The whole funnel</div>
        <h2>{{ stages[0]!.count.toLocaleString('en-US') }} → {{ stages.at(-1)!.count }}</h2>
      </div>
    </ImpressStep>

    <ImpressStep id="thanks" :z="papersPose.z - STAGE_DEPTH" :rotate-z="papersPose.rotateZ + 18">
      <div class="title-slide">
        <div class="eyebrow">{{ meta.workshopShort }} Working Group</div>
        <h1><span class="accent">Thank you</span></h1>
        <p class="subtitle">Questions &amp; discussion</p>
      </div>
    </ImpressStep>
  </div>

  <PresentationHud />
</template>

<style scoped>
.title-slide {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
h1 {
  font-size: 104px;
  font-weight: 800;
  line-height: 1.05;
  margin: 24px 0 28px;
}
.accent {
  background: linear-gradient(90deg, var(--amia-cyan), var(--amia-periwinkle) 55%, var(--amia-pink));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.subtitle {
  font-size: 36px;
  color: var(--amia-text-dim);
  margin: 0 0 40px;
}
.presenters {
  font-size: 28px;
  margin: 0;
}
.hint {
  margin-top: 60px;
  font-size: 20px;
  color: var(--amia-text-dim);
}
kbd {
  padding: 2px 10px;
  border: 1px solid var(--amia-cyan-soft);
  border-radius: 6px;
  font-family: var(--font-body);
}
.section-title {
  font-size: 64px;
  margin-top: 12px;
}
.overview-label {
  text-align: center;
  margin-top: 0;
}
.overview-label h2 {
  font-size: 120px;
  color: var(--amia-cyan);
  text-shadow: var(--glow-cyan);
}
</style>
