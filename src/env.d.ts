/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

/** Minimal typing for the impress.js global API (v1.x). */
interface ImpressApi {
  init(): void
  goto(target: number | string | HTMLElement, duration?: number): HTMLElement | false
  next(): HTMLElement | false
  prev(): HTMLElement | false
  tear(): void
}

interface Window {
  impress: (rootId?: string) => ImpressApi
}

declare module 'impress.js'
