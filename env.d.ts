/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'virtual:fictif-views-data' {
  export const views: Record<string, () => Promise<{ default: any }>>
  export const nameToId: Record<string, string>
}
