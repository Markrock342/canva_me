import { useEffect, useMemo, useRef, useState } from 'react'
import { CuratedTemplateGrid } from './CuratedTemplateGrid'
import { UnsplashPhotoGrid } from './UnsplashPhotoGrid'
import {
  curatedFeaturedPicks,
  curatedFromCategories,
  HOME_SECTION_CURATED_CATEGORIES,
} from '../data/curatedTemplates'
import type { HomeTemplateSection } from '../data/homeTemplateSections'
import type { CatalogTemplateItem } from '../types/catalogTemplate'

type Props = {
  section: HomeTemplateSection
  sectionIndex: number
  seenKeys: Set<string>
  onSelect: (item: CatalogTemplateItem) => void
  onSeeAll?: () => void
  eager?: boolean
}

export function HomeTemplateSectionBlock({
  section,
  sectionIndex,
  seenKeys,
  onSelect,
  onSeeAll,
  eager = false,
}: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(eager)
  const source =
    section.templateSource ?? (section.curatedOnly ? 'curated' : 'catalog')

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

  const catalogItems = useMemo(() => {
    if (source === 'curated') return curatedFeaturedPicks(section.maxItems)
    if (source !== 'catalog') return []
    const cats = HOME_SECTION_CURATED_CATEGORIES[section.id] ?? ['ig', 'fb', 'youtube']
    return curatedFromCategories(cats, section.maxItems, sectionIndex * 3)
  }, [source, section.id, section.maxItems, sectionIndex])

  const grid = (() => {
    if (source === 'curated' || source === 'catalog') {
      return (
        <CuratedTemplateGrid
          items={catalogItems}
          maxItems={section.maxItems}
          seenKeys={seenKeys}
          onSelect={onSelect}
        />
      )
    }
    if (source === 'unsplash') {
      return (
        <UnsplashPhotoGrid
          query={section.unsplashQuery ?? 'design creative'}
          maxItems={section.maxItems}
          seenKeys={seenKeys}
          onSelect={onSelect}
        />
      )
    }
    return null
  })()

  return (
    <section
      ref={rootRef}
      id={section.id === 'trending' ? 'home-trending' : undefined}
      className="home-section"
    >
      <div className="home-section__head">
        <h2>{section.title}</h2>
        {section.modalGroupId && onSeeAll && (
          <button type="button" className="home-section__link" onClick={onSeeAll}>
            ดูทั้งหมด
          </button>
        )}
      </div>
      {visible ? grid : <div className="home-template-lazy-placeholder" aria-hidden />}
    </section>
  )
}
