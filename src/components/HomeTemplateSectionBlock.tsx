import { useEffect, useRef, useState } from 'react'
import { TemplateCardGrid, type TemplateItem } from './TemplateCardGrid'
import type { HomeTemplateSection } from '../data/homeTemplateSections'

type Props = {
  section: HomeTemplateSection
  heroSearch: string
  onSelect: (item: TemplateItem) => void
  onSeeAll?: () => void
  /** โหลดทันทีไม่รอ scroll */
  eager?: boolean
}

export function HomeTemplateSectionBlock({
  section,
  heroSearch,
  onSelect,
  onSeeAll,
  eager = false,
}: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(eager)

  useEffect(() => {
    if (eager || visible) return
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { root: null, rootMargin: '280px 0px', threshold: 0.01 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [eager, visible])

  const query =
    section.id === 'trending' && heroSearch.trim() ? heroSearch.trim() : section.query

  return (
    <section ref={rootRef} className="home-section">
      <div className="home-section__head">
        <h2>{section.title}</h2>
        {section.modalGroupId && onSeeAll && (
          <button type="button" className="home-section__link" onClick={onSeeAll}>
            ดูทั้งหมด
          </button>
        )}
      </div>
      {visible ? (
        <TemplateCardGrid
          query={query}
          sizeQuery={section.sizeQuery}
          layout="horizontal"
          maxItems={section.maxItems}
          prefetchPages={section.prefetchPages}
          onSelect={onSelect}
        />
      ) : (
        <div className="home-template-lazy-placeholder" aria-hidden />
      )}
    </section>
  )
}
