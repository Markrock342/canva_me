import { useState, useSyncExternalStore, type CSSProperties } from 'react'
import type { StoreType } from 'polotno/model/store'
import { CategoryIcon } from './CategoryIcon'
import { HOME_QUICK_CATEGORIES } from '../data/designHub'
import { HOME_TEMPLATE_SECTIONS } from '../data/homeTemplateSections'
import { NavIcon } from './NavIcon'
import {
  EMPTY_RECENT_DESIGNS,
  getRecentDesignsSnapshot,
  subscribeRecentDesigns,
  type RecentDesign,
} from '../lib/recentDesigns'
import { CreateDesignModal } from './CreateDesignModal'
import type { TemplateItem } from './TemplateCardGrid'
import { HomeTemplateSectionBlock } from './HomeTemplateSectionBlock'
import { prepareBlankCanvas, prepareCanvasFromTemplate } from '../lib/canvasSession'

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
  const recent = useSyncExternalStore(
    subscribeRecentDesigns,
    getRecentDesignsSnapshot,
    () => EMPTY_RECENT_DESIGNS,
  )

  const openModal = (groupId = 'for-you') => {
    setModalGroup(groupId)
    setModalOpen(true)
  }

  const openRecent = (item: RecentDesign) => {
    store.clear()
    store.loadJSON(JSON.parse(item.json), true)
    onOpenEditor({
      title: item.title,
      width: item.width,
      height: item.height,
      preview: item.preview,
    })
  }

  const quickBlank = (width: number, height: number, title: string) => {
    prepareBlankCanvas(store, width, height)
    onOpenEditor({ title, width, height })
  }

  const quickTemplate = async (item: TemplateItem) => {
    await prepareCanvasFromTemplate(store, item, 1080, 1080)
    onOpenEditor({ title: 'เทมเพลต', width: 1080, height: 1080, preview: item.preview })
  }

  return (
    <div className="home">
      <aside className="home-sidebar">
        <div className="home-sidebar__brand">
          <span className="studio-brand__mark" aria-hidden />
          <span className="home-sidebar__name">marc-canva</span>
        </div>
        <nav className="home-sidebar__nav">
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
        <section className="home-hero">
          <h1>วันนี้คุณจะดีไซน์อะไร?</h1>
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
              <h2>ล่าสุด</h2>
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
                      <img src={item.preview} alt="" />
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
            heroSearch={heroSearch}
            eager={index < 3}
            onSelect={quickTemplate}
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
