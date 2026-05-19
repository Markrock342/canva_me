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
