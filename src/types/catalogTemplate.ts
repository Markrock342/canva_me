/** แหล่งเทมเพลตที่รองรับในแคตตาล็อก */
export type TemplateProvider = 'polotno' | 'marc-canva' | 'unsplash'

export type CatalogTemplateItem = {
  preview: string
  title?: string
  provider: TemplateProvider
  providerLabel: string
  /** Polotno CDN / marc-canva ที่โฮสต์เป็น URL */
  json?: string
  /** marc-canva แบบฝังในแอป */
  inlineDesign?: Record<string, unknown>
  width?: number
  height?: number
  /** Unsplash ผ่าน Polotno proxy */
  unsplashId?: string
}

export const PROVIDER_LABELS: Record<TemplateProvider, string> = {
  polotno: 'Polotno',
  'marc-canva': 'marc-canva',
  unsplash: 'Unsplash',
}
