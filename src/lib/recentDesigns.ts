const STORAGE_KEY = 'marc-canva-recent'
const MAX_ITEMS = 16

export type RecentDesign = {
  id: string
  title: string
  width: number
  height: number
  preview?: string
  updatedAt: number
  json: string
}

export function loadRecentDesigns(): RecentDesign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as RecentDesign[]
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const RECENT_UPDATED_EVENT = 'marc-canva-recent-updated'

/** Stable empty list for useSyncExternalStore getServerSnapshot */
export const EMPTY_RECENT_DESIGNS: RecentDesign[] = []

let cachedSnapshot: RecentDesign[] = EMPTY_RECENT_DESIGNS
let cachedRaw: string | undefined

/** Stable snapshot for useSyncExternalStore — same reference until localStorage changes. */
export function getRecentDesignsSnapshot(): RecentDesign[] {
  const raw = localStorage.getItem(STORAGE_KEY) ?? ''
  if (raw === cachedRaw) return cachedSnapshot
  cachedRaw = raw
  const list = loadRecentDesigns()
  cachedSnapshot = list.length === 0 ? EMPTY_RECENT_DESIGNS : list
  return cachedSnapshot
}

export function subscribeRecentDesigns(onStoreChange: () => void) {
  const onUpdate = () => {
    cachedRaw = undefined
    onStoreChange()
  }
  window.addEventListener(RECENT_UPDATED_EVENT, onUpdate)
  return () => window.removeEventListener(RECENT_UPDATED_EVENT, onUpdate)
}

export function notifyRecentDesignsUpdated() {
  window.dispatchEvent(new Event(RECENT_UPDATED_EVENT))
}

export function saveRecentDesign(entry: Omit<RecentDesign, 'id' | 'updatedAt'> & { id?: string }) {
  const list = loadRecentDesigns()
  const id = entry.id ?? crypto.randomUUID()
  const next: RecentDesign = {
    id,
    title: entry.title,
    width: entry.width,
    height: entry.height,
    preview: entry.preview,
    updatedAt: Date.now(),
    json: entry.json,
  }
  const filtered = list.filter((d) => d.id !== id)
  const merged = [next, ...filtered].slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  cachedRaw = undefined
  notifyRecentDesignsUpdated()
  return next
}

export function removeRecentDesign(id: string) {
  const list = loadRecentDesigns().filter((d) => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  cachedRaw = undefined
  notifyRecentDesignsUpdated()
}
