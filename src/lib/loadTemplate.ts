import { nanoid } from 'nanoid'
import { forEveryChild } from 'polotno/model/group-model'
import type { StoreType } from 'polotno/model/store'

type TemplateItem = { json: string }

/** โหลดเทมเพลตจาก Polotno API เข้า store */
function isPolotnoDesignJson(value: unknown): value is Record<string, unknown> & {
  pages: unknown[]
} {
  if (!value || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  return Array.isArray(o.pages)
}

export async function loadTemplateIntoStore(
  store: StoreType,
  item: TemplateItem,
) {
  const res = await fetch(item.json)
  if (!res.ok) {
    throw new Error(`เทมเพลตโหลดไม่สำเร็จ (HTTP ${res.status})`)
  }
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('text/html')) {
    throw new Error('เทมเพลตตอบกลับเป็น HTML แทน JSON')
  }
  const json = await res.json()
  if (!isPolotnoDesignJson(json)) {
    throw new Error('รูปแบบเทมเพลตไม่ถูกต้อง')
  }

  type PageShape = { width?: number; height?: number; id?: string; children?: unknown }
  const design = json as {
    width?: number
    height?: number
    pages: PageShape[]
  }

  if (store.pages.length <= 1) {
    store.loadJSON(design as never, true)
    return
  }

  const current = JSON.parse(JSON.stringify(store.toJSON())) as {
    width?: number
    height?: number
    pages: unknown[]
  }
  if (current.width !== design.width || current.height !== design.height) {
    design.pages.forEach((page) => {
      page.width = page.width || design.width
      page.height = page.height || design.height
    })
  }

  forEveryChild({ children: design.pages as never }, (child: { id: string }) => {
    child.id = nanoid(10)
  })

  const activePage = store.activePage
  if (!activePage) {
    store.loadJSON(design as never, true)
    return
  }

  const activeIndex = store.pages.indexOf(activePage)
  current.pages.splice(activeIndex, 1, ...design.pages)
  store.loadJSON(current as never, true)
}
