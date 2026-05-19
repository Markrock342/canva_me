import { nanoid } from 'nanoid'
import { forEveryChild } from 'polotno/model/group-model'
import type { StoreType } from 'polotno/model/store'

type TemplateItem = { json: string }

/** โหลดเทมเพลตจาก Polotno API เข้า store */
export async function loadTemplateIntoStore(
  store: StoreType,
  item: TemplateItem,
) {
  const res = await fetch(item.json)
  const json = await res.json()

  if (store.pages.length <= 1) {
    store.loadJSON(json, true)
    return
  }

  const current = JSON.parse(JSON.stringify(store.toJSON()))
  if (current.width !== json.width || current.height !== json.height) {
    json.pages.forEach(
      (page: { width?: number; height?: number }) => {
        page.width = page.width || json.width
        page.height = page.height || json.height
      },
    )
  }

  forEveryChild({ children: json.pages }, (child: { id: string }) => {
    child.id = nanoid(10)
  })

  const activePage = store.activePage
  if (!activePage) {
    store.loadJSON(json, true)
    return
  }

  const activeIndex = store.pages.indexOf(activePage)
  current.pages.splice(activeIndex, 1, ...json.pages)
  store.loadJSON(current, true)
}
