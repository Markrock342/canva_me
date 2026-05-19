const DRAFT_KEY = 'marc-canva-editor-draft'
const DRAFT_EVENT = 'marc-canva-draft-updated'

export type EditorDraft = {
  updatedAt: number
  title: string
  json: string
}

function notify() {
  window.dispatchEvent(new Event(DRAFT_EVENT))
}

export function hasEditorDraft(): boolean {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return false
    const d = JSON.parse(raw) as EditorDraft
    return Boolean(d?.json && typeof d.json === 'string')
  } catch {
    return false
  }
}

export function getEditorDraft(): EditorDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as EditorDraft
    if (!d?.json || typeof d.json !== 'string') return null
    return d
  } catch {
    return null
  }
}

/** บันทึกร่างอัตโนมัติ (ข้อความ JSON เต็มจาก store.toJSON) */
export function saveEditorDraft(json: string, title: string) {
  const payload: EditorDraft = {
    updatedAt: Date.now(),
    title: title.slice(0, 120),
    json,
  }
  const raw = JSON.stringify(payload)
  try {
    localStorage.setItem(DRAFT_KEY, raw)
    notify()
    return
  } catch {
    try {
      localStorage.removeItem(DRAFT_KEY)
      localStorage.setItem(DRAFT_KEY, raw)
      notify()
    } catch {
      /* quota เต็มหรือโหมดส่วนตัว — ข้ามการบันทึกร่าง */
    }
  }
}

export function clearEditorDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* ignore */
  }
  notify()
}

export function subscribeEditorDraft(cb: () => void) {
  window.addEventListener(DRAFT_EVENT, cb)
  return () => window.removeEventListener(DRAFT_EVENT, cb)
}
