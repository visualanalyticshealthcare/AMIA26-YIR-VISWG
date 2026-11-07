import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

/**
 * Shared presentation state. Kept outside App.vue on purpose: impress.js moves the step elements
 * into its own canvas, so App.vue (which renders the steps) should never need to re-render.
 */
const currentStepId = ref<string>('')
const onOverview = ref(false)
let api: ImpressApi | null = null

export function useImpressState() {
  return { currentStepId: readonly(currentStepId), onOverview: readonly(onOverview) }
}

export function goto(id: string | number) {
  api?.goto(id)
}

/** Toolbar navigation. `last` resolves the final step from the DOM so it stays right as slides change. */
export const nav = {
  first: () => api?.goto(0),
  prev: () => api?.prev(),
  next: () => api?.next(),
  last: () => api?.goto(document.querySelectorAll('#impress .step').length - 1),
}

/** Initialise impress.js once the steps are in the DOM. Call from the component that renders `#impress`. */
export function useImpressRoot(rootId = 'impress') {
  const handleEnter = (e: Event) => {
    const step = e.target as HTMLElement
    currentStepId.value = step.id
    // Arrived: reveal what is now in front of the camera again.
    cullBehindCamera(document.getElementById(rootId), step)
    onOverview.value = step.classList.contains('overview')
  }

  // impress adds `.active` to the target step as soon as a transition starts (even on rapid key presses),
  // so watching that class is the earliest reliable signal of where the camera is heading.
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      const el = r.target as HTMLElement
      if (el.classList.contains('active') && !(r.oldValue ?? '').split(' ').includes('active')) {
        // In flight: hide whatever lies behind either end of the trip.
        cullBehindCamera(document.getElementById(rootId), el, cameraZ)
      }
    }
  })

  onMounted(() => {
    const root = document.getElementById(rootId)
    if (!root) return
    root.addEventListener('impress:stepenter', handleEnter)
    root.querySelectorAll('.step').forEach((s) =>
      observer.observe(s, { attributes: true, attributeFilter: ['class'], attributeOldValue: true }),
    )
    api = window.impress(rootId)
    api.init()
  })

  onBeforeUnmount(() => {
    observer.disconnect()
    document.getElementById(rootId)?.removeEventListener('impress:stepenter', handleEnter)
    api?.tear()
    api = null
  })
}

/**
 * The deck dives along -z, so on every move the camera flies *through* the planes of the slides and rings
 * it leaves behind. An element crossing the CSS perspective plane is magnified enormously for a few frames,
 * which reads as flashing. Fade out everything at or behind the destination camera before the flight starts.
 * Elements opt in with `data-z`; on the overview step nothing is culled.
 */
const CULL_MARGIN = 400

let cameraZ: number | undefined

function cullBehindCamera(root: HTMLElement | null, target: HTMLElement, fromZ?: number) {
  if (!root) return
  const overview = target.classList.contains('overview')
  document.body.classList.toggle('impress-on-overview', overview)
  const targetZ = Number(target.dataset.z ?? 0)
  const wasOverview = fromZ === Infinity
  cameraZ = overview ? Infinity : targetZ
  // Leaving the overview, the camera swings in from the side: cull against the destination only.
  const limit = fromZ === undefined || wasOverview ? targetZ : Math.min(fromZ, targetZ)
  root.querySelectorAll<HTMLElement>('[data-z]').forEach((el) => {
    // In flight the target is culled too when it starts out behind the camera (moving backwards):
    // the camera passes through its plane before stopping in front of it. It fades in on arrival.
    const behind = !overview && (el !== target || fromZ !== undefined) && Number(el.dataset.z) > limit + CULL_MARGIN
    el.classList.toggle('behind-camera', behind)
  })
}

/**
 * Run callbacks when the step containing `el` becomes active / inactive.
 * impress.js dispatches `impress:stepenter` and `impress:stepleave` on the step element itself.
 */
export function onStep(
  getEl: () => HTMLElement | null | undefined,
  handlers: { enter?: () => void; leave?: () => void },
) {
  let step: HTMLElement | null = null
  const enter = () => handlers.enter?.()
  const leave = () => handlers.leave?.()
  onMounted(() => {
    step = getEl()?.closest('.step') ?? null
    step?.addEventListener('impress:stepenter', enter)
    step?.addEventListener('impress:stepleave', leave)
  })
  onBeforeUnmount(() => {
    step?.removeEventListener('impress:stepenter', enter)
    step?.removeEventListener('impress:stepleave', leave)
  })
}
