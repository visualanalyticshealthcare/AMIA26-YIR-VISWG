/**
 * Persistent Three.js point cloud: one glowing point per paper in the review.
 *
 * It lives on its own fixed canvas with its own render loop, completely independent of impress.js.
 * Slides only call `setScene()`; every point then eases toward the target position, color, and opacity
 * that scene assigns it, with a small per-point stagger so the cloud flows instead of jumping.
 */
import * as THREE from 'three'
import { byJournal, type PaperRecord } from '../data/records'

export type CloudScene =
  | 'hidden'
  | 'sources'
  | 'criteria'
  | 'stage0'
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'papers'
  | 'overview'
  | 'thanks'

const C = {
  pubmed: new THREE.Color('#8795f4'),
  ieee: new THREE.Color('#8ee9f2'),
  neutral: new THREE.Color('#c9c3f2'),
  kept: new THREE.Color('#8ee9f2'),
  dropped: new THREE.Color('#6f74f5'),
  pink: new THREE.Color('#f27ac9'),
  green: new THREE.Color('#5ef0b5'),
}
// Funnel layers shown to the audience: reviewed, passed screening, selected (stage 2 folds into "passed screening").
const LAYER_COLORS = [C.dropped, C.pubmed, C.pubmed, C.kept]
const layerOf = (stage: number) => [0, 1, 1, 2][stage]!
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

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
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = 1.0 - smoothstep(0.0, 0.42, d); // edge0 must be < edge1: reversed edges are undefined in GLSL
    float glow = pow(1.0 - d, 2.2) * 0.55;
    gl_FragColor = vec4(vColor * (core + glow) + core * 0.35, (core + glow) * vAlpha);
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
    uniforms: { uScale: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geometry, material)
  // Positions change every frame, so the cached bounding sphere goes stale; never frustum-cull.
  points.frustumCulled = false
  return points
}

