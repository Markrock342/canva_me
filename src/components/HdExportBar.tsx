import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import type { StoreType } from 'polotno/model/store'

type ExportPreset = {
  label: string
  hint: string
  pixelRatio: number
  mimeType: 'image/png' | 'image/jpeg'
  quality?: number
}

const PRESETS: ExportPreset[] = [
  {
    label: 'PNG มาตรฐาน',
    hint: '1× — โพสต์เว็บ',
    pixelRatio: 1,
    mimeType: 'image/png',
  },
  {
    label: 'PNG HD',
    hint: '2× — คมชัด',
    pixelRatio: 2,
    mimeType: 'image/png',
  },
  {
    label: 'PNG 4K',
    hint: '3× — พิมพ์ / โฆษณา',
    pixelRatio: 3,
    mimeType: 'image/png',
  },
  {
    label: 'PNG Ultra',
    hint: '4× — ความละเอียดสูงสุด',
    pixelRatio: 4,
    mimeType: 'image/png',
  },
  {
    label: 'JPG HD',
    hint: '2× — ไฟล์เล็กลง',
    pixelRatio: 2,
    mimeType: 'image/jpeg',
    quality: 0.95,
  },
]

function fileName(ext: string) {
  return `marc-canva-${Date.now()}.${ext}`
}

export const HdExportBar = observer(({ store }: { store: StoreType }) => {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const page = store.activePage
  const w = page ? Math.round(page.computedWidth) : store.width
  const h = page ? Math.round(page.computedHeight) : store.height

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  async function exportPreset(preset: ExportPreset) {
    setBusy(true)
    setOpen(false)
    try {
      const ext = preset.mimeType === 'image/jpeg' ? 'jpg' : 'png'
      await store.saveAsImage({
        fileName: fileName(ext),
        pixelRatio: preset.pixelRatio,
        mimeType: preset.mimeType,
        quality: preset.quality,
        dpi: 300,
        dpiMetadata: 'auto',
      })
    } finally {
      setBusy(false)
    }
  }

  async function exportPdf() {
    setBusy(true)
    setOpen(false)
    try {
      await store.saveAsPDF({
        fileName: fileName('pdf'),
        pixelRatio: 2,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="hd-export-bar">
      <span className="hd-export-bar__size">
        {w} × {h} px
      </span>

      <div className="hd-export-bar__dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="hd-export-bar__trigger"
          disabled={busy}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {busy ? 'กำลัง export…' : 'Export HD'}
          <span className="hd-export-bar__chevron" aria-hidden>
            ▾
          </span>
        </button>

        {open && (
          <menu className="hd-export-bar__menu">
            {PRESETS.map((preset) => (
              <li key={preset.label}>
                <button
                  type="button"
                  className="hd-export-bar__item"
                  onClick={() => exportPreset(preset)}
                >
                  <strong>{preset.label}</strong>
                  <span>
                    {preset.hint} → ~{w * preset.pixelRatio}×{h * preset.pixelRatio}
                  </span>
                </button>
              </li>
            ))}
            <li className="hd-export-bar__divider" />
            <li>
              <button type="button" className="hd-export-bar__item" onClick={exportPdf}>
                <strong>PDF (ทุกหน้า)</strong>
                <span>2× · 300 DPI</span>
              </button>
            </li>
          </menu>
        )}
      </div>
    </div>
  )
})
