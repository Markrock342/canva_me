import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { ROLES } from 'polotno/model/store'
import { store, polotnoKey } from './store'
import { applyThaiTranslations } from './i18n-th'
import { configurePolotnoTemplateListPerPage } from './lib/polotnoTemplateList'
import { clearEditorDraft } from './lib/editorDraft'
import { decodeSharePayload } from './lib/shareLink'
import { setupPolotnoDefaults } from './setup-polotno'
import { HomePage } from './components/HomePage'
import { captureStoreThumbnail } from './lib/canvasSession'
import { saveRecentDesign } from './lib/recentDesigns'
import 'polotno/polotno.blueprint.css'
import './index.css'
import './home.css'

const StudioEditor = lazy(async () => {
  const m = await import('./components/StudioEditor')
  return { default: m.StudioEditor }
})

const ShareViewer = lazy(async () => {
  const m = await import('./components/ShareViewer')
  return { default: m.ShareViewer }
})

type Screen = 'home' | 'editor' | 'viewer'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [exportTitle, setExportTitle] = useState('งานใหม่')
  const [shareError, setShareError] = useState<string | null>(null)

  useLayoutEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#share=')) return
    const sessionKey = `marc-canva-share-done:${hash.length}:${hash.slice(7, 120)}`
    if (sessionStorage.getItem(sessionKey)) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      return
    }
    const data = decodeSharePayload(hash.slice(7))
    if (data) {
      sessionStorage.setItem(sessionKey, '1')
      store.loadJSON(data as never, true)
      store.setRole(ROLES.VIEWER)
      setScreen('viewer')
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    } else {
      setShareError('ลิงก์แชร์ไม่ถูกต้องหรือข้อมูลเสียหาย')
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }, [])

  useEffect(() => {
    configurePolotnoTemplateListPerPage()
    applyThaiTranslations()
    setupPolotnoDefaults()
  }, [])

  const openEditor = useCallback(
    (meta: { title: string; width: number; height: number; preview?: string }) => {
      store.setRole(ROLES.ADMIN)
      saveRecentDesign({
        title: meta.title,
        width: meta.width,
        height: meta.height,
        preview: meta.preview,
        json: JSON.stringify(store.toJSON()),
      })
      setExportTitle(meta.title)
      setScreen('editor')
    },
    [],
  )

  const goHomeFromEditor = useCallback(async () => {
    const preview = await captureStoreThumbnail(store)
    saveRecentDesign({
      title: exportTitle,
      width: store.width,
      height: store.height,
      preview,
      json: JSON.stringify(store.toJSON()),
    })
    clearEditorDraft()
    setScreen('home')
  }, [exportTitle])

  const exitViewer = useCallback(() => {
    store.clear()
    store.addPage()
    store.setSize(1080, 1080)
    store.setRole(ROLES.ADMIN)
    setScreen('home')
  }, [])

  const editShareAsMine = useCallback(() => {
    store.setRole(ROLES.ADMIN)
    setExportTitle('สำเนาจากลิงก์')
    setScreen('editor')
  }, [])

  return (
    <div className="app">
      {!polotnoKey && (
        <aside className="api-banner" role="status">
          ใส่ <code>VITE_POLOTNO_KEY</code> ในไฟล์ <code>.env</code> — รับ key ฟรีที่{' '}
          <a href="https://polotno.com/cabinet/" target="_blank" rel="noopener noreferrer">
            polotno.com/cabinet
          </a>
        </aside>
      )}
      {shareError ? (
        <aside className="api-banner api-banner--error" role="alert">
          {shareError}
          <button type="button" className="api-banner__dismiss" onClick={() => setShareError(null)}>
            ปิด
          </button>
        </aside>
      ) : null}
      {screen === 'home' ? (
        <HomePage store={store} onOpenEditor={openEditor} />
      ) : null}
      {screen === 'editor' ? (
        <Suspense fallback={<div className="studio-suspense">กำลังโหลดสตูดิโอ…</div>}>
          <StudioEditor store={store} onHome={goHomeFromEditor} exportBaseName={exportTitle} />
        </Suspense>
      ) : null}
      {screen === 'viewer' ? (
        <Suspense fallback={<div className="studio-suspense">กำลังเปิดมุมมองแชร์…</div>}>
          <ShareViewer store={store} onHome={exitViewer} onEditAsMine={editShareAsMine} />
        </Suspense>
      ) : null}
    </div>
  )
}
