import type { StoreType } from 'polotno/model/store'
import { loadTemplateIntoStore } from './loadTemplate'

type TemplateItem = { json: string }

/** เตรียม canvas ว่างตามขนาด */
export function prepareBlankCanvas(
  store: StoreType,
  width: number,
  height: number,
) {
  store.clear()
  store.addPage()
  store.setSize(width, height)
}

/** เปิดงานจากเทมเพลต */
export async function prepareCanvasFromTemplate(
  store: StoreType,
  template: TemplateItem,
  width: number,
  height: number,
) {
  prepareBlankCanvas(store, width, height)
  await loadTemplateIntoStore(store, template)
}

const WAIT_LOAD_MS = 12_000

/** รูปย่อสำหรับการ์ด "ล่าสุด" — เรียกตอนสตูดิโอยัง mount อยู่ */
export async function captureStoreThumbnail(store: StoreType): Promise<string | undefined> {
  try {
    await Promise.race([
      store.waitLoading(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('waitLoading timeout')), WAIT_LOAD_MS)),
    ])
    return await store.toDataURL({
      quickMode: true,
      pixelRatio: 0.2,
      mimeType: 'image/jpeg',
      quality: 0.68,
    })
  } catch {
    return undefined
  }
}
