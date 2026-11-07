import Typed from 'typed.js'
import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { onStep } from './useImpress'

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** typed.js treats `^` (pause) and backticks (instant chunk) as syntax; neutralise them in content. */
const safe = (html: string) => html.replace(/\^/g, '&#94;').replace(/`/g, '&#96;')

/**
 * Show `html` statically, then retype it with typed.js the first time its slide is entered.
 * Later visits (and the overview) just show the finished text, so nothing re-animates on navigation.
 */
export function useTypeOnEnter(el: Ref<HTMLElement | undefined>, html: () => string, typeSpeed = 22) {
  let typed: Typed | null = null
  let done = false

  onMounted(() => {
    if (el.value) el.value.innerHTML = html()
  })

  onStep(() => el.value, {
    enter: () => {
      if (done || !el.value) return
      done = true
      typed = new Typed(el.value, {
        strings: [safe(html())],
        contentType: 'html',
        typeSpeed,
        showCursor: false,
        onComplete: () => {
          typed?.destroy()
          typed = null
          if (el.value) el.value.innerHTML = html()
        },
      })
    },
  })

  onBeforeUnmount(() => typed?.destroy())
}
