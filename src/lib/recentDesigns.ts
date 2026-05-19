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

function writeRecentList(merged: RecentDesign[]): boolean {
  let list = merged
  while (list.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      cachedRaw = undefined
      notifyRecentDesignsUpdated()
      return true
    } catch {
      const stripped = list.map((d, i) =>
        i >= list.length - 2 ? { ...d, preview: undefined } : d,
      )
      list = stripped.slice(0, -1)
    }
  }
  return false
}

export function saveRecentDesign(entry: Omit<RecentDesign, 'id' | 'updatedAt'> & { id?: string }) {
  const list = loadRecentDesigns()
  const id = entry.id ?? crypto.randomUUID()
  const next: RecentDesign = {
    id,
    title: entry.title,
    width: Math.max(1, Math.round(entry.width)),
    height: Math.max(1, Math.round(entry.height)),
    preview: entry.preview,
    updatedAt: Date.now(),
    json: entry.json,
  }
  const filtered = list.filter((d) => d.id !== id)
  const merged = [next, ...filtered].slice(0, MAX_ITEMS)
  writeRecentList(merged)
  return next
}

export function removeRecentDesign(id: string) {
  const list = loadRecentDesigns().filter((d) => d.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
  cachedRaw = undefined
  notifyRecentDesignsUpdated()
}
