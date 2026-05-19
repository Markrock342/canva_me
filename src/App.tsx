import { useCallback, useEffect, useState } from 'react'
import { store, polotnoKey } from './store'
import { applyThaiTranslations } from './i18n-th'
import { configurePolotnoTemplateListPerPage } from './lib/polotnoTemplateList'
import { setupPolotnoDefaults } from './setup-polotno'
import { StudioEditor } from './components/StudioEditor'
import { HomePage } from './components/HomePage'
import { saveRecentDesign } from './lib/recentDesigns'
import 'polotno/polotno.blueprint.css'
import './index.css'
import './home.css'

type Screen = 'home' | 'editor'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')

  useEffect(() => {
    configurePolotnoTemplateListPerPage()
    applyThaiTranslations()
    setupPolotnoDefaults()
  }, [])

  const openEditor = useCallback(
    (meta: { title: string; width: number; height: number; preview?: string }) => {
      saveRecentDesign({
        title: meta.title,
        width: meta.width,
        height: meta.height,
        preview: meta.preview,
        json: JSON.stringify(store.toJSON()),
      })
      setScreen('editor')
    },
    [],
  )

  const goHome = useCallback(() => {
    saveRecentDesign({
      title: 'งานล่าสุด',
      width: store.width,
      height: store.height,
      json: JSON.stringify(store.toJSON()),
    })
    setScreen('home')
  }, [])

  return (
    <div className="app">
      {!polotnoKey && (
        <aside className="api-banner" role="status">
          ใส่ <code>VITE_POLOTNO_KEY</code> ในไฟล์ <code>.env</code> — รับ key ฟรีที่{' '}
          <a href="https://polotno.com/cabinet/" target="_blank" rel="noreferrer">
            polotno.com/cabinet
          </a>
        </aside>
      )}
      {screen === 'home' ? (
        <HomePage store={store} onOpenEditor={openEditor} />
      ) : (
        <StudioEditor store={store} onHome={goHome} />
      )}
    </div>
  )
}
