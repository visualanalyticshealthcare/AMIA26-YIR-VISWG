<script setup lang="ts">
/**
 * The deck. impress.js only moves the text slides in 3D; the paper points are a separate Three.js layer
 * (PaperCloudLayer) that follows the active slide. Keep this template static (see composables/useImpress.ts).
 */
import CriteriaSlide from './components/CriteriaSlide.vue'
import FeaturedPaperSlide from './components/FeaturedPaperSlide.vue'
import ImpressStep from './components/ImpressStep.vue'
import PaperCloudLayer from './components/PaperCloudLayer.vue'
import PaperList from './components/PaperList.vue'
import PresentationHud from './components/PresentationHud.vue'
import PresentationToolbar from './components/PresentationToolbar.vue'
import SearchSlide from './components/SearchSlide.vue'
import StageSlide from './components/StageSlide.vue'
import TypedText from './components/TypedText.vue'
import { useImpressRoot } from './composables/useImpress'
import { slidePose } from './data/layout'
import { featured } from './data/featured'
import { meta } from './data/meta'
import { stages } from './data/pipeline'
import { shortlist, countAtLeast } from './data/records'
import type { CloudScene } from './three/PaperCloud'

useImpressRoot('impress')

// Slide order along the dive. Each entry gets the next pose on the spiral; the final overview is a side view.
const order = ['title', 'search', 'criteria', ...stages.map((s) => s.id), ...featured.map((f) => f.id), 'papers']
const pose = (id: string) => slidePose(order.indexOf(id))

const stageSteps = stages.map((stage, i) => ({ stage, index: i, pose: pose(stage.id) }))
const funnelMid = (pose('identified').z + pose('papers').z) / 2

/** Which point-cloud layout each slide shows. The title slide shows only the background literature. */
const cloudScenes: Record<string, CloudScene> = {
  title: 'hidden',
  search: 'sources',
  criteria: 'criteria',
  ...Object.fromEntries(stages.map((s) => [s.id, `stage${s.minStage}` as CloudScene])),
  // Featured papers and the paper list: the cloud steps back so the text stays clear.
  ...Object.fromEntries(featured.map((f) => [f.id, 'focus' as CloudScene])),
  papers: 'focus',
  overview: 'overview',
}

const shortUrl = meta.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
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
          Visual Analytics in Healthcare<br />
          <span class="accent">{{ meta.title }}</span>
        </h1>
        <p class="workshop">{{ meta.workshop }}</p>
        <a class="url" :href="meta.url" target="_blank" rel="noopener">{{ shortUrl }}</a>
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

    <ImpressStep v-for="(f, i) in featured" :id="f.id" :key="f.id" v-bind="pose(f.id)">
      <FeaturedPaperSlide :paper="f" :index="i" :total="featured.length" />
    </ImpressStep>

    <ImpressStep id="papers" v-bind="pose('papers')">
      <div class="eyebrow">The selection</div>
      <h2 class="section-title"><TypedText :text="`${shortlist.length} papers selected after full-text review`" /></h2>
      <PaperList />
    </ImpressStep>

    <ImpressStep id="overview" class="overview" :x="3200" :y="-600" :z="funnelMid" :rotate-x="-12" :rotate-y="52" :scale="9.5">
      <div class="closing">
        <h1><span class="accent">Thank you</span></h1>
        <p class="funnel">
          <b>{{ countAtLeast(0) }} → {{ countAtLeast(1) }} → {{ shortlist.length }}</b>
          <span>papers reviewed → passed screening → selected</span>
        </p>
        <p class="subtitle">Questions &amp; discussion</p>
        <a class="url" :href="meta.url" target="_blank" rel="noopener">{{ shortUrl }}</a>
      </div>
    </ImpressStep>
  </div>

  <PaperCloudLayer :scenes="cloudScenes" />
  <PresentationHud />
  <PresentationToolbar />
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
.workshop {
  font-size: 34px;
  color: var(--amia-text-dim);
  margin: 0 0 34px;
}
.url {
  align-self: flex-start;
  padding: 10px 20px;
  border: 1.5px solid var(--amia-cyan);
  border-radius: 999px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 24px;
  color: var(--amia-cyan);
  text-decoration: none;
  box-shadow: 0 0 18px rgba(142, 233, 242, 0.25);
}
.hint {
  margin-top: 50px;
  font-size: 22px;
  color: var(--amia-text-dim);
}
kbd {
  padding: 2px 10px;
  border: 1px solid var(--amia-cyan-soft);
  border-radius: 6px;
  font-family: var(--font-body);
}
.section-title {
  font-size: 56px;
  margin-top: 12px;
  min-height: 1.2em;
}
.closing {
  display: flex;
  flex-direction: column;
}
.closing h1 {
  margin: 0 0 10px;
}
.funnel {
  margin: 0 0 14px;
}
.funnel b {
  display: block;
  font-family: var(--font-display);
  font-size: 72px;
  color: var(--amia-cyan);
  text-shadow: var(--glow-cyan);
}
.funnel span {
  font-size: 28px;
  color: var(--amia-text-dim);
}
.subtitle {
  font-size: 34px;
  margin: 0 0 24px;
}
</style>
