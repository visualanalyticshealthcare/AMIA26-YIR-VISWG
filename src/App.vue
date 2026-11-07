<script setup lang="ts">
/**
 * The deck. impress.js only moves the text slides in 3D; the paper points are a separate Three.js layer
 * (PaperCloudLayer) that follows the active slide. Keep this template static (see composables/useImpress.ts).
 */
import CriteriaSlide from './components/CriteriaSlide.vue'
import ImpressStep from './components/ImpressStep.vue'
import PaperCloudLayer from './components/PaperCloudLayer.vue'
import PresentationHud from './components/PresentationHud.vue'
import SearchSlide from './components/SearchSlide.vue'
import SelectedPapers from './components/SelectedPapers.vue'
import StageSlide from './components/StageSlide.vue'
import TypedText from './components/TypedText.vue'
import { useImpressRoot } from './composables/useImpress'
import { slidePose } from './data/layout'
import { meta } from './data/meta'
import { stages } from './data/pipeline'
import { shortlist, countAtLeast } from './data/records'
import type { CloudScene } from './three/PaperCloud'

useImpressRoot('impress')

// Slide order along the dive. Each entry gets the next pose on the spiral.
const order = ['title', 'search', 'criteria', ...stages.map((s) => s.id), 'papers', 'thanks']
const pose = (id: string) => slidePose(order.indexOf(id))

const stageSteps = stages.map((stage, i) => ({
  stage,
  index: i,
  pose: pose(stage.id),
}))
const funnelMid = (pose('identified').z + pose('papers').z) / 2

/** Which point-cloud layout each slide shows. The cloud first appears on the search slide. */
const cloudScenes: Record<string, CloudScene> = {
  title: 'hidden',
  search: 'sources',
  criteria: 'criteria',
  ...Object.fromEntries(stages.map((s) => [s.id, `stage${s.minStage}` as CloudScene])),
  papers: 'papers',
  overview: 'overview',
  thanks: 'thanks',
}
</script>

<template>
  <div class="fallback-message">
    <p>Your browser does not support the features required by impress.js, so this is a simplified version of the presentation.</p>
    <p>For the best experience please use the latest Chrome, Safari, Firefox, or Edge.</p>
  </div>

  <div id="impress" data-width="1600" data-height="900" data-perspective="1000" data-transition-duration="1400">
    <ImpressStep id="title" v-bind="pose('title')">
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

    <ImpressStep id="search" v-bind="pose('search')">
      <SearchSlide />
    </ImpressStep>

    <ImpressStep id="criteria" v-bind="pose('criteria')">
      <CriteriaSlide />
    </ImpressStep>

    <ImpressStep v-for="s in stageSteps" :id="s.stage.id" :key="s.stage.id" v-bind="s.pose">
      <StageSlide :stage="s.stage" :index="s.index" />
    </ImpressStep>

    <ImpressStep id="papers" v-bind="pose('papers')">
      <div class="eyebrow">The selection</div>
      <h2 class="section-title"><TypedText :text="`${shortlist.length} papers selected after full-text review`" /></h2>
      <SelectedPapers />
    </ImpressStep>

    <ImpressStep id="overview" class="overview" :x="3200" :y="-600" :z="funnelMid" :rotate-x="-12" :rotate-y="52" :scale="9.5">
      <div class="overview-label">
        <div class="eyebrow">The whole funnel</div>
        <h2>{{ countAtLeast(0) }} → {{ shortlist.length }}</h2>
        <p class="overview-sub">papers reviewed → papers selected</p>
      </div>
    </ImpressStep>

    <ImpressStep id="thanks" v-bind="pose('thanks')">
      <div class="title-slide">
        <div class="eyebrow">{{ meta.workshopShort }} Working Group</div>
        <h1><span class="accent">Thank you</span></h1>
        <p class="subtitle">Questions &amp; discussion</p>
      </div>
    </ImpressStep>
  </div>

  <PaperCloudLayer :scenes="cloudScenes" />
  <PresentationHud />
</template>

<style scoped>
.title-slide {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  max-width: 900px;
}
h1 {
  font-size: 100px;
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
  font-size: 34px;
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
  font-size: 60px;
  margin-top: 12px;
  min-height: 1.2em;
}
.overview-label h2 {
  font-size: 120px;
  color: var(--amia-cyan);
  text-shadow: var(--glow-cyan);
}
.overview-sub {
  margin: 0;
  font-size: 40px;
  color: var(--amia-text-dim);
}
</style>
