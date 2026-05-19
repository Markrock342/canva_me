import { useMemo, useRef, useState, useSyncExternalStore, type ChangeEvent, type CSSProperties } from 'react'
import type { StoreType } from 'polotno/model/store'
import { ROLES } from 'polotno/model/store'
import { CategoryIcon } from './CategoryIcon'
import { HOME_QUICK_CATEGORIES } from '../data/designHub'
import { HOME_TEMPLATE_SECTIONS } from '../data/homeTemplateSections'
import { TEMPLATE_TOTAL_COUNT } from '../data/curatedTemplates'
import { NavIcon } from './NavIcon'
import {
  EMPTY_RECENT_DESIGNS,
  getRecentDesignsSnapshot,
  subscribeRecentDesigns,
  type RecentDesign,
} from '../lib/recentDesigns'
import { CreateDesignModal } from './CreateDesignModal'
import { HomeTemplateSectionBlock } from './HomeTemplateSectionBlock'
import { BrandLogo } from './BrandLogo'
import { prepareBlankCanvas } from '../lib/canvasSession'
import { openCatalogTemplate } from '../lib/openCatalogTemplate'
import type { CatalogTemplateItem } from '../types/catalogTemplate'
import { clearEditorDraft, getEditorDraft, hasEditorDraft, subscribeEditorDraft } from '../lib/editorDraft'

type Props = {
  store: StoreType
  onOpenEditor: (meta: { title: string; width: number; height: number; preview?: string }) => void
}

function formatAgo(ts: number) {
  const diff = Date.now() - ts
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'เมื่อสักครู่'
  if (h < 24) return `${h} ชม. ที่แล้ว`
  const d = Math.floor(h / 24)
  return `${d} วันที่แล้ว`
}

