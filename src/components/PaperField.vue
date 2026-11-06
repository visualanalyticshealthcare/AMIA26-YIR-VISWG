<script setup lang="ts">
/**
 * A field of dots, one per paper. When its step becomes active, papers that do not survive this
 * stage drift away and fade, while the survivors light up. With `incoming === kept` it just blooms in.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onStep } from '../composables/useImpress'

const props = withDefaults(
  defineProps<{
    incoming: number
    kept: number
    width?: number
    height?: number
    seed?: number
  }>(),
  { width: 820, height: 620, seed: 7 },
)

const canvas = ref<HTMLCanvasElement>()
const DPR = 2
const DURATION = 1800

interface Dot {
  x: number
  y: number
  r: number
  keep: boolean
  dx: number
  dy: number
  delay: number
}

let dots: Dot[] = []
let raf = 0
let start = 0

function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

function build() {
  const rand = rng(props.seed)
  const n = props.incoming
  const cx = props.width / 2
  const cy = props.height / 2
  const maxR = Math.min(props.width, props.height) / 2 - 12
  // Sunflower (phyllotaxis) layout fills a disc evenly for any n.
  const golden = Math.PI * (3 - Math.sqrt(5))
  const spacing = maxR / Math.sqrt(n)
  const dotR = Math.max(1.6, Math.min(14, spacing * 0.42))
  const keepIdx = new Set<number>()
  while (keepIdx.size < Math.min(props.kept, n)) keepIdx.add(Math.floor(rand() * n))
  dots = Array.from({ length: n }, (_, i) => {
    const r = spacing * Math.sqrt(i + 0.5)
    const a = i * golden
    const ang = rand() * Math.PI * 2
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
      r: dotR,
      keep: keepIdx.has(i),
      dx: Math.cos(ang) * (80 + rand() * 160),
      dy: Math.sin(ang) * 60 + 120 + rand() * 120,
      delay: rand() * 0.45,
    }
  })
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3)

function draw(progress: number) {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  ctx.clearRect(0, 0, props.width, props.height)
  const filtering = props.kept < props.incoming
  for (const d of dots) {
    const t = ease(Math.min(1, Math.max(0, (progress - d.delay) / (1 - d.delay))))
    let x = d.x
    let y = d.y
    let alpha = 1
    let color = '#8795f4'
    if (!filtering) {
      alpha = t
      color = t > 0.9 ? '#8ee9f2' : '#8795f4'
    } else if (d.keep) {
      color = t > 0.5 ? '#8ee9f2' : '#8795f4'
    } else {
      x += d.dx * t
      y += d.dy * t
      alpha = 1 - 0.9 * t
      color = '#6f74f5'
    }
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    if (d.keep && filtering && t > 0.5) {
      ctx.shadowColor = '#8ee9f2'
      ctx.shadowBlur = 10
    } else {
      ctx.shadowBlur = 0
    }
    ctx.beginPath()
    ctx.arc(x, y, d.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function play() {
  cancelAnimationFrame(raf)
  start = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / DURATION)
    draw(p)
    if (p < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  const c = canvas.value!
  c.width = props.width * DPR
  c.height = props.height * DPR
  build()
  draw(0)
})

onBeforeUnmount(() => cancelAnimationFrame(raf))

onStep(() => canvas.value, { enter: play })
</script>

<template>
  <canvas ref="canvas" class="paper-field" :style="{ width: `${width}px`, height: `${height}px` }" />
</template>
