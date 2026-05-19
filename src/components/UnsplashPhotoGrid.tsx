import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { unsplashList } from 'polotno/utils/api'
import { useInfiniteAPI } from 'polotno/utils/use-api'
import type { CatalogTemplateItem } from '../types/catalogTemplate'
import { filterUnseenCatalogItems } from '../lib/homeTemplateDedup'

type UnsplashResult = {
  id: string
  width: number
  height: number
  urls?: { small?: string; regular?: string }
  alt_description?: string
  description?: string
}

type Props = {
  query?: string
  maxItems?: number
  seenKeys: Set<string>
  onSelect: (item: CatalogTemplateItem) => void
}

export const UnsplashPhotoGrid = observer(function UnsplashPhotoGrid({
  query = 'design creative',
  maxItems = 20,
  seenKeys,
  onSelect,
}: Props) {
  const { setQuery, loadMore, hasMore, data, isLoading, error } = useInfiniteAPI({
    defaultQuery: query,
    getAPI: ({ page, query: q }) => unsplashList({ page, query: q }),
    getSize: (res) => {
      const r = res as { total_pages?: number }
      const n = Number(r.total_pages)
      return Number.isFinite(n) && n >= 1 ? n : 1
    },
  })

  const skipMount = useRef(true)
  useEffect(() => {
    if (skipMount.current) {
      skipMount.current = false
      return
    }
    setQuery(query)
  }, [query, setQuery])

  const photos = (data?.flatMap((page) => (page as { results?: UnsplashResult[] }).results ?? []) ??
    []) as UnsplashResult[]

  const catalogItems: CatalogTemplateItem[] = photos.map((photo) => ({
    provider: 'unsplash',
    providerLabel: 'Unsplash',
    preview: photo.urls?.small ?? photo.urls?.regular ?? '',
    unsplashId: photo.id,
    width: 1080,
    height: 1080,
    title: photo.alt_description ?? photo.description ?? 'รูป Unsplash',
  }))

  const visible = filterUnseenCatalogItems(catalogItems, seenKeys, maxItems)

  useEffect(() => {
    if (error || isLoading) return
    if (!hasMore) return
    if (visible.length >= Math.min(maxItems, 8)) return
    loadMore()
  }, [visible.length, maxItems, hasMore, isLoading, loadMore, error])

  if (error) {
    return (
      <p className="template-grid__message">
        โหลดรูป Unsplash ไม่สำเร็จ — ตรวจสอบ API key
      </p>
    )
  }

  if (!isLoading && visible.length === 0) {
    return <p className="template-grid__message">กำลังหารูปจาก Unsplash…</p>
  }

  return (
    <div className="template-grid template-grid--horizontal">
      {visible.map((item) => (
        <button
          key={item.unsplashId}
          type="button"
          className="template-card template-card--unsplash"
          aria-label={item.title}
          onClick={() => onSelect(item)}
        >
          <img src={item.preview} alt="" loading="lazy" decoding="async" width={300} height={200} />
          <span className="template-card__provider">Unsplash</span>
        </button>
      ))}
      {isLoading &&
        Array.from({ length: 6 }).map((_, i) => (
          <div key={`usk-${i}`} className="template-card template-card--skeleton" />
        ))}
      {hasMore && !isLoading && visible.length < maxItems && (
        <button type="button" className="template-grid__more" onClick={() => loadMore()}>
          โหลดเพิ่ม
        </button>
      )}
    </div>
  )
})
