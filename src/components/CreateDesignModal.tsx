import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import type { StoreType } from 'polotno/model/store'
import { CategoryIcon } from './CategoryIcon'
import { DESIGN_GROUPS, getDesignGroup, type DesignFormat } from '../data/designHub'
import { NavIcon } from './NavIcon'
import { prepareBlankCanvas, prepareCanvasFromTemplate } from '../lib/canvasSession'
import { TemplateCardGrid, type TemplateItem } from './TemplateCardGrid'

type Props = {
  store: StoreType
  open: boolean
  initialGroupId?: string
  onClose: () => void
  onOpenEditor: (meta: { title: string; width: number; height: number; preview?: string }) => void
}

export function CreateDesignModal({
  store,
  open,
  initialGroupId = 'for-you',
  onClose,
  onOpenEditor,
}: Props) {
  const [groupId, setGroupId] = useState(initialGroupId)
  const [search, setSearch] = useState('')
  const [formatId, setFormatId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setGroupId(initialGroupId)
      setSearch('')
      setFormatId(null)
    }
  }, [open, initialGroupId])

  const group = getDesignGroup(groupId)
  const activeFormat: DesignFormat | null =
    group.formats?.find((f) => f.id === formatId) ?? null

  const templateQuery = useMemo(() => {
    const parts = [activeFormat?.query ?? group.query, search].filter(Boolean)
    return parts.join(' ').trim()
  }, [activeFormat, group.query, search])

  const sizeQuery = activeFormat
    ? `size=${activeFormat.width}x${activeFormat.height}`
    : 'size=all'

  if (!open) return null

  const openBlank = (width: number, height: number, title: string) => {
    prepareBlankCanvas(store, width, height)
    onOpenEditor({ title, width, height })
  }

  const openTemplate = async (item: TemplateItem) => {
    const w = activeFormat?.width ?? store.width
    const h = activeFormat?.height ?? store.height
    await prepareCanvasFromTemplate(store, item, w, h)
    onOpenEditor({
      title: group.label,
      width: w,
      height: h,
      preview: item.preview,
    })
  }

  return (
    <div className="create-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="create-modal"
        role="dialog"
        aria-labelledby="create-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="create-modal__header">
          <h2 id="create-modal-title">สร้างดีไซน์</h2>
          <div className="create-modal__search-wrap">
            <NavIcon id="search" size={18} className="create-modal__search-icon" />
            <input
              type="search"
              className="create-modal__search"
              placeholder="คุณต้องการสร้างอะไร"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="create-modal__close" onClick={onClose} aria-label="ปิด">
            <NavIcon id="close" size={20} />
          </button>
        </header>

        <div className="create-modal__body">
          <nav className="create-modal__nav">
            {DESIGN_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`create-modal__nav-item${g.id === groupId ? ' create-modal__nav-item--active' : ''}`}
                onClick={() => {
                  setGroupId(g.id)
                  setFormatId(null)
                }}
              >
                <span
                  className="create-modal__nav-icon"
                  style={{ background: `${g.color}18`, color: g.color }}
                >
                  <CategoryIcon id={g.iconId} size={18} strokeWidth={2} />
                </span>
                <span>{g.label}</span>
              </button>
            ))}
            <div className="create-modal__nav-divider" />
            <button
              type="button"
              className="create-modal__nav-item"
              onClick={() => openBlank(1080, 1080, 'กำหนดขนาดเอง')}
            >
              <span className="create-modal__nav-icon create-modal__nav-icon--muted">
                <CategoryIcon id="custom" size={18} strokeWidth={2} />
              </span>
              <span>กำหนดขนาดเอง</span>
            </button>
          </nav>

          <div className="create-modal__main">
            {group.formats && group.formats.length > 0 && (
              <section className="create-modal__formats">
                <h3>ขนาดยอดนิยม</h3>
                <div className="create-modal__format-row">
                  {group.formats.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`format-chip${formatId === f.id ? ' format-chip--active' : ''}`}
                      onClick={() => setFormatId(f.id === formatId ? null : f.id)}
                    >
                      <strong>{f.label}</strong>
                      <span>
                        {f.width} × {f.height}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="format-chip format-chip--blank"
                    onClick={() => {
                      const f = activeFormat ?? group.formats![0]
                      openBlank(f.width, f.height, f.label)
                    }}
                  >
                    <strong>เริ่มจากว่าง</strong>
                    <span>ไม่ใช้เทมเพลต</span>
                  </button>
                </div>
              </section>
            )}

            <section className="create-modal__templates">
              <h3>
                {activeFormat ? `เทมเพลต ${activeFormat.label}` : `เทมเพลต ${group.label}`}
              </h3>
              <TemplateCardGrid
                key={`${groupId}-${formatId}`}
                query={templateQuery}
                sizeQuery={sizeQuery}
                layout="grid"
                prefetchPages={8}
                onSelect={openTemplate}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
