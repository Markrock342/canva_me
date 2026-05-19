import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import type { StoreType } from 'polotno/model/store'
import { buildShareUrl, encodeSharePayload } from '../lib/shareLink'

type ExportPreset = {
  id: string
  label: string
  hint: string
  pixelRatio: number
  mimeType: 'image/png' | 'image/jpeg'
  quality?: number
}

const PRESETS: ExportPreset[] = [
  {
    id: 'png-1',
    label: 'PNG มาตรฐาน',
    hint: '1× — โพสต์เว็บ',
    pixelRatio: 1,
    mimeType: 'image/png',
  },
  {
    id: 'png-2',
    label: 'PNG HD',
    hint: '2× — คมชัด',
    pixelRatio: 2,
    mimeType: 'image/png',
  },
  {
    id: 'png-3',
    label: 'PNG 4K',
    hint: '3× — พิมพ์ / โฆษณา',
    pixelRatio: 3,
    mimeType: 'image/png',
  },
  {
    id: 'png-4',
    label: 'PNG Ultra',
    hint: '4× — ความละเอียดสูงสุด',
    pixelRatio: 4,
    mimeType: 'image/png',
  },
  {
    id: 'jpg-2',
    label: 'JPG HD',
    hint: '2× — ไฟล์เล็กลง',
    pixelRatio: 2,
    mimeType: 'image/jpeg',
    quality: 0.95,
  },
]

function sanitizeExportBase(name: string) {
  const t = name.trim().replace(/[^\p{L}\p{N}\s\-_.]+/gu, '').replace(/\s+/g, '-').slice(0, 72)
  return t || 'marc-canva'
}

function stamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(',')
  const mime = head.match(/data:([^;]+)/)?.[1] ?? 'image/png'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

async function saveWithPickerOrDownload(blob: Blob, suggestedName: string, mimeType: string): Promise<void> {
  const w = window as Window & { showSaveFilePicker?: (opts: {
    suggestedName: string
    types?: { description: string; accept: Record<string, string[]> }[]
  }) => Promise<FileSystemFileHandle> }
  const ext = mimeType.includes('jpeg') ? '.jpg' : '.png'
  const finalName =
    suggestedName.endsWith('.png') || suggestedName.endsWith('.jpg')
      ? suggestedName
      : `${suggestedName}${ext}`

  if (typeof w.showSaveFilePicker === 'function') {
    try {
      const handle = await w.showSaveFilePicker({
        suggestedName: finalName,
        types: [
          {
            description: mimeType.includes('jpeg') ? 'JPEG' : 'PNG',
            accept: mimeType.includes('jpeg')
              ? { 'image/jpeg': ['.jpg', '.jpeg'] }
              : { 'image/png': ['.png'] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  downloadBlob(blob, finalName)
}

export const HdExportBar = observer(
  ({ store, exportBaseName = 'งาน' }: { store: StoreType; exportBaseName?: string }) => {
    const [open, setOpen] = useState(false)
    const [busy, setBusy] = useState(false)
    const [toast, setToast] = useState<string | null>(null)
    const [baseInput, setBaseInput] = useState(() => sanitizeExportBase(exportBaseName))
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      setBaseInput(sanitizeExportBase(exportBaseName))
    }, [exportBaseName])

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

    useEffect(() => {
      if (!toast) return
      const t = window.setTimeout(() => setToast(null), 4200)
      return () => window.clearTimeout(t)
    }, [toast])

    const page = store.activePage
    const w = page ? Math.round(page.computedWidth) : store.width
    const h = page ? Math.round(page.computedHeight) : store.height
    const slug = sanitizeExportBase(baseInput)

    async function exportPreset(preset: ExportPreset) {
      setBusy(true)
      setOpen(false)
      try {
        const ext = preset.mimeType === 'image/jpeg' ? 'jpg' : 'png'
        const fileStem = `${slug}-${w}x${h}-${preset.id}-${stamp()}`
        const dataUrl = await store.toDataURL({
          pixelRatio: preset.pixelRatio,
          mimeType: preset.mimeType,
          quality: preset.quality,
          dpi: 300,
          dpiMetadata: 'auto',
        })
        const blob = dataUrlToBlob(dataUrl)
        await saveWithPickerOrDownload(blob, `${fileStem}.${ext}`, preset.mimeType)
      } finally {
        setBusy(false)
      }
    }

    async function exportPdf() {
      setBusy(true)
      setOpen(false)
      try {
        const fileStem = `${slug}-${w}x${h}-pdf-${stamp()}`
        await store.saveAsPDF({
          fileName: `${fileStem}.pdf`,
          pixelRatio: 2,
        })
      } finally {
        setBusy(false)
      }
    }

    function exportJsonFile() {
      const raw = JSON.stringify(store.toJSON(), null, 2)
      const blob = new Blob([raw], { type: 'application/json;charset=utf-8' })
      downloadBlob(blob, `${slug}-design-${stamp()}.json`)
      setToast('ดาวน์โหลด JSON แล้ว — ส่งไฟล์นี้ให้ผู้อื่นได้')
    }

    async function copyShareLink() {
      const enc = encodeSharePayload(store.toJSON())
      if (!enc.ok) {
        setToast(enc.reason)
        return
      }
      const url = buildShareUrl(enc.payload)
      try {
        await navigator.clipboard.writeText(url)
        setToast('คัดลอกลิงก์แชร์แล้ว (โหมดอ่านอย่างเดียว)')
        if (navigator.share) {
          try {
            await navigator.share({ title: 'marc-canva', text: 'ดูดีไซน์', url })
          } catch {
            /* user cancelled */
          }
        }
      } catch {
        setToast('คัดลอกไม่ได้ — ลอง Export JSON แทน')
      }
    }

    return (
      <div className="hd-export-bar">
        <label className="hd-export-bar__name">
          <span className="hd-export-bar__name-label">ชื่อไฟล์</span>
          <input
            type="text"
            className="hd-export-bar__name-input"
            value={baseInput}
            onChange={(e) => setBaseInput(e.target.value.slice(0, 80))}
            maxLength={72}
            aria-label="คำนำหน้าชื่อไฟล์ export"
          />
        </label>

        <span className="hd-export-bar__size">
          {w} × {h} px
        </span>

        <button type="button" className="hd-export-bar__linkish" onClick={copyShareLink} disabled={busy}>
          คัดลอกลิงก์แชร์
        </button>
        <button type="button" className="hd-export-bar__linkish" onClick={exportJsonFile} disabled={busy}>
          Export JSON
        </button>

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

        {toast ? (
          <p className="hd-export-bar__toast" role="status">
            {toast}
          </p>
        ) : null}
      </div>
    )
  },
)
