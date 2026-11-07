/**
 * Persistent Three.js point cloud: one glowing point per paper in the manual review, floating inside a faint
 * background of 6,700 points, one per visualization / dashboard paper among the 6,700+ visualization / dashboard papers published in the window.
 *
 * It lives on its own fixed canvas with its own render loop, completely independent of impress.js.
 * Slides only call `setScene()`; every point then eases toward the target position, color, and opacity
 * that scene assigns it, with a small per-point stagger so the cloud flows instead of jumping.
 */
import * as THREE from 'three'
import { byJournal, type PaperRecord } from '../data/records'

export type CloudScene = 'hidden' | 'focus' | 'sources' | 'criteria' | 'stage0' | 'stage1' | 'stage2' | 'stage3' | 'overview'

export const COLORS = {
  background: '#8795f4',
  paper: '#8ee9f2',
  screened: '#8795f4',
  neutral: '#c9c3f2',
  kept: '#8ee9f2',
  uncertain: '#5ef0b5',
  dropped: '#6f74f5',
  star: '#f27ac9',
}
const C = Object.fromEntries(Object.entries(COLORS).map(([k, v]) => [k, new THREE.Color(v)])) as Record<
  keyof typeof COLORS,
  THREE.Color
>
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/** How visible the background "whole literature" layer is in each scene. */
const BACKGROUND_ALPHA: Record<CloudScene, number> = {
  hidden: 1,
  focus: 0.08,
  sources: 0.9,
  criteria: 0.5,
  stage0: 0.45,
  stage1: 0.35,
  stage2: 0.3,
  stage3: 0.3,
  overview: 0.45,
}

/** Each background point stands for this many papers. */
export const BACKGROUND_RATIO = 1

interface Target {
  pos: THREE.Vector3
  color: THREE.Color
  alpha: number
  size: number
}

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uScale;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale / -mv.z;
    vColor = aColor;
    vAlpha = aAlpha;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = 1.0 - smoothstep(0.0, 0.42, d); // edge0 must be < edge1: reversed edges are undefined in GLSL
    float glow = pow(1.0 - d, 2.2) * 0.55;
    gl_FragColor = vec4(vColor * (core + glow) + core * 0.35, (core + glow) * vAlpha * uAlpha);
  }
