import { useEffect, useRef } from 'react'
import { onSnapshot } from 'mobx-state-tree'
import type { StoreType } from 'polotno/model/store'
import { saveEditorDraft } from '../lib/editorDraft'

const DEBOUNCE_MS = 1600

/** บันทึกร่างลง localStorage หลังแก้ store (กันรีเฟรช / แท็บค้าง) */
export function useEditorAutosave(store: StoreType, title: string, enabled: boolean) {
  const titleRef = useRef(title)
  titleRef.current = title
  const timerRef = useRef<number>()

  useEffect(() => {
    if (!enabled) return

    const flush = () => {
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        try {
          saveEditorDraft(JSON.stringify(store.toJSON()), titleRef.current)
        } catch {
          /* ignore */
        }
      }, DEBOUNCE_MS)
    }

    flush()
    const disposer = onSnapshot(store, flush)
    return () => {
      window.clearTimeout(timerRef.current)
      disposer()
    }
  }, [store, enabled])
}