export class PaperCloud {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400)
  private group = new THREE.Group()
  private papers: THREE.Points
  private dust: THREE.Points
  private n: number
  private targets: Target[] = []
  private cur: { pos: THREE.Vector3; color: THREE.Color; alpha: number; size: number }[]
  private phase: Float32Array
  private delay: Float32Array
  private sceneName: CloudScene = 'hidden'
  private changedAt = 0
  private tiltTarget = 0.15
  private raf = 0
  private last = 0
  private clock = 0
  private ro?: ResizeObserver
  /** Layout of each paper at each funnel stage (index = stage), so dropped points fall from where they were. */
  private stagePos: THREE.Vector3[][] = []
  /** Journal -> cluster index, largest journal first. */
  private journalIndex = new Map<string, number>()

  constructor(
    private canvas: HTMLCanvasElement,
    private records: PaperRecord[],
  ) {
    this.n = records.length
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    this.camera.position.set(0, 0, 34)

    this.papers = makePoints(this.n)
    this.group.add(this.papers)
    this.scene.add(this.group)

    this.dust = this.buildDust(900)
    this.scene.add(this.dust)

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

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro?.disconnect()
    this.papers.geometry.dispose()
    ;(this.papers.material as THREE.Material).dispose()
    this.dust.geometry.dispose()
    ;(this.dust.material as THREE.Material).dispose()
    this.renderer.dispose()
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
    // Shortlist: a tilted ring, best scores first.
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
    return this.records.map((r, i) => {
      const t: Target = { pos: this.stagePos[0]![i]!.clone(), color: C.neutral, alpha: 0.9, size: 2.2 }
      switch (name) {
        case 'hidden':
          t.pos.multiplyScalar(0.25)
          t.alpha = 0
          break
        case 'sources': {
          // One cluster per journal, arranged on a ring: the shape of the 68-paper review set by venue.
          const k = this.journalIndex.get(r.journal)!
          const members = this.records.filter((x) => x.journal === r.journal)
          const a = (k / this.journalIndex.size) * Math.PI * 2
          const center = new THREE.Vector3(Math.cos(a) * 7.5, Math.sin(a) * 5.5, Math.sin(a * 2) * 2)
          const radius = 0.9 + Math.sqrt(members.length) * 0.75
          t.pos = fibonacciSphere(members.indexOf(r), members.length, radius, 0.7 + rand() * 0.3).add(center)
          t.color = r.venue === 'TVCG' ? C.ieee : C.pubmed
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
            if (s === 0) t.color = r.venue === 'TVCG' ? C.ieee : C.pubmed
            else if (s === 3) {
              t.color = r.score?.total === 9 ? C.pink : C.kept
              t.size = 3.8
            } else t.color = r.uncertain && s === 1 ? C.green : C.kept
          } else {
            // Fell out of the funnel: drift outward and down from where it last was, leaving a faint trace.
            const from = this.stagePos[Math.min(r.stage, 1)]![i]!
            t.pos = from.clone().multiplyScalar(1.55).add(new THREE.Vector3(0, -7 - (s - r.stage) * 2, 0))
            t.color = C.dropped
            t.alpha = 0.1
            t.size = 1.4
          }
          break
        }
        case 'papers':
          if (r.stage === 3) {
            t.pos = this.stagePos[3]![i]!.clone().multiplyScalar(1.4)
            t.color = r.score?.total === 9 ? C.pink : C.kept
            t.alpha = 0.3
            t.size = 2.6
          } else {
            t.alpha = 0
          }
          break
        case 'overview': {
          // Each paper sits on the funnel layer where it stopped.
          const layerY = [6, 0, -6.5][layerOf(r.stage)]!
          const layerR = [10, 7, 3.6][layerOf(r.stage)]!
          const a = i * GOLDEN * 3
          const rr = layerR * (0.82 + rand() * 0.18)
          t.pos = new THREE.Vector3(Math.cos(a) * rr, layerY + (rand() - 0.5) * 0.8, Math.sin(a) * rr)
          t.color = r.stage === 3 && r.score?.total === 9 ? C.pink : LAYER_COLORS[r.stage]!
          t.size = r.stage === 3 ? 3.4 : 2
          break
        }
        case 'thanks': {
          const arm = i % 2
          const a = (i / this.n) * Math.PI * 3 + arm * Math.PI
          const rr = 1.5 + (i / this.n) * 10
          t.pos = new THREE.Vector3(Math.cos(a) * rr, (rand() - 0.5) * 1.5, Math.sin(a) * rr)
          t.color = LAYER_COLORS[r.stage]!
          t.alpha = 0.75
          break
        }
      }
      return t
    })
  }

  private buildDust(count: number) {
    const pts = makePoints(count)
    const rand = rng(99)
    const g = pts.geometry
    const pos = g.getAttribute('position') as THREE.BufferAttribute
    const col = g.getAttribute('aColor') as THREE.BufferAttribute
    const alp = g.getAttribute('aAlpha') as THREE.BufferAttribute
    const siz = g.getAttribute('aSize') as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      pos.setXYZ(i, (rand() - 0.5) * 110, (rand() - 0.5) * 70, -rand() * 90 + 10)
      const c = rand() > 0.85 ? C.ieee : C.pubmed
      col.setXYZ(i, c.r, c.g, c.b)
      alp.setX(i, 0.12 + rand() * 0.2)
      siz.setX(i, 0.12 + rand() * 0.18)
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
    this.group.position.x = halfH * this.camera.aspect * 0.42
    const scale = (h * this.renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)))
    ;(this.papers.material as THREE.ShaderMaterial).uniforms.uScale!.value = scale
    ;(this.dust.material as THREE.ShaderMaterial).uniforms.uScale!.value = scale
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
      const wob = 0.18
      pos.setXYZ(
        i,
        c.pos.x + Math.sin(this.clock * 0.6 + p) * wob,
        c.pos.y + Math.cos(this.clock * 0.5 + p * 1.3) * wob,
        c.pos.z + Math.sin(this.clock * 0.4 + p * 0.7) * wob,
      )
      col.setXYZ(i, c.color.r, c.color.g, c.color.b)
      alp.setX(i, c.alpha)
      siz.setX(i, c.size)
    }
    pos.needsUpdate = col.needsUpdate = alp.needsUpdate = siz.needsUpdate = true

    this.group.rotation.y += dt * 0.07
    this.group.rotation.x += (this.tiltTarget - this.group.rotation.x) * k
    this.dust.rotation.y = Math.sin(this.clock * 0.03) * 0.15
    this.renderer.render(this.scene, this.camera)
  }
}