export function HomePage({ store, onOpenEditor }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalGroup, setModalGroup] = useState('for-you')
  const [heroSearch, setHeroSearch] = useState('')
  const [homeLoadError, setHomeLoadError] = useState<string | null>(null)
  const seenTemplateKeys = useRef(new Set<string>()).current
  const recent = useSyncExternalStore(
    subscribeRecentDesigns,
    getRecentDesignsSnapshot,
    () => EMPTY_RECENT_DESIGNS,
  )
  const draftVisible = useSyncExternalStore(
    subscribeEditorDraft,
    () => hasEditorDraft(),
    () => false,
  )
  const importRef = useRef<HTMLInputElement>(null)
  const recentCount = recent.length
  const quickSummary = useMemo(
    () => [
      { label: 'ล่าสุด', value: recentCount.toString() },
      { label: 'เทมเพลตในระบบ', value: TEMPLATE_TOTAL_COUNT.toString() },
      { label: 'หมวดด่วน', value: HOME_QUICK_CATEGORIES.length.toString() },
    ],
    [recentCount],
  )

  const openModal = (groupId = 'for-you') => {
    setModalGroup(groupId)
    setModalOpen(true)
  }

  const openRecent = (item: RecentDesign) => {
    try {
      const data = JSON.parse(item.json) as unknown
      if (
        !data ||
        typeof data !== 'object' ||
        !Array.isArray((data as { pages?: unknown }).pages)
      ) {
        throw new Error('invalid')
      }
      store.clear()
      store.loadJSON(data as never, true)
      store.setRole(ROLES.ADMIN)
      setHomeLoadError(null)
      onOpenEditor({
        title: item.title,
        width: item.width,
        height: item.height,
        preview: item.preview,
      })
    } catch {
      setHomeLoadError('เปิดงานล่าสุดไม่ได้ — ข้อมูลในเครื่องอาจเสียหายหรือไม่สมบูรณ์')
    }
  }

  const resumeDraft = () => {
    const d = getEditorDraft()
    if (!d) return
    try {
      const data = JSON.parse(d.json) as unknown
      if (!data || typeof data !== 'object' || !Array.isArray((data as { pages?: unknown }).pages)) {
        throw new Error('invalid')
      }
      store.clear()
      store.loadJSON(data as never, true)
      store.setRole(ROLES.ADMIN)
      setHomeLoadError(null)
      onOpenEditor({
        title: d.title || 'งานบันทึกอัตโนมัติ',
        width: store.width,
        height: store.height,
      })
    } catch {
      clearEditorDraft()
      setHomeLoadError('กู้คืนร่างไม่สำเร็จ')
    }
  }

  const onImportJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setHomeLoadError(null)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as unknown
      if (!data || typeof data !== 'object' || !Array.isArray((data as { pages?: unknown }).pages)) {
        throw new Error('invalid')
      }
      store.clear()
      store.loadJSON(data as never, true)
      store.setRole(ROLES.ADMIN)
      const w = (data as { width?: number }).width ?? store.width
      const h = (data as { height?: number }).height ?? store.height
      const base = file.name.replace(/\.json$/i, '') || 'นำเข้า'
      onOpenEditor({ title: base, width: w, height: h })
    } catch {
      setHomeLoadError('นำเข้า JSON ไม่สำเร็จ — ตรวจสอบว่าเป็นไฟล์ Polotno / marc-canva')
    }
  }

  const quickBlank = (width: number, height: number, title: string) => {
    prepareBlankCanvas(store, width, height)
    onOpenEditor({ title, width, height })
  }

  const quickCatalogTemplate = async (item: CatalogTemplateItem) => {
    setHomeLoadError(null)
    try {
      const meta = await openCatalogTemplate(store, item)
      onOpenEditor(meta)
    } catch (e) {
      setHomeLoadError(e instanceof Error ? e.message : 'โหลดเทมเพลตไม่สำเร็จ')
    }
  }

  return (
    <div className="home">
      <aside className="home-sidebar">
        <div className="home-sidebar__brand">
          <BrandLogo className="studio-brand__logo--sidebar" />
        </div>
        <nav className="home-sidebar__nav" aria-label="เมนูหลัก">
          <button type="button" className="home-sidebar__link home-sidebar__link--active">
            <NavIcon id="home" size={22} />
            หน้าหลัก
          </button>
          <button type="button" className="home-sidebar__link" onClick={() => openModal('for-you')}>
            <NavIcon id="templates" size={22} />
            เทมเพลต
          </button>
          <button type="button" className="home-sidebar__link" onClick={() => openModal('social')}>
            <NavIcon id="social" size={22} />
            โซเชียล
          </button>
        </nav>
      </aside>

      <main className="home-main">
        {homeLoadError ? (
          <div className="home-toast home-toast--error" role="alert">
            <p>{homeLoadError}</p>
            <button type="button" className="home-toast__dismiss" onClick={() => setHomeLoadError(null)}>
              ปิด
            </button>
          </div>
        ) : null}
        {draftVisible ? (
          <div className="home-draft-banner" role="status">
            <p>
              <strong>พบงานบันทึกอัตโนมัติ</strong> — เปิดต่อได้ถ้าปิดแท็บหรือรีเฟรชโดยไม่ตั้งใจ
            </p>
            <div className="home-draft-banner__actions">
              <button type="button" className="home-draft-banner__primary" onClick={resumeDraft}>
                เปิดต่อใน Studio
              </button>
              <button type="button" className="home-draft-banner__ghost" onClick={() => clearEditorDraft()}>
                ละทิ้งร่าง
              </button>
            </div>
          </div>
        ) : null}
        <section className="home-hero">
          <div className="home-hero__content">
            <p className="home-hero__eyebrow">ออกแบบเร็วขึ้น เริ่มจากเทมเพลตที่ใช่</p>
            <h1>วันนี้คุณจะดีไซน์อะไร?</h1>
            <p className="home-hero__subtitle">
              เลือกขนาดงาน เทมเพลต หรือเริ่มจากผืนผ้าใบเปล่าได้ในไม่กี่วินาที
            </p>
            <div className="home-hero__stats" aria-label="ข้อมูลสรุป">
              {quickSummary.map((item) => (
                <div key={item.label} className="home-hero__stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="home-hero__search">
            <NavIcon id="search" size={20} className="home-hero__search-icon" />
            <input
              type="search"
              placeholder="ค้นหาเทมเพลต IG, FB, โปสเตอร์, ใบปลิว…"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              onFocus={() => openModal('for-you')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openModal('for-you')
              }}
            />
            <button type="button" className="home-hero__import" onClick={() => importRef.current?.click()}>
              นำเข้า JSON
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="home-hero__import-input"
              aria-label="เลือกไฟล์ JSON นำเข้า"
              onChange={onImportJson}
            />
            <button type="button" className="home-hero__create" onClick={() => openModal('for-you')}>
              สร้างดีไซน์
            </button>
          </div>
        </section>

        <section className="home-quick">
          <div className="home-quick__row">
            {HOME_QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="home-quick__item"
                onClick={() => openModal(cat.id)}
              >
                <span
                  className="home-quick__icon"
                  style={
                    {
                      '--quick-bg': cat.color,
                      '--quick-fg': cat.iconColor,
                    } as CSSProperties
                  }
                >
                  <CategoryIcon id={cat.iconId} size={24} strokeWidth={1.75} />
                </span>
                <span>{cat.label}</span>
              </button>
            ))}
            <button
              type="button"
              className="home-quick__item"
              onClick={() => quickBlank(1080, 1080, 'กำหนดขนาดเอง')}
            >
              <span className="home-quick__icon home-quick__icon--muted">
                <CategoryIcon id="custom" size={24} strokeWidth={1.75} />
              </span>
              <span>กำหนดขนาดเอง</span>
            </button>
          </div>
        </section>

        {recent.length > 0 && (
          <section className="home-section">
            <div className="home-section__head">
              <div>
                <p className="home-section__eyebrow">กลับไปทำต่อ</p>
                <h2>ล่าสุด</h2>
              </div>
              <span className="home-section__count">{recent.length} งาน</span>
            </div>
            <div className="home-recent">
              {recent.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="home-recent__card"
                  onClick={() => openRecent(item)}
                >
                  <div className="home-recent__thumb">
                    {item.preview ? (
                      <img
                        src={item.preview}
                        alt={`ตัวอย่าง ${item.title}`}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="home-recent__placeholder">
                        {item.width}×{item.height}
                      </span>
                    )}
                  </div>
                  <div className="home-recent__meta">
                    <strong>{item.title}</strong>
                    <span>{formatAgo(item.updatedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {HOME_TEMPLATE_SECTIONS.map((sec, index) => (
          <HomeTemplateSectionBlock
            key={sec.id}
            section={sec}
            sectionIndex={index}
            seenKeys={seenTemplateKeys}
            eager={
              sec.id === 'trending' ||
              sec.id === 'curated-picks' ||
              sec.id === 'unsplash-inspire' ||
              index < 4
            }
            onSelect={quickCatalogTemplate}
            onSeeAll={sec.modalGroupId ? () => openModal(sec.modalGroupId!) : undefined}
          />
        ))}
      </main>

      <CreateDesignModal
        store={store}
        open={modalOpen}
        initialGroupId={modalGroup}
        onClose={() => setModalOpen(false)}
        onOpenEditor={(meta) => {
          setModalOpen(false)
          onOpenEditor(meta)
        }}
      />
    </div>
  )
}