`

function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

function fibonacciSphere(i: number, m: number, radius: number, jitter: number) {
  const y = 1 - (2 * (i + 0.5)) / Math.max(1, m)
  const rr = Math.sqrt(1 - y * y)
  const t = i * GOLDEN
  return new THREE.Vector3(Math.cos(t) * rr, y, Math.sin(t) * rr).multiplyScalar(radius * jitter)
}

function makePoints(count: number) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(count), 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(count), 1))
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uScale: { value: 1 }, uAlpha: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geometry, material)
  // Positions change every frame, so the cached bounding sphere goes stale; never frustum-cull.
  points.frustumCulled = false
  return points
}

const uniformsOf = (p: THREE.Points) => (p.material as THREE.ShaderMaterial).uniforms

export class PaperCloud {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400)
  private group = new THREE.Group()
  private papers: THREE.Points
  private background: THREE.Points
  private n: number
  private targets: Target[] = []
  private cur: { pos: THREE.Vector3; color: THREE.Color; alpha: number; size: number }[]
  private phase: Float32Array
  private delay: Float32Array
  private sceneName: CloudScene = 'hidden'
  private changedAt = 0
  private tiltTarget = 0.15
  private spin = 1
  private hovering = false
  private selected: number | null = null
  private raf = 0
  private last = 0
  private clock = 0
  private ro?: ResizeObserver
  /** Layout of each paper at each funnel stage (index = stage), so dropped points fall from where they were. */
  private stagePos: THREE.Vector3[][] = []
  /** Journal -> cluster index, largest journal first. */
  private journalIndex = new Map<string, number>()
  private tmp = new THREE.Vector3()

  constructor(
    private canvas: HTMLCanvasElement,
    private records: PaperRecord[],
    backgroundCount: number,
  ) {
    this.n = records.length
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    this.camera.position.set(0, 0, 34)

    this.background = this.buildBackground(backgroundCount)
    this.papers = makePoints(this.n)
    this.group.add(this.background, this.papers)
    this.scene.add(this.group)

    const rand = rng(42)
    this.phase = Float32Array.from({ length: this.n }, () => rand() * Math.PI * 2)
    this.delay = Float32Array.from({ length: this.n }, () => rand() * 0.6)
    this.buildStageLayouts()
    byJournal.forEach(([j], k) => this.journalIndex.set(j, k))

    this.targets = this.computeTargets('hidden')
    this.cur = this.targets.map((t) => ({ pos: t.pos.clone(), color: t.color.clone(), alpha: 0, size: t.size }))

    this.resize()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  setScene(name: CloudScene) {
    if (name === this.sceneName) return
    this.sceneName = name
    this.changedAt = this.clock
    this.targets = this.computeTargets(name)
    this.tiltTarget = name === 'overview' ? 0.42 : 0.15
  }

  /** Highlight one paper (index into records), or none. */
  select(i: number | null) {
    this.selected = i
  }

  /**
   * Track the pointer (client coordinates): rotation pauses while it is over the cloud.
   * Returns the index of the paper point under the pointer, if any.
   */
  pointer(x: number, y: number): number | null {
    const { cx, cy, r } = this.screenDisc()
    this.hovering = Math.hypot(x - cx, y - cy) < r
    return this.hovering ? this.pick(x, y) : null
  }

  pointerLeave() {
    this.hovering = false
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro?.disconnect()
    for (const p of [this.papers, this.background]) {
      p.geometry.dispose()
      ;(p.material as THREE.Material).dispose()
    }
    this.renderer.dispose()
  }

  // ---------------------------------------------------------------- picking

  /** Screen-space disc covering the cloud, in CSS pixels. */
  private screenDisc() {
    const rect = this.canvas.getBoundingClientRect()
    const c = this.tmp.copy(this.group.position).project(this.camera)
    const cx = rect.left + ((c.x + 1) / 2) * rect.width
    const cy = rect.top + ((1 - c.y) / 2) * rect.height
    const pxPerUnit = rect.height / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z)
    return { cx, cy, r: 12 * pxPerUnit }
  }

  private pick(x: number, y: number): number | null {
    const rect = this.canvas.getBoundingClientRect()
    const pos = this.papers.geometry.getAttribute('position') as THREE.BufferAttribute
    let best: number | null = null
    let bestD = 22 // px
    for (let i = 0; i < this.n; i++) {
      if (this.cur[i]!.alpha < 0.3) continue
      this.tmp.fromBufferAttribute(pos, i).applyMatrix4(this.group.matrixWorld).project(this.camera)
      const sx = rect.left + ((this.tmp.x + 1) / 2) * rect.width
      const sy = rect.top + ((1 - this.tmp.y) / 2) * rect.height
      const d = Math.hypot(sx - x, sy - y)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    return best
  }

  // ---------------------------------------------------------------- layouts

  private buildStageLayouts() {
    const rand = rng(7)
    const jitter = Array.from({ length: this.n }, () => 0.72 + rand() * 0.28)
    const radii = [9, 7.2, 5.6]
    for (let s = 0; s < 3; s++) {
      const kept = this.records.map((r, i) => ({ r, i })).filter(({ r }) => r.stage >= s)
      const layout: THREE.Vector3[] = []
      kept.forEach(({ i }, k) => (layout[i] = fibonacciSphere(k, kept.length, radii[s]!, jitter[i]!)))
      this.stagePos[s] = layout
    }
    // Selected papers: a tilted ring, highlighted papers first.
    const top = this.records
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.stage === 3)
      .sort((a, b) => (b.r.score?.total ?? 0) - (a.r.score?.total ?? 0))
    const ring: THREE.Vector3[] = []
    top.forEach(({ i }, k) => {
      const a = (k / top.length) * Math.PI * 2
      ring[i] = new THREE.Vector3(Math.cos(a) * 6.5, Math.sin(a) * 1.2, Math.sin(a) * 6.5)
    })
    this.stagePos[3] = ring
  }

  private computeTargets(name: CloudScene): Target[] {
    const rand = rng(1234)
    const star = (r: PaperRecord) => r.stage === 3 && r.score?.total === 9
    return this.records.map((r, i) => {
      const t: Target = { pos: this.stagePos[0]![i]!.clone(), color: C.neutral, alpha: 0.9, size: 2.2 }
      switch (name) {
        case 'hidden':
        case 'focus':
          t.pos.multiplyScalar(0.25)
          t.alpha = 0
          break
        case 'sources': {
          // One cluster per journal, arranged on a ring; every journal is drawn the same way.
          const k = this.journalIndex.get(r.journal)!
          const members = this.records.filter((x) => x.journal === r.journal)
          const a = (k / this.journalIndex.size) * Math.PI * 2
          const center = new THREE.Vector3(Math.cos(a) * 7.5, Math.sin(a) * 5.5, Math.sin(a * 2) * 2)
          const radius = 0.9 + Math.sqrt(members.length) * 0.75
          t.pos = fibonacciSphere(members.indexOf(r), members.length, radius, 0.7 + rand() * 0.3).add(center)
          t.color = C.paper
          break
        }
        case 'criteria':
          t.alpha = 0.55
          break
        case 'stage0':
        case 'stage1':
        case 'stage2':
        case 'stage3': {
          const s = Number(name.slice(5))
          if (r.stage >= s) {
            t.pos = this.stagePos[s]![i]!.clone()
            if (s === 0) t.color = C.paper
            else if (s === 3) {
              t.color = star(r) ? C.star : C.kept
              t.size = 3.8
            } else t.color = r.uncertain && s === 1 ? C.uncertain : C.kept
          } else {
            // Fell out of the funnel: drift outward and down from where it last was, leaving a faint trace.
            const from = this.stagePos[Math.min(r.stage, 1)]![i]!
            t.pos = from.clone().multiplyScalar(1.55).add(new THREE.Vector3(0, -7 - (s - r.stage) * 2, 0))
            t.color = C.dropped
            t.alpha = 0.18
            t.size = 1.4
          }
          break
        }
        case 'overview': {
          // Each paper sits on the funnel layer where it stopped: reviewed, passed screening, selected.
          const layer = [0, 1, 1, 2][r.stage]!
          const layerY = [6, 0, -6.5][layer]!
          const layerR = [10, 7, 3.6][layer]!
          const a = i * GOLDEN * 3
          const rr = layerR * (0.82 + rand() * 0.18)
          t.pos = new THREE.Vector3(Math.cos(a) * rr, layerY + (rand() - 0.5) * 0.8, Math.sin(a) * rr)
          t.color = star(r) ? C.star : [C.dropped, C.screened, C.kept][layer]!
          t.size = r.stage === 3 ? 3.4 : 2
          break
        }
      }
      return t
    })
  }

  private buildBackground(count: number) {
    const pts = makePoints(count)
    const rand = rng(99)
    const g = pts.geometry
    const pos = g.getAttribute('position') as THREE.BufferAttribute
    const col = g.getAttribute('aColor') as THREE.BufferAttribute
    const alp = g.getAttribute('aAlpha') as THREE.BufferAttribute
    const siz = g.getAttribute('aSize') as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      // Random direction, denser toward the middle: the wider literature the review set was drawn from.
      v.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize()
      const r = 2 + 15 * Math.pow(rand(), 0.75)
      pos.setXYZ(i, v.x * r * 1.05, v.y * r * 0.85, v.z * r)
      const c = rand() > 0.8 ? C.neutral : C.background
      col.setXYZ(i, c.r, c.g, c.b)
      alp.setX(i, 0.11 + rand() * 0.13) // twice the dots of the 1:2 version, so each is fainter
      siz.setX(i, 0.28 + rand() * 0.3)
    }
    return pts
  }

  // ---------------------------------------------------------------- frame loop

  private resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    const halfH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z
    // Text sits on the left of every slide; keep the cloud on the right.
    this.group.position.x = halfH * this.camera.aspect * 0.5
    const scale = (h * this.renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)))
    uniformsOf(this.papers).uScale!.value = scale
    uniformsOf(this.background).uScale!.value = scale
  }

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick)
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    if (document.hidden) return
    this.clock += dt

    const k = 1 - Math.exp(-dt * 2.4)
    const g = this.papers.geometry
    const pos = g.getAttribute('position') as THREE.BufferAttribute
    const col = g.getAttribute('aColor') as THREE.BufferAttribute
    const alp = g.getAttribute('aAlpha') as THREE.BufferAttribute
    const siz = g.getAttribute('aSize') as THREE.BufferAttribute
    const since = this.clock - this.changedAt
    for (let i = 0; i < this.n; i++) {
      const c = this.cur[i]!
      const t = this.targets[i]!
      if (since > this.delay[i]!) {
        c.pos.lerp(t.pos, k)
        c.color.lerp(t.color, k)
        c.alpha += (t.alpha - c.alpha) * k
        c.size += (t.size - c.size) * k
      }
      const p = this.phase[i]!
      const wob = this.hovering ? 0.04 : 0.18 // calm the wobble too, so a point holds still under the cursor
      pos.setXYZ(
        i,
        c.pos.x + Math.sin(this.clock * 0.6 + p) * wob,
        c.pos.y + Math.cos(this.clock * 0.5 + p * 1.3) * wob,
        c.pos.z + Math.sin(this.clock * 0.4 + p * 0.7) * wob,
      )
      const sel = i === this.selected
      col.setXYZ(i, sel ? 1 : c.color.r, sel ? 1 : c.color.g, sel ? 1 : c.color.b)
      alp.setX(i, sel ? Math.max(c.alpha, 0.95) : c.alpha)
      siz.setX(i, sel ? c.size * 1.9 : c.size)
    }
    pos.needsUpdate = col.needsUpdate = alp.needsUpdate = siz.needsUpdate = true

    const bg = uniformsOf(this.background).uAlpha!
    bg.value += (BACKGROUND_ALPHA[this.sceneName] - bg.value) * k

    // Ease rotation to a stop while the pointer is over the cloud, and back up when it leaves.
    this.spin += ((this.hovering ? 0 : 1) - this.spin) * (1 - Math.exp(-dt * 6))
    this.group.rotation.y += dt * 0.07 * this.spin
    this.group.rotation.x += (this.tiltTarget - this.group.rotation.x) * k
    this.renderer.render(this.scene, this.camera)
  }
}
