import type { StoreType } from 'polotno/model/store'
import { unsplashDownload } from 'polotno/utils/api'
import { getImageSize } from 'polotno/utils/image'
import type { CatalogTemplateItem } from '../types/catalogTemplate'
import { loadTemplateIntoStore } from './loadTemplate'
import { prepareBlankCanvas } from './canvasSession'

/** เปิดเทมเพลตจากแคตตาล็อก — รองรับ Polotno / marc-canva / Unsplash */
export async function openCatalogTemplate(store: StoreType, item: CatalogTemplateItem) {
  if (item.provider === 'unsplash' && item.unsplashId) {
    const w = item.width ?? 1080
    const h = item.height ?? 1080
    prepareBlankCanvas(store, w, h)
    const res = await fetch(unsplashDownload(item.unsplashId))
    if (!res.ok) throw new Error(`Unsplash โหลดไม่สำเร็จ (HTTP ${res.status})`)
    const data = (await res.json()) as { url?: string }
    if (!data.url) throw new Error('ไม่ได้ URL รูปจาก Unsplash')
    const { width: iw, height: ih } = await getImageSize(data.url)
    const scale = Math.max(w / iw, h / ih)
    const width = iw * scale
    const height = ih * scale
    store.activePage?.addElement({
      type: 'image',
      src: data.url,
      width,
      height,
      x: (w - width) / 2,
      y: (h - height) / 2,
    })
    return { title: item.title ?? 'จาก Unsplash', width: w, height: h, preview: item.preview }
  }

  if (item.inlineDesign) {
    const design = item.inlineDesign as { width?: number; height?: number }
    const w = design.width ?? item.width ?? 1080
    const h = design.height ?? item.height ?? 1080
    store.clear()
    store.loadJSON(item.inlineDesign as never, true)
    if (store.width !== w || store.height !== h) {
      store.setSize(w, h)
    }
    return {
      title: item.title ?? 'แม่แบบ marc-canva',
      width: w,
      height: h,
      preview: item.preview,
    }
  }

  if (item.json) {
    const w = item.width ?? 1080
    const h = item.height ?? 1080
    prepareBlankCanvas(store, w, h)
    await loadTemplateIntoStore(store, { json: item.json })
    return {
      title: item.title ?? 'เทมเพลต',
      width: store.width,
      height: store.height,
      preview: item.preview,
    }
  }

  throw new Error('เทมเพลตไม่มีข้อมูลให้เปิด')
}
