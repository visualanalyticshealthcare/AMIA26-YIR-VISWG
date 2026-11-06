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

export function goto(id: string) {
  api?.goto(id)
}

/** Initialise impress.js once the steps are in the DOM. Call from the component that renders `#impress`. */
export function useImpressRoot(rootId = 'impress') {
  const handleEnter = (e: Event) => {
    const step = e.target as HTMLElement
    currentStepId.value = step.id
    onOverview.value = step.classList.contains('overview')
    document.body.classList.toggle('impress-on-overview', onOverview.value)
  }

  onMounted(() => {
    const root = document.getElementById(rootId)
    root?.addEventListener('impress:stepenter', handleEnter)
    api = window.impress(rootId)
    api.init()
  })

  onBeforeUnmount(() => {
    document.getElementById(rootId)?.removeEventListener('impress:stepenter', handleEnter)
    api?.tear()
    api = null
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
